const newSiteInput = document.getElementById('newSite');
const addBtn = document.getElementById('addBtn');
const addFeedback = document.getElementById('addFeedback');
const siteList = document.getElementById('siteList');
const totalCount = document.getElementById('totalCount');
const adultFilterToggle = document.getElementById('adultFilterToggle');
const imageFilterToggle = document.getElementById('imageFilterToggle');

function showFeedback(msg, type) {
  addFeedback.textContent = msg;
  addFeedback.className = `feedback ${type}`;
  setTimeout(() => { addFeedback.textContent = ''; addFeedback.className = 'feedback'; }, 2500);
}

async function loadList() {
  const { blockedSites = [] } = await chrome.storage.sync.get('blockedSites');
  totalCount.textContent = blockedSites.length;

  siteList.innerHTML = '';

  if (blockedSites.length === 0) {
    siteList.innerHTML = '<li class="empty-state">No sites blocked yet.</li>';
    return;
  }

  blockedSites.forEach(domain => {
    const li = document.createElement('li');

    const nameEl = document.createElement('span');
    nameEl.className = 'site-name';
    nameEl.textContent = domain;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '×';
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', async () => {
      await chrome.runtime.sendMessage({ action: 'removeSite', domain });
      loadList();
    });

    li.appendChild(nameEl);
    li.appendChild(removeBtn);
    siteList.appendChild(li);
  });
}

addBtn.addEventListener('click', async () => {
  const val = newSiteInput.value.trim();
  if (!val) return;
  const res = await chrome.runtime.sendMessage({ action: 'addSite', domain: val });
  if (res.success) {
    showFeedback(`Blocked: ${res.domain}`, 'success');
    newSiteInput.value = '';
    loadList();
  } else {
    showFeedback(res.error, 'error');
  }
});

newSiteInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addBtn.click();
});

// Load filter toggle states
async function loadFilterToggles() {
  const { adultFilterEnabled = false, imageFilterEnabled = false } =
    await chrome.storage.sync.get(['adultFilterEnabled', 'imageFilterEnabled']);
  adultFilterToggle.checked = adultFilterEnabled;
  imageFilterToggle.checked = imageFilterEnabled;
}

adultFilterToggle.addEventListener('change', async () => {
  await chrome.runtime.sendMessage({ action: 'setAdultFilter', enabled: adultFilterToggle.checked });
});

imageFilterToggle.addEventListener('change', async () => {
  await chrome.runtime.sendMessage({ action: 'setImageFilter', enabled: imageFilterToggle.checked });
});

// Reload list if storage changes (e.g. popup added a site)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedSites) loadList();
  if (changes.adultFilterEnabled || changes.imageFilterEnabled) loadFilterToggles();
});

loadList();
loadFilterToggles();
