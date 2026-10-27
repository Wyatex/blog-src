/**
 * search-worker.js
 * 高性能博客全文搜索 Worker 引擎
 * 技术栈：Fetch Stream + IndexedDB 增量持久化 + Intl.Segmenter 中英文分词 + BM25 排序 + 词条协同奖励与短语精确命中
 */

const DB_NAME = 'HexoBlogSearchDB';
const DB_VERSION = 2;
const STORE_NAME = 'posts';

// BM25 超参数
const BM25_K1 = 1.5;         // 词频饱和度控制 (1.2 ~ 2.0)
const BM25_B = 0.75;         // 文档长度归一化因子 (0 ~ 1)

// 权重体系
const TITLE_WEIGHT = 4.0;    // 标题词频权重倍率
const TAG_WEIGHT = 3.0;      // 标签词频权重
const CATEGORY_WEIGHT = 2.5; // 分类词频权重
const CONTENT_WEIGHT = 1.0;  // 正文词频权重

// 排序加成
const EXACT_TITLE_BOOST = 8.0;     // 标题包含完整检索词加成
const EXACT_PHRASE_BOOST = 4.0;    // 正文包含完整检索词加成
const ALL_TERMS_MATCH_BOOST = 1.6; // 命中全部查询分词时的倍率加成

// 高频停用词表（仅在多词查询时过滤，避免单字泛滥影响排序与高亮）
const STOP_WORDS = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
  '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
  '自己', '这', '那', '与', '及', '等', '或', '之', '为', '以', '所', '对',
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is'
]);

// 初始化分词器
const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });

// 倒排索引与文档字典
const invertedIndex = new Map(); // Map<term, Map<docId, weightedTF>>
const docStore = new Map();      // Map<docId, { id, t, u, m, g, k, c, dl, tf }>
let totalDocLength = 0;          // 所有文档的加权有效长度总和
let avgDocLength = 0;            // 平均文档有效长度

// ==========================================
// 1. IndexedDB 存储封装
// ==========================================
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAllCachedPosts(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const map = new Map();
      for (const item of req.result) {
        map.set(item.id, item);
      }
      resolve(map);
    };
    req.onerror = () => reject(req.error);
  });
}

function applyDBChanges(db, toPut, toDelete) {
  if (toPut.length === 0 && toDelete.length === 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const id of toDelete) store.delete(id);
    for (const item of toPut) store.put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ==========================================
// 2. 分词与预处理
// ==========================================
function tokenize(text) {
  if (!text) return [];
  const tokens = [];
  // 规范化特殊技术词汇
  const normalized = String(text)
    .replace(/c\+\+/gi, 'cpp')
    .replace(/c\#/gi, 'csharp');

  for (const { segment, isWordLike } of segmenter.segment(normalized)) {
    if (isWordLike) {
      const lower = segment.toLowerCase().trim();
      if (lower) tokens.push(lower);
    }
  }
  return tokens;
}

function processPost(rawPost) {
  const titleTokens = tokenize(rawPost.t);
  const tagTokens = tokenize((rawPost.g || []).join(' '));
  const catTokens = tokenize((rawPost.k || []).join(' '));
  const contentTokens = tokenize(rawPost.c);

  const tf = Object.create(null);

  // 统计加权词频
  for (const token of titleTokens) {
    tf[token] = (tf[token] || 0) + TITLE_WEIGHT;
  }
  for (const token of tagTokens) {
    tf[token] = (tf[token] || 0) + TAG_WEIGHT;
  }
  for (const token of catTokens) {
    tf[token] = (tf[token] || 0) + CATEGORY_WEIGHT;
  }
  for (const token of contentTokens) {
    tf[token] = (tf[token] || 0) + CONTENT_WEIGHT;
  }

  // 有效文档长度
  const dl = titleTokens.length * TITLE_WEIGHT +
             tagTokens.length * TAG_WEIGHT +
             catTokens.length * CATEGORY_WEIGHT +
             contentTokens.length * CONTENT_WEIGHT;

  return {
    id: rawPost.id,
    t: rawPost.t || '',
    u: rawPost.u || rawPost.id,
    m: rawPost.m || 0,
    g: rawPost.g || [],
    k: rawPost.k || [],
    c: rawPost.c || '',
    dl,
    tf
  };
}

// ==========================================
// ==========================================
// 3. 动态索引维护（支持流式增量即时可搜）
// ==========================================
function addPostToIndex(post) {
  if (!post || !post.id) return;
  if (docStore.has(post.id)) {
    removePostFromIndex(post.id);
  }
  docStore.set(post.id, {
    id: post.id,
    t: post.t,
    u: post.u,
    m: post.m,
    g: post.g || [],
    k: post.k || [],
    c: post.c,
    dl: post.dl,
    tf: post.tf
  });
  totalDocLength += post.dl;

  const tfMap = post.tf || {};
  for (const term in tfMap) {
    let postings = invertedIndex.get(term);
    if (!postings) {
      postings = new Map();
      invertedIndex.set(term, postings);
    }
    postings.set(post.id, tfMap[term]);
  }
  avgDocLength = docStore.size > 0 ? (totalDocLength / docStore.size) : 1;
}

function removePostFromIndex(docId) {
  const doc = docStore.get(docId);
  if (!doc) return;
  totalDocLength -= doc.dl;
  docStore.delete(docId);

  const tfMap = doc.tf || {};
  for (const term in tfMap) {
    const postings = invertedIndex.get(term);
    if (postings) {
      postings.delete(docId);
      if (postings.size === 0) {
        invertedIndex.delete(term);
      }
    }
  }
  avgDocLength = docStore.size > 0 ? (totalDocLength / docStore.size) : 1;
}

function buildInvertedIndex(localMap) {
  invertedIndex.clear();
  docStore.clear();
  totalDocLength = 0;

  for (const post of localMap.values()) {
    addPostToIndex(post);
  }
}

// ==========================================
// 4. 流式拉取 JSONL + 智能增量终止与即时索引
// ==========================================
async function syncJsonlStream(url, localMap) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`拉取索引失败: HTTP ${response.status}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  let meta = null;
  let lastMissingIndex = -1;
  let postIndex = 0;

  const toPut = [];
  const toDelete = [];
  let canceledEarly = false;

  let lastProgressTime = 0;
  function reportProgress(force = false) {
    const now = performance.now();
    if (!force && now - lastProgressTime < 40) return;
    lastProgressTime = now;
    const total = meta ? meta.total : (localMap.size || docStore.size || 0);
    // 从 0 开始，真实反映当前流式拉取/同步的文章数量
    const loaded = postIndex;
    self.postMessage({
      type: 'progress',
      payload: {
        loaded,
        total,
        percent: total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0,
        updated: toPut.length,
        scanned: postIndex
      }
    });
  }

  outer: while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // 保留尚未接收完整的尾行

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      let data;
      try {
        data = JSON.parse(line);
      } catch (err) {
        continue;
      }

      // --- 处理第 1 行：Meta Header ---
      if (data._type === 'meta') {
        meta = data;
        const validIds = new Set(meta.allIds);

        // 1. 清除本地缓存中已在服务端删除的文章
        for (const cachedId of localMap.keys()) {
          if (!validIds.has(cachedId)) {
            toDelete.push(cachedId);
            localMap.delete(cachedId);
            removePostFromIndex(cachedId);
          }
        }

        // 2. 检查本地是否缺失旧文章（防止上次同步中途关闭网页）
        for (let i = 0; i < meta.allIds.length; i++) {
          if (!localMap.has(meta.allIds[i])) {
            lastMissingIndex = i;
          }
        }

        // 收到元数据立即发出首发进度：从 0 开始
        postIndex = 0;
        reportProgress(true);
        continue;
      }

      // --- 处理第 2~N 行：文章数据（按修改时间降序排列） ---
      const currentIndex = postIndex++;
      const cached = localMap.get(data.id);

      // 若命中缓存且修改时间戳完全一致
      if (cached && cached.m === data.m) {
        // 如果此前未在索引中，加入索引
        if (!docStore.has(cached.id)) {
          addPostToIndex(cached);
        }
        // 且当前位置已越过所有缺失旧文章，说明后面的全部本地已有且未改动，直接中断连接！
        if (currentIndex > lastMissingIndex) {
          canceledEarly = true;
          try {
            await reader.cancel('Hit up-to-date cached post, stopping stream.');
          } catch (cancelErr) {
            // 忽略取消流产生的非致命错误
          }
          // 命中后面全量旧缓存，进度直接跳满到 186/186！
          postIndex = meta ? meta.total : (localMap.size || docStore.size);
          reportProgress(true);
          break outer;
        }
        reportProgress(false);
        continue;
      }

      // 新增或内容更新：分词并加入同步队列与当前倒排索引（已加载即可搜！）
      const processed = processPost(data);
      localMap.set(processed.id, processed);
      toPut.push(processed);
      addPostToIndex(processed);

      // 实时通知前台同步进度
      reportProgress(false);
    }
  }

  // 流自然结束（未被 cancel）时，处理 buffer 残留行
  if (!canceledEarly && buffer) {
    buffer += decoder.decode();
    const remaining = buffer.split('\n');
    for (const rawLine of remaining) {
      const line = rawLine.trim();
      if (!line) continue;
      try {
        const data = JSON.parse(line);
        if (data._type !== 'meta') {
          const cached = localMap.get(data.id);
          if (!cached || cached.m !== data.m) {
            const processed = processPost(data);
            localMap.set(processed.id, processed);
            toPut.push(processed);
            addPostToIndex(processed);
          } else if (!docStore.has(cached.id)) {
            addPostToIndex(cached);
          }
        }
      } catch (err) {
        // 忽略残缺行
      }
    }
  }

  if (!canceledEarly && meta && meta.total > 0) {
    postIndex = meta.total;
  }
  reportProgress(true);

  return {
    toPut,
    toDelete,
    canceledEarly,
    scannedCount: postIndex,
    totalCount: meta ? meta.total : (localMap.size || docStore.size)
  };
}

function searchBM25(query, limit = 20) {
  const rawQuery = (query || '').trim();
  if (!rawQuery || docStore.size === 0) return [];

  const rawTokens = tokenize(rawQuery);
  if (rawTokens.length === 0) return [];

  // 多词检索时剔除泛停用词，提升相关度
  let queryTokens = rawTokens;
  if (rawTokens.length > 1) {
    const nonStop = rawTokens.filter(t => !STOP_WORDS.has(t));
    if (nonStop.length > 0) queryTokens = nonStop;
  }

  const uniqueTerms = [...new Set(queryTokens)];
  const lowerQuery = rawQuery.toLowerCase();
  const N = docStore.size;

  // 记录每个文档的得分与命中的词条集合
  const docStats = new Map(); // Map<docId, { score, matchedTerms: Set<term> }>

  for (const term of uniqueTerms) {
    let postings = invertedIndex.get(term);

    // 针对短词或技术英文单词进行前缀命中回退 (例如输入 type 匹配 typescript)
    if (!postings && term.length >= 2 && /^[a-z0-9_-]+$/i.test(term)) {
      for (const [idxTerm, idxPostings] of invertedIndex.entries()) {
        if (idxTerm.startsWith(term)) {
          postings = idxPostings;
          break;
        }
      }
    }

    if (!postings) continue;

    const df = postings.size;
    // Lucene / BM25 严格非负 IDF 公式
    const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));

    for (const [docId, tf] of postings.entries()) {
      const doc = docStore.get(docId);
      if (!doc) continue;

      const dl = doc.dl || 1;
      const numerator = tf * (BM25_K1 + 1);
      const denominator = tf + BM25_K1 * (1 - BM25_B + BM25_B * (dl / avgDocLength));
      const termScore = idf * (numerator / denominator);

      let stat = docStats.get(docId);
      if (!stat) {
        stat = { score: 0, matchedTerms: new Set() };
        docStats.set(docId, stat);
      }
      stat.score += termScore;
      stat.matchedTerms.add(term);
    }
  }

  // 综合排序与加成计算
  const scoredDocs = [];
  const totalTermsCount = uniqueTerms.length;

  for (const [docId, stat] of docStats.entries()) {
    const doc = docStore.get(docId);
    let finalScore = stat.score;

    // 1. 词条协同加成 (Coordination Factor)
    // 命中越多查询词的文档获得越高的优先级，全中给予超额加成
    if (totalTermsCount > 1) {
      const coverage = stat.matchedTerms.size / totalTermsCount;
      finalScore *= (0.5 + 0.5 * coverage);
      if (coverage === 1) {
        finalScore *= ALL_TERMS_MATCH_BOOST;
      }
    }

    // 2. 标题完整包含检索词（Exact Substring Match）
    const lowerTitle = doc.t.toLowerCase();
    if (lowerTitle.includes(lowerQuery)) {
      finalScore += EXACT_TITLE_BOOST;
      if (lowerTitle.startsWith(lowerQuery)) {
        finalScore += EXACT_TITLE_BOOST * 0.5;
      }
    }

    // 3. 正文短语精确匹配
    if (rawQuery.length >= 3 && doc.c.toLowerCase().includes(lowerQuery)) {
      finalScore += EXACT_PHRASE_BOOST;
    }

    // 4. 标签 / 分类命中加成
    if (doc.g && doc.g.some(tag => tag.toLowerCase().includes(lowerQuery))) {
      finalScore += TAG_WEIGHT;
    }
    if (doc.k && doc.k.some(cat => cat.toLowerCase().includes(lowerQuery))) {
      finalScore += CATEGORY_WEIGHT;
    }

    scoredDocs.push({
      docId,
      score: finalScore
    });
  }

  // 降序排序并截取 Top-K
  scoredDocs.sort((a, b) => b.score - a.score);
  const topHits = scoredDocs.slice(0, limit);

  // 生成安全转义的标题、高亮与智能定位摘要
  return topHits.map(({ docId, score }) => {
    const doc = docStore.get(docId);
    return {
      id: doc.id,
      title: highlightText(doc.t, uniqueTerms, rawQuery),
      url: doc.u.startsWith('/') ? doc.u : '/' + doc.u,
      updated: doc.m,
      tags: doc.g || [],
      categories: doc.k || [],
      score: Number(score.toFixed(2)),
      snippet: buildSnippet(doc.c, uniqueTerms, rawQuery)
    };
  });
}

// ==========================================
// 5. 安全高亮与智能摘要生成
// ==========================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, terms, rawQuery) {
  if (!text) return '';
  // 必须先进行 HTML 转义，防止正文中的泛型或标签造成 XSS 或排版异常
  const safeText = escapeHtml(text);

  const candidates = [];
  if (rawQuery && rawQuery.trim().length > 1) {
    candidates.push(escapeHtml(rawQuery.trim()));
  }
  for (const term of terms) {
    if (term.length > 1 || (term.length === 1 && !STOP_WORDS.has(term))) {
      candidates.push(escapeHtml(term));
    }
  }

  if (candidates.length === 0) return safeText;

  // 长词优先匹配，避免短词将长词截断
  const sorted = [...new Set(candidates)].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${sorted.map(escapeRegExp).join('|')})`, 'gi');

  return safeText.replace(pattern, '<mark class="search-keyword">$1</mark>');
}

function buildSnippet(content, terms, rawQuery, windowSize = 130) {
  if (!content) return '';
  const lowerContent = content.toLowerCase();
  let bestIdx = -1;

  // 1. 优先定位完整查询词
  if (rawQuery && rawQuery.trim().length > 1) {
    bestIdx = lowerContent.indexOf(rawQuery.trim().toLowerCase());
  }

  // 2. 否则定位最长/信息量最大的检索词所在位置
  if (bestIdx === -1) {
    const validTerms = terms.filter(t => t.length > 1 || !STOP_WORDS.has(t))
                            .sort((a, b) => b.length - a.length);
    for (const term of validTerms) {
      const idx = lowerContent.indexOf(term);
      if (idx !== -1) {
        bestIdx = idx;
        break;
      }
    }
  }

  // 居中截取上下文
  const start = bestIdx === -1 ? 0 : Math.max(0, bestIdx - 35);
  const end = Math.min(content.length, start + windowSize);
  let snippet = content.slice(start, end);

  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';

  return highlightText(snippet, terms, rawQuery);
}

// ==========================================
// 6. Worker 通信入口
// ==========================================
self.onmessage = async (e) => {
  const { type, payload } = e.data || {};

  if (type === 'INIT') {
    const jsonlUrl = payload?.url || '/search.jsonl';
    const startTime = performance.now();
    try {
      const db = await openDB();
      const localMap = await getAllCachedPosts(db);

      // 本地有缓存，立即构建索引实现首屏秒搜
      if (localMap.size > 0) {
        buildInvertedIndex(localMap);
        self.postMessage({
          type: 'cache_ready',
          payload: {
            count: localMap.size,
            totalTerms: invertedIndex.size
          }
        });
      }

      // 后台流式拉取增量更新
      const syncStats = await syncJsonlStream(jsonlUrl, localMap);

      // 持久化变更数据到 IndexedDB
      await applyDBChanges(db, syncStats.toPut, syncStats.toDelete);

      // 若有改动或首次加载，重新构建倒排索引
      if (syncStats.toPut.length > 0 || syncStats.toDelete.length > 0 || docStore.size === 0) {
        buildInvertedIndex(localMap);
      }

      const elapsed = Math.round(performance.now() - startTime);
      self.postMessage({
        type: 'sync_complete',
        payload: {
          totalDocs: docStore.size,
          totalTerms: invertedIndex.size,
          updatedCount: syncStats.toPut.length,
          deletedCount: syncStats.toDelete.length,
          scannedLines: syncStats.scannedCount,
          canceledEarly: syncStats.canceledEarly,
          elapsedMs: elapsed
        }
      });
    } catch (err) {
      self.postMessage({ type: 'error', payload: err.message });
    }
  }

  if (type === 'SEARCH') {
    const t0 = performance.now();
    const results = searchBM25(payload.query, payload.limit || 20);
    const elapsed = (performance.now() - t0).toFixed(2);
    self.postMessage({
      type: 'search_results',
      payload: {
        query: payload.query,
        requestId: payload.requestId,
        results,
        elapsedMs: elapsed
      }
    });
  }

  if (type === 'CLEAR') {
    try {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = () => {
        invertedIndex.clear();
        docStore.clear();
        totalDocLength = 0;
        avgDocLength = 0;
        self.postMessage({ type: 'cleared', payload: true });
      };
    } catch (err) {
      self.postMessage({ type: 'error', payload: err.message });
    }
  }
};
