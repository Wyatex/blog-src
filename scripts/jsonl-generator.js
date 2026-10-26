const { stripHTML } = require('hexo-util');

hexo.extend.generator.register('search_jsonl', function(locals) {
  // 1. 过滤掉草稿或指定不索引的文章，并【严格按照更新时间 updated 降序排列】
  const posts = locals.posts
    .filter(post => post.indexing !== false)
    .data.sort((a, b) => {
      // Hexo 的 updated/date 是 moment.js 对象，valueOf() 获取毫秒时间戳
      const timeA = (a.updated || a.date).valueOf();
      const timeB = (b.updated || b.date).valueOf();
      return timeB - timeA; // 降序：最新的排最前面
    });

  const lines = [];

  // 2. 【核心改动 1】写入第 1 行：全局元数据（Meta Header）
  // 这一行非常小（几KB），作用是告诉前端全站目前有哪些合法的文章，用来清理已删除的文章
  const allIds = posts.map(p => p.path);
  lines.push(JSON.stringify({
    _type: 'meta',
    total: posts.length,
    allIds: allIds // 所有有效文章的 ID 集合
  }));

  // 3. 【核心改动 2】写入文章数据（增加了 id 和 updated 字段）
  posts.forEach(post => {
    // 剔除 HTML 并压缩空白
    const content = stripHTML(post.content).replace(/\s+/g, ' ').trim();
    const updatedTime = (post.updated || post.date).valueOf();

    lines.push(JSON.stringify({
      id: post.path,       // 唯一主键（建议用 post.path，稳定且唯一）
      t: post.title,       // 标题
      u: post.path,        // 链接
      m: updatedTime,      // Modified: 修改时间戳（用于增量对比）
      c: content           // 纯文本正文
    }));
  });

  return {
    path: 'search.jsonl',
    data: lines.join('\n')
  };
});