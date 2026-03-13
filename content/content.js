(async () => {
  const { imageFilterEnabled } = await chrome.storage.sync.get('imageFilterEnabled');
  if (!imageFilterEnabled) return;

  // Load local NSFWJS model
  const modelURL = chrome.runtime.getURL('lib/model/model.json');
  let model;
  try {
    model = await nsfwjs.load(modelURL, { size: 224 });
  } catch (err) {
    console.warn('[BlockSite] NSFWJS model load failed:', err);
    return;
  }

  const NSFW_THRESHOLD = 0.7;
  const NSFW_CLASSES = new Set(['Porn', 'Hentai', 'Sexy']);

  async function classifyImage(img) {
    if (img.naturalWidth < 100 || img.naturalHeight < 100) return;
    try {
      const predictions = await model.classify(img);
      const nsfw = predictions.find(p => NSFW_CLASSES.has(p.className) && p.probability >= NSFW_THRESHOLD);
      if (nsfw) {
        img.classList.add('nsfw-blocked');
        img.title = 'NSFW content hidden by Block Site';
      }
    } catch (_) {}
  }

  const intersectionObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      intersectionObserver.unobserve(entry.target);
      classifyImage(entry.target);
    }
  }, { threshold: 0.1 });

  function scanImages() {
    document.querySelectorAll('img:not([data-nsfw-scanned])').forEach(img => {
      img.dataset.nsfwScanned = '1';
      if (img.complete && img.naturalWidth > 0) {
        intersectionObserver.observe(img);
      } else {
        img.addEventListener('load', () => intersectionObserver.observe(img), { once: true });
      }
    });
  }

  const mutationObserver = new MutationObserver(scanImages);
  mutationObserver.observe(document.body, { childList: true, subtree: true });
  scanImages();
})();
