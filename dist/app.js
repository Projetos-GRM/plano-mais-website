const menu = document.querySelector('.menu');
const navigation = document.querySelector('#navigation');
menu?.addEventListener('click', () => {
 const open = menu.getAttribute('aria-expanded') !== 'true';
 menu.setAttribute('aria-expanded', String(open));
 navigation.classList.toggle('open', open);
 menu.textContent = open ? 'Fechar' : 'Menu';
});
document.addEventListener('keydown', event => {
 if(event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
 menu.click(); menu.focus();
 }
});

// Progressive enhancement: all content stays readable without JavaScript.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const compactScreen = matchMedia('(max-width: 760px)');
const story = document.querySelector('.card-story');
const cards = [...document.querySelectorAll('.motion-card')];
const humanHero = document.querySelector('.human-hero');
let scheduled = false;
const clamp = value => Math.max(0, Math.min(1, value));
function paintScroll() {
 scheduled = false;
 document.body.classList.toggle('scrolled', scrollY > 20);
 if (reducedMotion.matches) {
  cards.forEach(card => card.style.removeProperty('transform'));
  humanHero?.style.removeProperty('--photo-shift');
  humanHero?.style.removeProperty('--badge-shift');
  return;
 }
 if (humanHero) {
  const box = humanHero.getBoundingClientRect();
  if (box.bottom > 0) {
   const progress = clamp(-box.top / box.height);
   humanHero.style.setProperty('--photo-shift', `${-3 + progress * 5}%`);
   humanHero.style.setProperty('--badge-shift', `${progress * -30}px`);
  }
 }
 if (!story) return;
 const box = story.getBoundingClientRect();
 if (box.bottom < -100 || box.top > innerHeight + 100) return;
 const mobile = compactScreen.matches;
 const progress = mobile ? clamp((innerHeight - box.top) / (innerHeight + box.height)) : clamp((104 - box.top) / Math.max(1, box.height - innerHeight + 104));
 const spread = mobile ? 65 + progress * 20 : 20 + progress * Math.min(150, innerWidth * .12);
 const angle = mobile ? 12 : 4 + progress * 16;
 story.style.setProperty('--story-progress', progress);
 cards.forEach((card, index) => {
  const direction = index - 1;
  const lift = index === 1 ? -35 - progress * 25 : progress * 12;
  card.style.transform = `translate(calc(-50% + ${direction * spread}px), calc(-50% + ${lift}px)) rotate(${direction * angle}deg)`;
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
