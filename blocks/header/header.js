import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

// decorative shapes copied from the source (inline so they can stretch with the viewport)
const STRIPE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3840.2 32.78" preserveAspectRatio="xMidYMid slice" height="32.78px" width="100%" aria-hidden="true" focusable="false"><g>'
  + '<path fill="rgb(255 255 255)" d="m1557.43,11.13H9.64l.03-11.13h1562.69l-10.26,9.41c-1.27,1.16-2.94,1.78-4.66,1.72"/>'
  + '<path fill="rgb(30 50 99)" d="m1521.98,32.77H0L.05,11.13h1550.94l-19.94,18.3c-2.47,2.26-5.72,3.46-9.07,3.34"/>'
  + '<path fill="rgb(0 161 220)" d="m1567.55,0h2272.65v11.13H1550.95l7.54-7.79c2.47-2.26,5.72-3.46,9.06-3.34"/></g></svg>';
const CLOSE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M345 137c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-119 119L73 103c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l119 119L39 375c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l119-119L311 409c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-119-119L345 137z"/></svg>';
const BARS = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M0 64H448V96H0V64zM0 224H448v32H0V224zM448 384v32H0V384H448z"/></svg>';

const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
};

// text of a list item without its nested list (DA serves it as <li><p>label</p><ul>)
const labelOf = (li) => {
  const own = li.querySelector(':scope > p, :scope > a, :scope > strong');
  if (own) return own.textContent.trim();
  return [...li.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join('').trim();
};

const linksOf = (li) => [...li.querySelectorAll(':scope > ul > li')].map((sub) => sub.querySelector('a')).filter(Boolean);

function buildToaster(section, statements) {
  const bar = el('div', 'header-toaster');
  const inner = el('div', 'header-toaster-inner');
  const span = el('span');
  const p = section ? section.querySelector('p') : null;
  if (p) span.append(p);
  inner.append(span);
  bar.append(inner);

  const full = el('div', 'header-toaster-full');
  full.id = 'corrective-statements';
  full.setAttribute('role', 'dialog');
  full.setAttribute('aria-modal', 'true');
  full.setAttribute('aria-label', 'Corrective statements');
  full.hidden = true;
  const closeWrap = el('div', 'header-toaster-close-wrap');
  const close = el('button', 'header-toaster-close', CLOSE);
  close.type = 'button';
  close.setAttribute('aria-label', 'Close Toaster');
  closeWrap.append(close);
  const body = el('div', 'header-toaster-body');
  if (statements) {
    const content = statements.querySelector('.default-content-wrapper') || statements;
    [...content.children].forEach((child, i) => {
      // a rule before every statement heading but the first
      if (i > 0 && /^H[1-6]$/.test(child.tagName)) body.append(el('hr'));
      body.append(child);
    });
  }
  full.append(closeWrap, body);

  const setOpen = (open) => {
    full.hidden = !open;
    bar.classList.toggle('is-open', open);
    document.body.classList.toggle('toaster-open', open);
    if (open) close.focus();
  };
  const trigger = span.querySelector('a');
  if (trigger) {
    trigger.classList.add('header-toaster-trigger');
    trigger.setAttribute('href', '#corrective-statements');
    trigger.setAttribute('aria-controls', full.id);
    trigger.addEventListener('click', (e) => { e.preventDefault(); setOpen(true); });
  }
  close.addEventListener('click', () => { setOpen(false); if (trigger) trigger.focus(); });
  full.addEventListener('keydown', (e) => { if (e.code === 'Escape') close.click(); });
  return { bar, full };
}

function buildNav(list, cls, label) {
  const nav = el('nav', `header-nav ${cls}`);
  nav.setAttribute('aria-label', label);
  const ul = el('ul', 'header-nav-list');
  [...(list ? list.children : [])].forEach((li) => {
    const item = el('li', 'header-nav-item');
    const a = el('a', 'header-nav-link');
    a.textContent = labelOf(li);
    const direct = li.querySelector(':scope > a, :scope > p > a');
    const links = linksOf(li);
    if (links.length) {
      a.href = '#';
      a.setAttribute('role', 'button');
      a.setAttribute('aria-expanded', 'false');
    } else if (direct) a.href = direct.href;
    item.append(a);
    ul.append(item);
    item.links = links;
  });
  nav.append(ul);
  return nav;
}

function buildPanel(title, links) {
  const wrap = el('div', 'header-subnav container');
  const inner = el('div', 'header-subnav-inner');
  inner.append(el('div', 'header-subnav-title', title));
  const col = el('div', 'header-subnav-links');
  const ul = el('ul');
  links.forEach((a) => {
    const li = el('li');
    const link = a.cloneNode(true);
    link.className = 'header-subnav-link';
    li.append(link);
    ul.append(li);
  });
  col.append(ul);
  inner.append(col);
  wrap.append(inner);
  return wrap;
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const sections = fragment ? [...fragment.children] : [];
  const [toasterSec, brandSec, navSec, statementsSec] = sections;

  block.textContent = '';
  const { bar, full } = buildToaster(toasterSec, statementsSec);

  const banner = el('div', 'header-banner');
  const white = el('div', 'header-white');
  const header = el('div', 'header-bar container');

  const brand = el('div', 'header-brand');
  const brandLink = brandSec ? brandSec.querySelector('a') : null;
  const logo = brandSec ? brandSec.querySelector('.icon, img') : null;
  const home = el('a', 'header-brand-link');
  home.href = brandLink ? brandLink.href : '/';
  const sr = el('span', 'sr-only');
  sr.textContent = brandLink ? brandLink.textContent.trim() || 'Home' : 'Home';
  home.append(sr);
  if (logo) {
    const img = logo.tagName === 'IMG' ? logo : logo.querySelector('img');
    if (img) {
      img.alt = sr.textContent;
      img.loading = 'eager';
      home.append(img);
    }
  }
  brand.append(home);

  const lists = navSec ? [...navSec.querySelectorAll(':scope .default-content-wrapper > ul, :scope > ul')] : [];
  const top = buildNav(lists[0], 'header-nav-top', 'top navigation');
  const primary = buildNav(lists[1], 'header-nav-primary', 'primary navigation');
  const navs = el('div', 'header-navs');
  navs.append(top, primary);

  const hamburger = el('button', 'header-hamburger', BARS);
  hamburger.type = 'button';
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.setAttribute('aria-expanded', 'false');

  header.append(brand, navs, hamburger);
  white.append(header);

  // dropdown panels: one per item that has links (primary items first, then the top nav)
  const panels = el('div', 'header-subnavs');
  const items = [...primary.querySelectorAll('.header-nav-item'), ...top.querySelectorAll('.header-nav-item')];
  const closeAll = (except) => items.forEach((item) => {
    if (item === except || !item.panel) return;
    item.panel.classList.remove('is-open');
    item.querySelector('a').setAttribute('aria-expanded', 'false');
  });
  items.forEach((item, i) => {
    if (!item.links.length) return;
    const panel = buildPanel(item.textContent, item.links);
    panel.id = `header-subnav-${i}`;
    item.panel = panel;
    const a = item.querySelector('a');
    a.setAttribute('aria-controls', panel.id);
    a.addEventListener('click', (e) => {
      e.preventDefault();
      closeAll(item);
      const open = !panel.classList.contains('is-open');
      panel.classList.toggle('is-open', open);
      a.setAttribute('aria-expanded', String(open));
    });
    panels.append(panel);
  });
  white.append(panels);

  hamburger.addEventListener('click', () => {
    const open = hamburger.getAttribute('aria-expanded') !== 'true';
    hamburger.setAttribute('aria-expanded', String(open));
    banner.classList.toggle('is-menu-open', open);
  });
  document.addEventListener('keydown', (e) => { if (e.code === 'Escape') closeAll(); });
  isDesktop.addEventListener('change', () => {
    hamburger.setAttribute('aria-expanded', 'false');
    banner.classList.remove('is-menu-open');
  });

  banner.append(white, el('div', 'header-stripe', STRIPE));
  block.append(bar, full, banner);
}
