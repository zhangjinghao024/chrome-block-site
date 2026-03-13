const blockBtn = document.getElementById('blockCurrent');
const currentSiteEl = document.getElementById('currentSite');
const manualInput = document.getElementById('manualInput');
const addManualBtn = document.getElementById('addManual');
const feedbackEl = document.getElementById('feedback');
const countEl = document.getElementById('count');
const manageLink = document.getElementById('manageLink');
const adultToggle = document.getElementById('adultToggle');
const imageToggle = document.getElementById('imageToggle');

let currentDomain = null;

function showFeedback(msg, type) {
  feedbackEl.textContent = msg;
  feedbackEl.className = `feedback ${type}`;
  setTimeout(() => { feedbackEl.textContent = ''; feedbackEl.className = 'feedback'; }, 2500);
}

async function refreshCount() {
  const { blockedSites = [] } = await chrome.storage.sync.get('blockedSites');
  countEl.textContent = blockedSites.length;
}

async function init() {
  // Get current tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url && tab.url.startsWith('http')) {
    try {
      const url = new URL(tab.url);
      currentDomain = url.hostname.replace(/^www\./, '');
      currentSiteEl.textContent = currentDomain;
    } catch {
      blockBtn.disabled = true;
      currentSiteEl.textContent = 'Not a web page';
    }
  } else {
    blockBtn.disabled = true;
    currentSiteEl.textContent = 'Not a web page';
  }

  refreshCount();

  // Load filter toggle states
  const { adultFilterEnabled = false, imageFilterEnabled = false } =
    await chrome.storage.sync.get(['adultFilterEnabled', 'imageFilterEnabled']);
  adultToggle.checked = adultFilterEnabled;
  imageToggle.checked = imageFilterEnabled;
}

adultToggle.addEventListener('change', async () => {
  await chrome.runtime.sendMessage({ action: 'setAdultFilter', enabled: adultToggle.checked });
});

imageToggle.addEventListener('change', async () => {
  await chrome.runtime.sendMessage({ action: 'setImageFilter', enabled: imageToggle.checked });
});

blockBtn.addEventListener('click', async () => {
  if (!currentDomain) return;
  const res = await chrome.runtime.sendMessage({ action: 'addSite', domain: currentDomain });
  if (res.success) {
    showFeedback(`Blocked: ${res.domain}`, 'success');
    refreshCount();
  } else {
    showFeedback(res.error, 'error');
  }
});

addManualBtn.addEventListener('click', async () => {
  const val = manualInput.value.trim();
  if (!val) return;
  const res = await chrome.runtime.sendMessage({ action: 'addSite', domain: val });
  if (res.success) {
    showFeedback(`Blocked: ${res.domain}`, 'success');
    manualInput.value = '';
    refreshCount();
  } else {
    showFeedback(res.error, 'error');
  }
});

manualInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addManualBtn.click();
});

manageLink.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

init();
