const { parentPort, workerData } = require('worker_threads');

const { docs, topN } = workerData;
const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });
const stopWords = new Set(['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', 'the', 'a', 'to', 'in', 'is', 'of', 'and', 'for']);

function tokenize(text) {
  const words = [];
  for (const { segment, isWordLike } of segmenter.segment(text)) {
    const w = segment.toLowerCase();
    if (isWordLike && w.length > 1 && !stopWords.has(w)) {
      words.push(w);
    }
  }
  return words;
}

// 1. 分词 & 统计 TF 与 DF
const docTokens = [];
const df = new Map(); // Document Frequency
let totalLength = 0;

for (const doc of docs) {
  const tf = new Map();
  // 正文分词 (权重 1)
  const contentWords = tokenize(doc.content);
  // 标题分词 (权重 5 - 特征融合)
  const titleWords = tokenize(doc.title);
  
  const addWord = (w, weight) => tf.set(w, (tf.get(w) || 0) + weight);
  
  contentWords.forEach(w => addWord(w, 1));
  titleWords.forEach(w => addWord(w, 5));
  // 标签特征直接作为高权重词融入 (权重 8)
  doc.tags.forEach(t => addWord(`tag:${t.toLowerCase()}`, 8));

  const docLen = contentWords.length + titleWords.length * 5;
  totalLength += docLen;

  for (const word of tf.keys()) {
    df.set(word, (df.get(word) || 0) + 1);
  }

  docTokens.push({ id: doc.id, tf, len: docLen, tags: new Set(doc.tags), categories: new Set(doc.categories) });
}

// 2. 计算 BM25 权重向量 (将其转化为稀疏向量求余弦相似度，比非对称 Query 更快更准)
const N = docs.length;
const avgdl = totalLength / N;
const k1 = 1.5;
const b = 0.75;

const docVectors = docTokens.map(doc => {
  const vec = new Map();
  let norm = 0;
  for (const [word, freq] of doc.tf.entries()) {
    const docFreq = df.get(word) || 0;
    // 标准 BM25 IDF 公式
    const idf = Math.log(1 + (N - docFreq + 0.5) / (docFreq + 0.5));
    // 标准 BM25 TF 饱和度公式
    const weight = idf * ((freq * (k1 + 1)) / (freq + k1 * (1 - b + b * (doc.len / avgdl))));
    vec.set(word, weight);
    norm += weight * weight;
  }
  return { ...doc, vec, norm: Math.sqrt(norm) };
});

// 3. 多维特征融合计算两两相似度
const result = {};

for (let i = 0; i < N; i++) {
  const docA = docVectors[i];
  const scores = [];

  for (let j = 0; j < N; j++) {
    if (i === j) continue;
    const docB = docVectors[j];

    // A. 计算 BM25 向量的余弦相似度
    let dotProduct = 0;
    // 遍历较短的 Map 以提升性能
    const [shorter, longer] = docA.vec.size < docB.vec.size ? [docA.vec, docB.vec] : [docB.vec, docA.vec];
    for (const [word, weightA] of shorter.entries()) {
      if (longer.has(word)) {
        dotProduct += weightA * longer.get(word);
      }
    }
    const bm25Sim = (docA.norm && docB.norm) ? (dotProduct / (docA.norm * docB.norm)) : 0;

    // B. 计算分类重合度加成
    let catMatch = 0;
    for (const c of docA.categories) {
      if (docB.categories.has(c)) catMatch += 1;
    }

    // C. 最终融合得分 (权重可按需调优)
    const finalScore = bm25Sim * 0.8 + (catMatch > 0 ? 0.2 : 0);

    if (finalScore > 0) {
      scores.push({ id: docB.id, score: finalScore });
    }
  }

  // 排序取 Top N
  scores.sort((a, b) => b.score - a.score);
  result[docA.id] = scores.slice(0, topN).map(s => s.id);
}

parentPort.postMessage(result);