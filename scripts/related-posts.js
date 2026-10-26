const { Worker } = require('worker_threads');
const path = require('path');

let relatedCache = null;

// 1. 在生成前通过多线程计算所有关联关系
hexo.extend.filter.register('before_generate', async function() {
  const posts = this.locals.get('posts').toArray();
  if (posts.length === 0) return;

  const rawDocs = posts.map(post => ({
    id: post._id,
    path: post.path,
    title: post.title || '',
    content: (post.content || post.raw || '').replace(/<[^>]+>/g, ''), 
    tags: post.tags ? post.tags.map(t => t.name) : [],
    categories: post.categories ? post.categories.map(c => c.name) : []
  }));

  const relatedMap = await new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, '../workers/bm25-worker.js'), {
      workerData: { docs: rawDocs, topN: 5 }
    });
    worker.on('message', resolve);
    worker.on('error', reject);
  });

  // 将 id 映射为 path 数组（完全兼容原版 hexo-related-posts 格式）
  const pathMap = new Map(rawDocs.map(d => [d.id, d.path]));
  relatedCache = {};
  for (const [id, relatedIds] of Object.entries(relatedMap)) {
    relatedCache[id] = relatedIds.map(rid => pathMap.get(rid)).filter(Boolean);
  }
});

// 2. 注入到模板渲染上下文中，确保 page.related_posts 100% 存在
hexo.extend.filter.register('template_locals', function(locals) {
  if (relatedCache && locals.page && locals.page._id) {
    if (!locals.page.related_posts) {
      locals.page.related_posts = relatedCache[locals.page._id] || [];
    }
  }
  return locals;
});