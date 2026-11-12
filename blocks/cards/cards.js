import { createOptimizedPicture } from '../../scripts/aem.js';

// tab shape on top of each image card (decorative, copied from the source)
const TAB = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 78.34" preserveAspectRatio="xMidYMid slice" height="78.34" aria-hidden="true" focusable="false">'
  + '<path fill="none" d="M460.71 20.78H.03L.05.02h475.37l-10.11 17.55c-1.25 2.16-2.9 3.32-4.6 3.2"/>'
  + '<path fill="rgb(147 189 43)" d="M474.98 0h549.03v20.78h-570.4l9.7-14.55c2.6-3.89 6.98-6.23 11.67-6.23"/>'
  + '<path fill="rgb(76 169 81)" d="M407.71 78.34H0V20.79h453.61l-34.23 51.32c-2.6 3.9-6.98 6.24-11.67 6.24"/></svg>';

const COLORS = ['blue', 'light-blue', 'green', 'orange'];

function decorateImageCards(block) {
  const grid = document.createElement('ul');
  grid.className = 'image-card-grid';
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture, img'));
    const token = (c) => c.textContent.trim().toLowerCase();
    const colorCell = cells.find((c) => c !== imageCell && COLORS.includes(token(c)));
    const bodyCell = cells.find((c) => c !== imageCell && c !== colorCell);
    const color = colorCell ? token(colorCell) : 'blue';

    const li = document.createElement('li');
    li.className = `image-card image-card-${color}`;

    const shape = document.createElement('div');
    shape.className = 'image-card-shape';
    shape.innerHTML = TAB;

    const media = document.createElement('div');
    media.className = 'image-card-media';
    const overlay = document.createElement('div');
    overlay.className = 'image-card-overlay';
    const frame = document.createElement('div');
    frame.className = 'image-card-image';
    const picture = imageCell ? imageCell.querySelector('picture') || imageCell.querySelector('img') : null;
    if (picture) frame.append(picture);
    media.append(overlay, frame);

    const body = document.createElement('div');
    body.className = 'image-card-body';
    if (bodyCell) {
      const buttons = document.createElement('div');
      buttons.className = 'image-card-buttons';
      [...bodyCell.children].forEach((child) => {
        const links = child.tagName === 'P' ? [...child.querySelectorAll('a')] : [];
        if (links.length && child.textContent.trim() === links.map((a) => a.textContent).join('').trim()) {
          links.forEach((a) => {
            const wrap = document.createElement('div');
            a.className = 'image-card-button';
            wrap.append(a);
            buttons.append(wrap);
          });
        } else body.append(child);
      });
      if (buttons.children.length) body.append(buttons);
    }

    li.append(shape, media, body);
    grid.append(li);
  });
  block.replaceChildren(grid);
}

export default function decorate(block) {
  if (block.classList.contains('image-card')) {
    decorateImageCards(block);
    return;
  }
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
