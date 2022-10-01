/* global CONFIG */

window.addEventListener("tabs:register", () => {
  let { activeClass } = CONFIG.comments;
  if (CONFIG.comments.storage) {
    activeClass = localStorage.getItem("comments_active") || activeClass;
  }
  if (activeClass) {
    const activeTab = document.querySelector(
      `a[href="#comment-${activeClass}"]`
    );
    if (activeTab) {
      activeTab.click();
    }
  }
});
if (CONFIG.comments.storage) {
  window.addEventListener("tabs:click", (event) => {
    if (!event.target.matches(".tabs-comment .tab-content .tab-pane")) return;
    const commentClass = event.target.classList[1];
    localStorage.setItem("comments_active", commentClass);
  });
}

document.addEventListener("visibilitychange", () => {
  console.log()
  if (document.visibilityState === 'hidden') {
    const title = document.title
    document.title = '∑(っ°Д°;)っ '
    setTimeout(()=>{
      document.title = '还会回来的对吧！'
    }, 500)
    setTimeout(()=>{
      document.title = title
    }, 1000)
  } else {
    const title = document.title
    document.title = '(｡･ω･｡)ﾉ♡ 欢迎回来'
    setTimeout(()=>{
      document.title = title
    }, 1000)
  }
});
