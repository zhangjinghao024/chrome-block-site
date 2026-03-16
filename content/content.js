// Monitor SPA client-side navigation and block if domain is in blocklist
(function () {
  const BLOCKED_PAGE = chrome.runtime.getURL('blocked/blocked.html');

  // Don't run on the blocked page itself
  if (location.href.startsWith(BLOCKED_PAGE)) return;

  function getCurrentDomain() {
    return location.hostname.replace(/^www\./, '');
  }

  function checkAndBlock() {
    const domain = getCurrentDomain();
    chrome.storage.sync.get('blockedSites', ({ blockedSites = [] }) => {
      if (blockedSites.includes(domain)) {
        location.replace(`${BLOCKED_PAGE}?site=${encodeURIComponent(location.href)}`);
      }
    });
  }

  // Intercept history.pushState and history.replaceState
  const _pushState = history.pushState.bind(history);
  const _replaceState = history.replaceState.bind(history);

  history.pushState = function (...args) {
    _pushState(...args);
    checkAndBlock();
  };

  history.replaceState = function (...args) {
    _replaceState(...args);
    checkAndBlock();
  };

  // Handle back/forward navigation
  window.addEventListener('popstate', checkAndBlock);

  // Initial check (in case the page was already loaded when the rule was added)
  checkAndBlock();
})();
