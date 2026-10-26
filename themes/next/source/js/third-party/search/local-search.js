/* global CONFIG, pjax */

document.addEventListener('DOMContentLoaded', () => {
  const jsonlPath = CONFIG.path || '/search.jsonl';
  const root = CONFIG.root || '/';
  const workerUrl = (root + 'search-worker.js').replace(/\/+/g, '/');

  let worker = null;
  let isReady = false;
  let totalPostsCount = 0;
  let currentRequestId = 0;
  let selectedIndex = -1;

  const input = document.querySelector('.search-input');
  const container = document.querySelector('.search-result-container');

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 渲染“待搜索 / 索引已就绪”状态页面，替换初始的转圈圈加载动画
  function renderReadyState() {
    if (!container) return;
    container.classList.add('no-result');
    const countText = totalPostsCount > 0 ? `共收录 <b>${totalPostsCount}</b> 篇文章` : '索引已就绪';
    container.innerHTML = `
      <div class="search-result-icon">
        <div class="search-idle-wrap">
          <i class="fa fa-search fa-3x" style="opacity: 0.55; margin-bottom: 12px;"></i>
          <div class="search-ready-info">${countText}</div>
          <div class="search-hint-text">支持标题、全文、#标签、技术关键词检索</div>
          <div class="search-shortcut-hints">
            <span><kbd>↑</kbd> <kbd>↓</kbd> 选择</span>
            <span><kbd>Enter</kbd> 打开</span>
            <span><kbd>Esc</kbd> 关闭</span>
          </div>
        </div>
      </div>
    `;
  }

  // 渲染初始化加载中状态（仅在极短暂的冷启动时展示）
  function renderLoadingState() {
    if (!container) return;
    container.classList.add('no-result');
    container.innerHTML = `
      <div class="search-result-icon">
        <div class="search-idle-wrap">
          <i class="fa fa-spinner fa-pulse fa-3x" style="opacity: 0.7; margin-bottom: 12px;"></i>
          <div class="search-ready-info" style="font-size: 14px;">正在初始化全站索引...</div>
        </div>
      </div>
    `;
  }

  function initWorker() {
    if (worker) return;
    try {
      worker = new Worker(workerUrl);

      worker.postMessage({
        type: 'INIT',
        payload: { url: jsonlPath }
      });

      worker.onmessage = (e) => {
        const { type, payload } = e.data || {};

        if (type === 'cache_ready' || type === 'sync_complete') {
          isReady = true;
          totalPostsCount = payload.totalDocs || payload.count || totalPostsCount;

          // 若输入框已有内容，刷新检索；若为空，立即清除加载中动画并展示就绪状态
          if (input && input.value.trim()) {
            triggerSearch(input.value.trim());
          } else {
            renderReadyState();
          }
        }

        if (type === 'search_results') {
          if (payload.requestId === currentRequestId) {
            renderResults(payload);
          }
        }
      };
    } catch (err) {
      console.error('Failed to initialize search worker:', err);
    }
  }

  function triggerSearch(query) {
    if (!worker) initWorker();
    currentRequestId++;
    worker.postMessage({
      type: 'SEARCH',
      payload: {
        query,
        limit: 20,
        requestId: currentRequestId
      }
    });
  }

  function renderResults({ results, elapsedMs, query }) {
    selectedIndex = -1;
    if (!container) return;

    if (results.length === 0) {
      container.classList.add('no-result');
      const emptyMsg = CONFIG.i18n && CONFIG.i18n.empty
        ? CONFIG.i18n.empty.replace('${query}', escapeHtml(query))
        : `未找到与 “${escapeHtml(query)}” 相关的文章`;

      container.innerHTML = `
        <div class="search-result-icon">
          <div class="search-idle-wrap">
            <i class="far fa-frown fa-3x" style="opacity: 0.6; margin-bottom: 12px;"></i>
            <div class="search-ready-info" style="font-size: 14px; font-weight: normal; color: #888;">${emptyMsg}</div>
          </div>
        </div>
      `;
      return;
    }

    container.classList.remove('no-result');
    const statsText = CONFIG.i18n && CONFIG.i18n.hits
      ? CONFIG.i18n.hits.replace('${hits}', results.length) + ` (${elapsedMs} ms)`
      : `找到 ${results.length} 条结果 (${elapsedMs} ms)`;

    const listHtml = results.map((item, index) => {
      const tagsHtml = (item.tags || []).map(t => `<span class="search-tag-chip">#${escapeHtml(t)}</span>`).join('');
      return `
        <li class="search-result-item" data-index="${index}">
          <a href="${item.url}" class="search-result-title">${item.title}</a>
          ${tagsHtml ? `<div class="search-tags-row">${tagsHtml}</div>` : ''}
          <p class="search-result">${item.snippet}</p>
        </li>
      `;
    }).join('');

    container.innerHTML = `
      <div class="search-stats">${statsText}</div>
      <hr>
      <ul class="search-result-list">${listHtml}</ul>
    `;

    if (typeof pjax === 'object') pjax.refresh(container);
  }

  function updateSelection(items) {
    items.forEach((item, idx) => {
      if (idx === selectedIndex) {
        item.classList.add('active');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  // 绑定输入框检索
  let debounceTimer = null;
  const onInputEvent = () => {
    clearTimeout(debounceTimer);
    const query = input.value.trim();
    if (!query) {
      renderReadyState();
      return;
    }
    debounceTimer = setTimeout(() => triggerSearch(query), 90);
  };

  if (input) {
    input.addEventListener('input', onInputEvent);

    // 键盘上/下光标选择与回车直达
    input.addEventListener('keydown', (e) => {
      if (!container) return;
      const items = container.querySelectorAll('.search-result-item');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        updateSelection(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        updateSelection(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
        const link = items[targetIndex]?.querySelector('a.search-result-title');
        if (link) {
          link.click();
        }
      }
    });
  }

  // 预加载 Worker
  if (CONFIG.localsearch && CONFIG.localsearch.preload) {
    initWorker();
  }

  // 弹窗打开/关闭事件监听
  const onPopupClose = () => {
    document.body.classList.remove('search-active');
  };

  document.querySelectorAll('.popup-trigger').forEach(element => {
    element.addEventListener('click', () => {
      document.body.classList.add('search-active');
      initWorker();

      // 打开时若已就绪且输入框为空，展示待搜索就绪态
      if (!input || !input.value.trim()) {
        if (isReady) {
          renderReadyState();
        } else {
          renderLoadingState();
        }
      }

      setTimeout(() => {
        if (input) input.focus();
      }, 250);
    });
  });

  const overlay = document.querySelector('.search-pop-overlay');
  if (overlay) {
    overlay.addEventListener('click', event => {
      if (event.target === overlay) {
        onPopupClose();
      }
    });
  }

  const closeBtn = document.querySelector('.popup-btn-close');
  if (closeBtn) closeBtn.addEventListener('click', onPopupClose);

  document.addEventListener('pjax:success', () => {
    onPopupClose();
  });

  window.addEventListener('keyup', event => {
    if (event.key === 'Escape') {
      onPopupClose();
    }
  });
});
