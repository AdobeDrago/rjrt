const OVERLAY = '/images/full-hero-overlay.png';

/**
 * Full-bleed hero: row 1 = background image, row 2 = heading (and optional text).
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  const picture = block.querySelector('picture') || block.querySelector('img');
  const content = [...block.querySelectorAll(':scope > div > div')].find((cell) => cell.querySelector('h1, h2, h3, p:not(:has(picture))'));

  const bg = document.createElement('div');
  bg.className = 'hero-bg';
  const overlay = document.createElement('div');
  overlay.className = 'hero-overlay';
  const shade = document.createElement('img');
  shade.src = `${window.hlx.codeBasePath}${OVERLAY}`;
  shade.alt = '';
  shade.width = 801;
  shade.height = 435;
  shade.loading = 'eager';
  overlay.append(shade);
  const media = document.createElement('div');
  media.className = 'hero-media';
  if (picture) {
    const img = picture.tagName === 'IMG' ? picture : picture.querySelector('img');
    if (img) { img.loading = 'eager'; img.fetchPriority = 'high'; }
    media.append(picture);
  }
  bg.append(overlay, media);

  const inner = document.createElement('div');
  inner.className = 'hero-content container';
  if (content) inner.append(...content.childNodes);
  inner.querySelectorAll('p:empty').forEach((p) => p.remove());

  block.replaceChildren(bg, inner);
}
