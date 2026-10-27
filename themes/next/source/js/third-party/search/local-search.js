/* global CONFIG, pjax */

document.addEventListener('DOMContentLoaded', () => {
  const jsonlPath = CONFIG.path || '/search.jsonl';
  const root = CONFIG.root || '/';
  const workerUrl = (root + 'search-worker.js').replace(/\/+/g, '/');

  let worker = null;
  let isReady = false;          // 是否已有文章可搜 (loadedCount > 0)
  let isSyncComplete = false;   // 全站索引是否已全部拉取并同步完毕
  let loadedCount = 0;          // 当前已加载的文章数
  let totalCount = 0;           // 全站文章总数
  let currentRequestId = 0;
  let selectedIndex = -1;
  let autoRefreshTimer = null;  // 流式同步期间的自动重新搜索防抖定时器

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

  // 获取搜索统计栏左侧的加载状态标签（加载中 数量/总数 或 加载完成）
  function getProgressStatusHtml() {
    if (!isSyncComplete && totalCount > 0) {
      return `<span class="search-progress-status loading"><i class="fa fa-spinner fa-pulse"></i> 加载中 ${loadedCount}/${totalCount}</span>`;
    }
    if (isSyncComplete) {
      return `<span class="search-progress-status complete"><i class="fa fa-check-circle"></i> 加载完成</span>`;
    }
    return '';
  }

  // 渲染“全站索引已就绪”状态（全部加载完成后，输入框为空时展示）
  function renderReadyState() {
    if (!container) return;
    container.classList.add('no-result');
    const countText = totalCount > 0 ? `共收录 <b>${totalCount}</b> 篇文章` : '索引已就绪';
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

  // 渲染流式同步进度状态（显示当前加载数量/总文章数量，边加载即可搜）
  function renderProgressState() {
    if (!container) return;
    container.classList.add('no-result');
    const percent = totalCount > 0 ? Math.min(100, Math.round((loadedCount / totalCount) * 100)) : 0;
    const countText = totalCount > 0
      ? `已加载 <b>${loadedCount}</b> / <b>${totalCount}</b> 篇文章 (${percent}%)`
      : (loadedCount > 0 ? `已加载 <b>${loadedCount}</b> 篇文章...` : '正在连接文章索引源...');

    container.innerHTML = `
      <div class="search-result-icon">
        <div class="search-idle-wrap">
          <i class="fa fa-spinner fa-pulse fa-3x" style="opacity: 0.7; margin-bottom: 12px; color: #2563eb;"></i>
          <div class="search-ready-info" style="font-size: 15px;">正在同步全站索引...</div>
          <div class="search-progress-bar-wrap">
            <div class="search-progress-bar" style="width: ${percent}%;"></div>
          </div>
          <div class="search-progress-text">${countText}</div>
          <div class="search-hint-text" style="margin-top: 10px;">已加载内容可直接输入搜索，无需等待全部完成</div>
          <div class="search-shortcut-hints" style="margin-top: 4px;">
            <span><kbd>Esc</kbd> 关闭</span>
          </div>
        </div>
      </div>
    `;
  }

  // 渲染初始化加载中状态（仅在极短暂的冷启动握手时展示）
  function renderLoadingState() {
    if (!container) return;
    container.classList.add('no-result');
    container.innerHTML = `
      <div class="search-result-icon">
        <div class="search-idle-wrap">
          <i class="fa fa-spinner fa-pulse fa-3x" style="opacity: 0.7; margin-bottom: 12px; color: #2563eb;"></i>
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

        if (type === 'cache_ready') {
          isReady = true;
          loadedCount = payload.count || loadedCount;
          if (!totalCount) totalCount = payload.count;

          if (input && input.value.trim()) {
            triggerSearch(input.value.trim());
          } else {
            renderProgressState();
          }
        }

        if (type === 'progress') {
          if (payload.loaded > 0) isReady = true;
          loadedCount = payload.loaded;
          totalCount = payload.total;

          const query = input ? input.value.trim() : '';
          if (!query) {
            renderProgressState();
          } else {
            // 用户正在搜索中：如果处于无结果等待态，刷新进度条
            if (container && container.classList.contains('no-result')) {
              const emptyTitle = container.querySelector('.search-ready-info');
              if (emptyTitle && emptyTitle.textContent.includes('未在已加载文章中找到')) {
                const bar = container.querySelector('.search-progress-bar');
                const text = container.querySelector('.search-progress-text');
                const percent = totalCount > 0 ? Math.min(100, Math.round((loadedCount / totalCount) * 100)) : 0;
                if (bar) bar.style.width = `${percent}%`;
                if (text) text.textContent = `正在加载其余文章 (${loadedCount}/${totalCount})...`;
              }
            } else {
              // 若已有搜索结果列表，实时更新统计栏左侧的加载状态
              const statusEl = container ? container.querySelector('.search-progress-status') : null;
              if (statusEl) {
                statusEl.className = 'search-progress-status loading';
                statusEl.innerHTML = `<i class="fa fa-spinner fa-pulse"></i> 加载中 ${loadedCount}/${totalCount}`;
              }
            }

            // 流式拉取期间自动防抖刷新当前检索词，让新载入的匹配文章无缝呈现
            clearTimeout(autoRefreshTimer);
            autoRefreshTimer = setTimeout(() => {
              if (input && input.value.trim() === query && !isSyncComplete) {
                triggerSearch(query, true);
              }
            }, 180);
          }
        }

        if (type === 'sync_complete') {
          isReady = true;
          isSyncComplete = true;
          loadedCount = payload.totalDocs || loadedCount;
          totalCount = payload.totalDocs || totalCount;

          // 若界面已有结果，即时更新左侧状态标签为“加载完成”
          const statusEl = container ? container.querySelector('.search-progress-status') : null;
          if (statusEl) {
            statusEl.className = 'search-progress-status complete';
            statusEl.innerHTML = `<i class="fa fa-check-circle"></i> 加载完成`;
          }

          const query = input ? input.value.trim() : '';
          if (!query) {
            renderReadyState();
          } else {
            // 全站同步完成，进行最终检索以确保结果 100% 完整
            triggerSearch(query, true);
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

  function triggerSearch(query, isAutoRefresh = false) {
    if (!worker) initWorker();
    currentRequestId++;
    if (!isAutoRefresh) {
      selectedIndex = -1;
    }
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
    if (!container) return;

    if (results.length === 0) {
      container.classList.add('no-result');

      if (!isSyncComplete) {
        // 处于流式加载中时，显示友好的阶段性提示与进度，避免误导用户以为全站无结果
        const percent = totalCount > 0 ? Math.min(100, Math.round((loadedCount / totalCount) * 100)) : 0;
        const progressText = totalCount > 0
          ? `正在加载其余文章 (${loadedCount}/${totalCount})...`
          : `正在加载中 (${loadedCount} 篇)...`;

        container.innerHTML = `
          <div class="search-result-icon">
            <div class="search-idle-wrap">
              <i class="fa fa-spinner fa-pulse fa-3x" style="opacity: 0.7; margin-bottom: 12px; color: #2563eb;"></i>
              <div class="search-ready-info" style="font-size: 14px; color: #4b5563;">
                未在已加载文章中找到 “${escapeHtml(query)}”
              </div>
              <div class="search-progress-bar-wrap">
                <div class="search-progress-bar" style="width: ${percent}%;"></div>
              </div>
              <div class="search-progress-text">${progressText}</div>
            </div>
          </div>
        `;
      } else {
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
      }
      return;
    }

    container.classList.remove('no-result');

    const baseHits = CONFIG.i18n && CONFIG.i18n.hits
      ? CONFIG.i18n.hits.replace('${hits}', results.length) + ` (${elapsedMs} ms)`
      : `找到 ${results.length} 条结果 (${elapsedMs} ms)`;

    // 在搜索结果文本左边加上加载进度，如 [加载中 35/186] 或 [加载完成]
    const statusHtml = getProgressStatusHtml();
    const statsText = `${statusHtml}<span class="search-stats-hits">${baseHits}</span>`;

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
      if (isSyncComplete) {
        renderReadyState();
      } else if (loadedCount > 0 || totalCount > 0) {
        renderProgressState();
      } else {
        renderLoadingState();
      }
      return;
    }
    // 关键：已加载的能直接进行搜索，无需等待整个 jsonl 完成
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

      // 打开时根据当前状态呈现
      if (!input || !input.value.trim()) {
        if (isSyncComplete) {
          renderReadyState();
        } else if (loadedCount > 0 || totalCount > 0) {
          renderProgressState();
        } else if (isReady) {
          renderReadyState();
        } else {
          renderLoadingState();
        }
      } else {
        triggerSearch(input.value.trim());
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
