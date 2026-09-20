const menu = document.querySelector('.menu');
const navigation = document.querySelector('#navigation');
const productMenu = document.querySelector('.products-nav');
menu?.addEventListener('click', () => {
 const open = menu.getAttribute('aria-expanded') !== 'true';
 menu.setAttribute('aria-expanded', String(open));
 navigation.classList.toggle('open', open);
 menu.textContent = open ? 'Fechar' : 'Menu';
 if (!open && productMenu) productMenu.open = false;
});
document.addEventListener('keydown', event => {
 if (event.key === 'Escape' && productMenu?.open) {
  productMenu.open = false;
  productMenu.querySelector('summary').focus();
  return;
 }
 if(event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
 menu.click(); menu.focus();
 }
});
document.addEventListener('click', event => {
 if (productMenu?.open && !productMenu.contains(event.target)) productMenu.open = false;
});
productMenu?.addEventListener('focusout', event => {
 if (event.relatedTarget && !productMenu.contains(event.relatedTarget)) productMenu.open = false;
});
productMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
 productMenu.open = false;
 if (menu?.getAttribute('aria-expanded') === 'true') menu.click();
}));

// Progressive enhancement: all content stays readable without JavaScript.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const compactScreen = matchMedia('(max-width: 760px)');
const story = document.querySelector('.card-story');
const cards = [...document.querySelectorAll('.motion-card')];
let scheduled = false;
const clamp = value => Math.max(0, Math.min(1, value));
function paintScroll() {
 scheduled = false;
 document.body.classList.toggle('scrolled', scrollY > 20);
 if (reducedMotion.matches) {
  cards.forEach(card => card.style.removeProperty('transform'));
  cards.forEach(card => { card.style.removeProperty('opacity'); card.style.removeProperty('z-index'); });
  return;
 }
 if (!story) return;
 const box = story.getBoundingClientRect();
 if (box.bottom < -100 || box.top > innerHeight + 100) return;
 const mobile = compactScreen.matches;
 if (mobile) {
  cards.forEach(card => { card.style.removeProperty('transform'); card.style.removeProperty('opacity'); card.style.removeProperty('z-index'); });
  return;
 }
 const progress = clamp((104 - box.top) / Math.max(1, box.height - innerHeight + 104));
 const position = progress * (cards.length - 1);
 story.style.setProperty('--story-progress', progress);
 cards.forEach((card, index) => {
  const distance = index - position;
  const offset = Math.max(-1.5, Math.min(1.5, distance));
  card.style.transform = `translate(-50%, -50%) translate3d(${offset * 245}px, ${Math.abs(offset) * 24}px, ${-Math.abs(offset) * 240}px) rotateY(${-offset * 42}deg) rotateZ(${offset * 7}deg) scale(${1 - Math.min(1, Math.abs(offset)) * .14})`;
  card.style.opacity = String(Math.max(.12, 1 - Math.abs(distance) * .65));
  card.style.zIndex = String(10 - Math.round(Math.abs(distance) * 3));
 });
}
function requestPaint() {
 if (!scheduled) { scheduled = true; requestAnimationFrame(paintScroll); }
}
addEventListener('scroll', requestPaint, {passive:true});
addEventListener('resize', requestPaint);
reducedMotion.addEventListener('change', requestPaint);
compactScreen.addEventListener('change', requestPaint);
paintScroll();

if (!reducedMotion.matches && 'IntersectionObserver' in window) {
 const observer = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
   entry.target.classList.replace('reveal-pending', 'reveal-ready');
   observer.unobserve(entry.target);
  }
 }, {threshold:.08});
 document.querySelectorAll('.heading, .tile, .campaign, .company, .plan, .cta').forEach((element, index) => {
  if (element.getBoundingClientRect().top < innerHeight) return;
  element.style.setProperty('--reveal-delay', `${index % 3 * 60}ms`);
  element.classList.add('reveal-pending');
  observer.observe(element);
 });
 reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
   observer.disconnect();
   document.querySelectorAll('.reveal-pending').forEach(element => element.classList.replace('reveal-pending','reveal-ready'));
  }
 });
}

// Drop the company cards once when their panel becomes visible.
const companyStack = document.querySelector('.company-vibrant aside');
if (companyStack && !reducedMotion.matches && 'IntersectionObserver' in window) {
 companyStack.classList.add('company-stack-armed');
 const stackObserver = new IntersectionObserver((entries, observer) => {
  if (entries.some(entry => entry.isIntersecting)) {
   companyStack.classList.add('company-stack-play');
   observer.disconnect();
  }
 }, {threshold: .35, rootMargin: '-15% 0px -15% 0px'});
 stackObserver.observe(companyStack);
 reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
   companyStack.classList.remove('company-stack-armed', 'company-stack-play');
   stackObserver.disconnect();
  }
 });
}
