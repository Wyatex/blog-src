const { Worker } = require('worker_threads');
const path = require('path');
const fs = require('fs');

let relatedCache = null;

// 1. 在生成前通过多线程计算所有关联关系
hexo.extend.filter.register('before_generate', async function() {
  // 必须主动刷新 locals 缓存，避免 hexo server 监听到中间态或空缓存
  this.locals.invalidate();

  const posts = this.locals.get('posts').filter(p => p.published !== false).toArray();
  if (posts.length === 0) return;

  const rawDocs = posts.map(post => ({
    id: post._id,
    path: post.path,
    title: post.title || '',
    content: (post.content || post.raw || '').replace(/<[^>]+>/g, ''),
    tags: post.tags && post.tags.length ? post.tags.map(t => String(t.name)) : [],
    categories: post.categories && post.categories.length ? post.categories.map(c => String(c.name)) : []
  }));

  const workerFile = path.join(hexo.base_dir, 'workers/bm25-worker.js');
  if (!fs.existsSync(workerFile)) return;

  const relatedMap = await new Promise((resolve, reject) => {
    const worker = new Worker(workerFile, {
      workerData: { docs: rawDocs, topN: 5 }
    });
    worker.on('message', resolve);
    worker.on('error', reject);
  });

  // 双向建立 _id 与 path 的映射缓存，确保模板上下文能快速匹配
  const pathMap = new Map(rawDocs.map(d => [d.id, d.path]));
  relatedCache = Object.create(null);

  for (const [id, relatedIds] of Object.entries(relatedMap)) {
    const matchedPaths = relatedIds.map(rid => pathMap.get(rid)).filter(Boolean);
    relatedCache[id] = matchedPaths;
    const postPath = pathMap.get(id);
    if (postPath) {
      relatedCache[postPath] = matchedPaths;
    }
  }
});

// 2. 注入到模板渲染上下文中，确保 page.related_posts 100% 存在
hexo.extend.filter.register('template_locals', function(locals) {
  if (relatedCache && locals.page) {
    const key = locals.page._id || locals.page.path;
    if (key && !locals.page.related_posts) {
      locals.page.related_posts = relatedCache[key] || [];
    }
  }
  return locals;
});
