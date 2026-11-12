import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const el = (tag, cls) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
};

/**
 * Footer from the /footer fragment: [logo link + legal links] [disclaimer] [copyright]
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  const [brandSec, textSec, copySec] = fragment ? [...fragment.children] : [];
  block.textContent = '';

  const top = el('div', 'footer-top container');
  const row = el('div', 'footer-row');
  if (brandSec) {
    const logo = brandSec.querySelector('.icon img, img');
    const link = [...brandSec.querySelectorAll('a')].find((a) => a.contains(logo)) || brandSec.querySelector('p a');
    const home = el('a', 'footer-brand');
    home.href = link ? link.href : '/';
    const sr = el('span', 'sr-only');
    sr.textContent = link ? link.textContent.trim() || 'Home' : 'Home';
    home.append(sr);
    if (logo) { logo.alt = 'Reynolds Tobacco'; home.append(logo); }
    row.append(home);
    const list = brandSec.querySelector('ul');
    if (list) {
      const nav = el('nav', 'footer-nav');
      nav.setAttribute('aria-label', 'Legal Navigation');
      nav.append(list);
      row.append(nav);
    }
  }
  top.append(row);
  block.append(top);

  if (textSec) {
    const text = el('div', 'footer-text container');
    const inner = el('div');
    inner.append(...textSec.querySelectorAll('p'));
    text.append(inner);
    block.append(text);
  }
  if (copySec) {
    const copy = el('div', 'footer-copy container');
    const span = el('span');
    span.textContent = copySec.textContent.trim();
    copy.append(span);
    block.append(copy);
  }
}
