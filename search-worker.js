const DB_NAME = 'HexoBlogSearchDB';
const DB_VERSION = 1;
const STORE_NAME = 'posts';

// BM25 超参数
const BM25_K1 = 1.5;       // 词频饱和度控制 (通常在 1.2 ~ 2.0)
const BM25_B = 0.75;       // 文档长度归一化因子 (0 ~ 1)
const TITLE_WEIGHT = 3;    // 标题词频权重倍率（标题命中比正文命中更重要）

// 初始化 Intl.Segmenter 分词器 (支持中日韩及英文单词切分)
const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });

// 内存中的全文倒排索引与文档库
const invertedIndex = new Map(); // Map<term, Map<docId, weightedTF>>
const docStore = new Map();      // Map<docId, { id, t, u, m, c, dl }>
let avgDocLength = 0;            // 全局平均文档长度 (avgdl)

// ==========================================
// 1. IndexedDB 封装
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
// 2. Intl.Segmenter 分词与文章预处理
// ==========================================
function tokenize(text) {
  if (!text) return [];
  const tokens = [];
  for (const { segment, isWordLike } of segmenter.segment(text)) {
    if (isWordLike) {
      tokens.push(segment.toLowerCase());
    }
  }
  return tokens;
}

function processPost(rawPost) {
  const titleTokens = tokenize(rawPost.t);
  const contentTokens = tokenize(rawPost.c);
  const tf = Object.create(null);

  // 统计词频 (TF)，标题赋予更高权重
  for (const token of titleTokens) {
    tf[token] = (tf[token] || 0) + TITLE_WEIGHT;
  }
  for (const token of contentTokens) {
    tf[token] = (tf[token] || 0) + 1;
  }

  const dl = titleTokens.length * TITLE_WEIGHT + contentTokens.length;

  return {
    id: rawPost.id,
    t: rawPost.t,
    u: rawPost.u,
    m: rawPost.m,
    c: rawPost.c,
    dl, // 文档长度 (Document Length)
    tf  // 词频字典 (Term Frequency)
  };
}

// ==========================================
// 3. 流式拉取 JSONL + 增量缓存终止 (reader.cancel)
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

  outer: while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // 保留最后一段可能未接收完整的行

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const data = JSON.parse(line);

      // --- 处理第 1 行：Meta Header ---
      if (data._type === 'meta') {
        meta = data;
        const validIds = new Set(meta.allIds);

        // 1. 清理已在 Hexo 中删除的文章
        for (const cachedId of localMap.keys()) {
          if (!validIds.has(cachedId)) {
            toDelete.push(cachedId);
            localMap.delete(cachedId);
          }
        }

        // 2. 检查是否有之前未缓存完整的旧文章（防止上次加载中途关闭网页导致缺漏）
        for (let i = 0; i < meta.allIds.length; i++) {
          if (!localMap.has(meta.allIds[i])) {
            lastMissingIndex = i;
          }
        }
        continue;
      }

      // --- 处理第 2~N 行：文章数据（按修改时间降序） ---
      const currentIndex = postIndex++;
      const cached = localMap.get(data.id);

      // 如果命中本地缓存，且修改时间戳 m 完全一致
      if (cached && cached.m === data.m) {
        // 只要当前位置已经越过了所有缺失文章，说明后面的旧文章本地全都有且未修改，直接中断流！
        if (currentIndex > lastMissingIndex) {
          canceledEarly = true;
          await reader.cancel('Hit up-to-date cached post, stopping stream.');
          break outer;
        }
        // 如果后面还有缺失的旧文章，则跳过当前文章的分词，继续往后读流
        continue;
      }

      // 新增或有更新的文章：执行分词并加入待写入队列
      const processed = processPost(data);
      localMap.set(processed.id, processed);
      toPut.push(processed);

      self.postMessage({
        type: 'progress',
        payload: { updated: toPut.length, scanned: postIndex, total: meta ? meta.total : 0 }
      });
    }
  }

  // 如果流正常读完（未被 cancel），处理 buffer 中可能残留的最后一行
  if (!canceledEarly) {
    buffer += decoder.decode();
    if (buffer.trim()) {
      const data = JSON.parse(buffer.trim());
      if (data._type !== 'meta') {
        const cached = localMap.get(data.id);
        if (!cached || cached.m !== data.m) {
          const processed = processPost(data);
          localMap.set(processed.id, processed);
          toPut.push(processed);
        }
      }
    }
  }

  return {
    toPut,
    toDelete,
    canceledEarly,
    scannedCount: postIndex,
    totalCount: meta ? meta.total : localMap.size
  };
}

// ==========================================
// 4. 构建内存倒排索引 & BM25 搜索算法
// ==========================================
function buildInvertedIndex(localMap) {
  invertedIndex.clear();
  docStore.clear();
  let totalLength = 0;

  for (const post of localMap.values()) {
    docStore.set(post.id, {
      id: post.id,
      t: post.t,
      u: post.u,
      m: post.m,
      c: post.c,
      dl: post.dl
    });
    totalLength += post.dl;

    const tfMap = post.tf;
    for (const term in tfMap) {
      let postings = invertedIndex.get(term);
      if (!postings) {
        postings = new Map();
        invertedIndex.set(term, postings);
      }
      postings.set(post.id, tfMap[term]);
    }
  }

  avgDocLength = docStore.size > 0 ? totalLength / docStore.size : 1;
}

function searchBM25(query, limit = 20) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0 || docStore.size === 0) return [];

  // 去重查询词
  const uniqueQueryTerms = [...new Set(queryTokens)];
  const scores = new Map(); // Map<docId, score>
  const N = docStore.size;

  for (const term of uniqueQueryTerms) {
    const postings = invertedIndex.get(term);
    if (!postings) continue;

    const df = postings.size; // 包含该词的文档数 (Document Frequency)
    // 标准 Robertson-Sparck Jones / Lucene 非负 IDF 公式
    const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));

    for (const [docId, tf] of postings.entries()) {
      const doc = docStore.get(docId);
      const dl = doc.dl;

      // BM25 单项得分计算
      const numerator = tf * (BM25_K1 + 1);
      const denominator = tf + BM25_K1 * (1 - BM25_B + BM25_B * (dl / avgDocLength));
      const termScore = idf * (numerator / denominator);

      scores.set(docId, (scores.get(docId) || 0) + termScore);
    }
  }

  // 按 BM25 分数降序排列
  const ranked = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  // 生成摘要与关键词高亮
  return ranked.map(([docId, score]) => {
    const doc = docStore.get(docId);
    return {
      id: doc.id,
      title: highlightText(doc.t, uniqueQueryTerms),
      url: doc.u.startsWith('/') ? doc.u : '/' + doc.u,
      updated: doc.m,
      score: Number(score.toFixed(4)),
      snippet: buildSnippet(doc.c, uniqueQueryTerms)
    };
  });
}

// 转义正则特殊字符并高亮匹配词
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, terms) {
  if (!text || terms.length === 0) return text;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  return text.replace(pattern, '<mark>$1</mark>');
}

function buildSnippet(content, terms, windowSize = 140) {
  if (!content) return '';
  const lowerContent = content.toLowerCase();
  let firstMatchIdx = -1;

  for (const term of terms) {
    const idx = lowerContent.indexOf(term);
    if (idx !== -1 && (firstMatchIdx === -1 || idx < firstMatchIdx)) {
      firstMatchIdx = idx;
    }
  }

  const start = firstMatchIdx === -1 ? 0 : Math.max(0, firstMatchIdx - 40);
  const end = Math.min(content.length, start + windowSize);
  let excerpt = content.slice(start, end);

  if (start > 0) excerpt = '...' + excerpt;
  if (end < content.length) excerpt = excerpt + '...';

  return highlightText(excerpt, terms);
}

// ==========================================
// 5. Worker 消息监听
// ==========================================
self.onmessage = async (e) => {
  const { type, payload } = e.data;

  if (type === 'INIT') {
    const jsonlUrl = payload?.url || '/search.jsonl';
    const startTime = performance.now();
    try {
      const db = await openDB();
      const localMap = await getAllCachedPosts(db);

      // 如果本地已经有缓存，先立即构建一次索引，让用户可以边同步边搜（秒开体验）
      if (localMap.size > 0) {
        buildInvertedIndex(localMap);
        self.postMessage({
          type: 'cache_ready',
          payload: { count: localMap.size }
        });
      }

      // 流式拉取增量数据
      const syncStats = await syncJsonlStream(jsonlUrl, localMap);

      // 将新增/修改/删除的数据持久化到 IndexedDB
      await applyDBChanges(db, syncStats.toPut, syncStats.toDelete);

      // 若有变更或首次加载，重新构建倒排索引
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
        results,
        elapsedMs: elapsed
      }
    });
  }
};