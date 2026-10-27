const menu = document.querySelector('.menu');
const navigation = document.querySelector('#navigation');
const navDropdowns = [...document.querySelectorAll('.site-nav-dropdown')];
navDropdowns.forEach(dropdown => dropdown.addEventListener('toggle', () => {
 if (dropdown.open) navDropdowns.forEach(sibling => {
  if (sibling !== dropdown) sibling.open = false;
 });
}));
menu?.addEventListener('click', () => {
 const open = menu.getAttribute('aria-expanded') !== 'true';
 menu.setAttribute('aria-expanded', String(open));
 navigation.classList.toggle('open', open);
 menu.textContent = open ? 'Fechar' : 'Menu';
 if (!open) navDropdowns.forEach(dropdown => { dropdown.open = false; });
});
document.addEventListener('keydown', event => {
 const openDropdown = navDropdowns.find(dropdown => dropdown.open);
 if (event.key === 'Escape' && openDropdown) {
  openDropdown.open = false;
  openDropdown.querySelector('summary').focus();
  return;
 }
 if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
  menu.click(); menu.focus();
 }
});
document.addEventListener('click', event => {
 navDropdowns.forEach(dropdown => {
  if (dropdown.open && !dropdown.contains(event.target)) dropdown.open = false;
 });
});
navDropdowns.forEach(dropdown => dropdown.addEventListener('focusout', event => {
 if (event.relatedTarget && !dropdown.contains(event.relatedTarget)) dropdown.open = false;
}));
navigation?.addEventListener('click', event => {
 if (!event.target.closest('a')) return;
 navDropdowns.forEach(dropdown => { dropdown.open = false; });
 if (menu?.getAttribute('aria-expanded') === 'true') menu.click();
});

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
  story?.style.removeProperty('--platinum-glow');
  story?.style.removeProperty('--platinum-glow-scale');
  return;
 }
 if (!story) return;
 const box = story.getBoundingClientRect();
 if (box.bottom < -100 || box.top > innerHeight + 100) return;
 const mobile = compactScreen.matches;
 if (mobile) {
  cards.forEach(card => { card.style.removeProperty('transform'); card.style.removeProperty('opacity'); card.style.removeProperty('z-index'); });
  story.style.removeProperty('--platinum-glow');
  story.style.removeProperty('--platinum-glow-scale');
  return;
 }
 const headerHeight = document.querySelector('header')?.offsetHeight || 104;
 const progress = clamp((headerHeight - box.top) / Math.max(1, box.height - innerHeight + headerHeight));
 const position = progress * (cards.length - 1);
 story.style.setProperty('--story-progress', progress);
 const platinumGlow = clamp((position - 1.5) / .22);
 story.style.setProperty('--platinum-glow', platinumGlow);
 story.style.setProperty('--platinum-glow-scale', `${platinumGlow * .35}`);
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
const companyStack = document.querySelector('.company-campaign .company-list');
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

// Campanhas: os controles de paginação trocam os banners enviados para a seção.
document.querySelectorAll('[data-campaign-carousel]').forEach(carousel => {
 const slides = [...carousel.querySelectorAll('[data-carousel-slide]')];
 const controls = [...carousel.querySelectorAll('[data-carousel-to]')];
 if (slides.length < 2 || controls.length !== slides.length) return;
 let active = 0;
 let timer;
 const show = index => {
  active = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
   const selected = slideIndex === active;
   slide.classList.toggle('is-active', selected);
   slide.setAttribute('aria-hidden', String(!selected));
  });
  controls.forEach((control, controlIndex) => {
   const selected = controlIndex === active;
   control.classList.toggle('is-active', selected);
   control.setAttribute('aria-selected', String(selected));
  });
 };
 const stop = () => { if (timer) window.clearInterval(timer); };
 const start = () => {
  stop();
  if (!reducedMotion.matches) timer = window.setInterval(() => show(active + 1), 6500);
 };
 controls.forEach((control, index) => {
  control.addEventListener('click', () => { show(index); start(); });
  control.addEventListener('keydown', event => {
   if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
   event.preventDefault();
   const next = event.key === 'ArrowRight' ? (index + 1) % controls.length : (index - 1 + controls.length) % controls.length;
   controls[next].focus();
   show(next);
   start();
  });
 });
 carousel.addEventListener('mouseenter', stop);
 carousel.addEventListener('mouseleave', start);
 carousel.addEventListener('focusin', stop);
 carousel.addEventListener('focusout', event => { if (!carousel.contains(event.relatedTarget)) start(); });
 reducedMotion.addEventListener('change', start);
 show(0);
 start();
});
