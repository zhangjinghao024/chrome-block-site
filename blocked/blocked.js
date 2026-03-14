const params = new URLSearchParams(location.search);
const site = params.get('site') || 'This site';
document.getElementById('siteName').textContent = site;
document.getElementById('manageLink').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});
