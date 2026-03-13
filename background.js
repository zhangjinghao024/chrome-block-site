const BLOCKED_PAGE = chrome.runtime.getURL('blocked/blocked.html');

// Rebuild all dynamic rules from storage
async function syncRules() {
  const { blockedSites = [] } = await chrome.storage.sync.get('blockedSites');

  const rules = blockedSites.map((domain, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        regexSubstitution: `${BLOCKED_PAGE}?site=\\0`
      }
    },
    condition: {
      regexFilter: `^https?://([^/]*\\.)?${escapeRegex(domain)}(/.*)?$`,
      resourceTypes: ['main_frame']
    }
  }));

  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const existingIds = existing.map(r => r.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingIds,
    addRules: rules
  });
}

function escapeRegex(domain) {
  return domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Add a site to the blocked list
async function addSite(domain) {
  domain = normalizeDomain(domain);
  if (!domain) return { success: false, error: 'Invalid domain' };

  const { blockedSites = [] } = await chrome.storage.sync.get('blockedSites');
  if (blockedSites.includes(domain)) {
    return { success: false, error: 'Already blocked' };
  }

  blockedSites.push(domain);
  await chrome.storage.sync.set({ blockedSites });
  await syncRules();
  return { success: true, domain };
}

// Remove a site from the blocked list
async function removeSite(domain) {
  const { blockedSites = [] } = await chrome.storage.sync.get('blockedSites');
  const updated = blockedSites.filter(s => s !== domain);
  await chrome.storage.sync.set({ blockedSites: updated });
  await syncRules();
  return { success: true };
}

// Extract bare domain from a URL or domain string
function normalizeDomain(input) {
  try {
    input = input.trim();
    if (!input.includes('://')) {
      input = 'https://' + input;
    }
    const url = new URL(input);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// Listen for messages from popup/options
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'addSite') {
    addSite(msg.domain).then(sendResponse);
    return true;
  }
  if (msg.action === 'removeSite') {
    removeSite(msg.domain).then(sendResponse);
    return true;
  }
  if (msg.action === 'getSites') {
    chrome.storage.sync.get('blockedSites').then(({ blockedSites = [] }) => {
      sendResponse({ blockedSites });
    });
    return true;
  }
  if (msg.action === 'setAdultFilter') {
    (async () => {
      await chrome.storage.sync.set({ adultFilterEnabled: msg.enabled });
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: msg.enabled ? ['adult_rules'] : [],
        disableRulesetIds: msg.enabled ? [] : ['adult_rules']
      });
      sendResponse({ success: true });
    })();
    return true;
  }
  if (msg.action === 'setImageFilter') {
    chrome.storage.sync.set({ imageFilterEnabled: msg.enabled }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Re-sync rules on install/update
chrome.runtime.onInstalled.addListener(async () => {
  // Default adult filter to enabled on fresh install
  const { adultFilterEnabled } = await chrome.storage.sync.get('adultFilterEnabled');
  if (adultFilterEnabled === undefined) {
    await chrome.storage.sync.set({ adultFilterEnabled: true });
  }
  syncRules();
});
chrome.runtime.onStartup.addListener(syncRules);
