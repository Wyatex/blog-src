const { stripHTML, unescapeHTML } = require('hexo-util');
const fs = require('fs');
const path = require('path');

/**
 * 清洗 HTML 内容为纯文本：
 * 1. 剥离 HTML 标签
 * 2. 还原命名实体与十进制/十六进制数值实体 (例如 &#123; -> {, &#x27; -> ')
 * 3. 压缩空白字符
 */
function cleanText(str) {
  if (!str) return '';
  const text = unescapeHTML(stripHTML(str))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * 注册 search.jsonl 生成器
 */
hexo.extend.generator.register('search_jsonl', function(locals) {
  const root = hexo.config.root || '/';

  // 1. 过滤草稿及显式忽略索引的文章，按更新时间 updated 降序排列
  const posts = locals.posts
    .filter(post => post.indexing !== false && post.published !== false)
    .data.sort((a, b) => {
      const timeA = (a.updated || a.date).valueOf();
      const timeB = (b.updated || b.date).valueOf();
      return timeB - timeA; // 降序：最新的排最前面
    });

  const lines = [];

  // 2. 写入第 1 行：全局元数据（Meta Header）
  const allIds = posts.map(p => p.path);
  lines.push(JSON.stringify({
    _type: 'meta',
    total: posts.length,
    allIds: allIds
  }));

  // 3. 写入文章数据（包含标题、链接、时间戳、标签、分类、纯文本正文）
  posts.forEach(post => {
    const content = cleanText(post.content);
    const updatedTime = (post.updated || post.date).valueOf();
    
    // 规范化文章绝对链接
    let postUrl = post.path.startsWith('/') ? post.path : (root + post.path);
    postUrl = postUrl.replace(/\/+/g, '/');

    const tags = post.tags && post.tags.length ? post.tags.map(t => t.name) : [];
    const categories = post.categories && post.categories.length ? post.categories.map(c => c.name) : [];

    lines.push(JSON.stringify({
      id: post.path,            // 唯一主键
      t: cleanText(post.title) || 'Untitled', // 标题
      u: postUrl,               // 页面路径
      m: updatedTime,           // 修改时间戳（用于增量更新比对）
      g: tags,                  // 标签列表 (Tags)
      k: categories,            // 分类列表 (Categories)
      c: content                // 纯文本正文
    }));
  });

  return {
    path: 'search.jsonl',
    data: lines.join('\n')
  };
});

/**
 * 注册 search-worker.js 生成器：
 * 保证 hexo generate / hexo server 时，public 目录下自动具备 search-worker.js
 */
hexo.extend.generator.register('search_worker', function() {
  const rootWorker = path.join(hexo.base_dir, 'search-worker.js');
  const sourceWorker = path.join(hexo.source_dir, 'search-worker.js');

  const targetFile = fs.existsSync(rootWorker) ? rootWorker : (fs.existsSync(sourceWorker) ? sourceWorker : null);
  if (targetFile) {
    return {
      path: 'search-worker.js',
      data: () => fs.createReadStream(targetFile)
    };
  }
});
