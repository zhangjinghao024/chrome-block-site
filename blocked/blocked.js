const params = new URLSearchParams(location.search);
const site = params.get('site') || '该网站';
document.getElementById('siteName').textContent = site;
document.getElementById('manageLink').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});
