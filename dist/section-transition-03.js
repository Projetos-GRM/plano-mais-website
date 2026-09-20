/* GSAP pixel transition between the home company and plans sections. */
(() => {
 const defaults = {
  resolution: 20,
  spread: 5,
  fillDuration: .03,
  coverStart: 'bottom bottom+=20%',
  revealStart: 'top bottom',
 };
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 const hash = index => {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
 };
 const positiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
 };
 const positiveFloat = (value, fallback) => {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
 };
 const isTransparent = color => color === 'transparent' || color === 'rgba(0, 0, 0, 0)';
 const siblingColor = element => {
  for (const candidate of [element, element?.parentElement, document.body, document.documentElement]) {
   if (!candidate) continue;
   const color = getComputedStyle(candidate).backgroundColor;
   if (!isTransparent(color)) return color;
  }
  return '#fafaff';
 };

 let active = [];
 function destroy() {
  active.forEach(({timeline, layer}) => {
   timeline.kill();
   layer.remove();
  });
  active = [];
 }

 function sectionTransition03(scope = document) {
  if (!window.gsap || !window.ScrollTrigger || motion.matches) return;
  gsap.registerPlugin(ScrollTrigger);
  scope.querySelectorAll('[data-st-03]').forEach(section => {
   const mode = section.dataset.stMode === 'reveal' ? 'reveal' : 'cover';
   const sibling = mode === 'reveal' ? section.previousElementSibling : section.nextElementSibling;
   if (!(sibling instanceof Element)) return;

   const desktop = positiveInt(section.getAttribute('data-st-03'), defaults.resolution);
   const columns = matchMedia('(max-width: 768px)').matches
    ? positiveInt(section.dataset.stMobileResolution, desktop) : desktop;
   const spread = positiveInt(section.dataset.stSpread, defaults.spread);
   const duration = positiveFloat(section.dataset.stFillDuration, defaults.fillDuration);
   const baseColor = section.dataset.stFillColor || siblingColor(sibling);
   const palette = section.dataset.stPalette?.split(',').map(color => color.trim()).filter(Boolean) || [];

   const layer = document.createElement('div');
   layer.setAttribute('data-st-03-pixels', '');
   layer.setAttribute('aria-hidden', 'true');
   section.append(layer);
   const cellSize = layer.offsetWidth / columns;
   const rows = Math.max(1, Math.ceil(layer.offsetHeight / Math.max(cellSize, 1)));
   layer.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
   layer.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;

   const cells = Array.from({length: rows * columns}, (_, index) => {
    const cell = document.createElement('span');
    cell.setAttribute('data-st-03-cell', '');
    cell.style.backgroundColor = palette.length
     ? palette[Math.floor(hash(index + 17) * palette.length)] : baseColor;
    layer.append(cell);
    return cell;
   });
   gsap.set(cells, {opacity: mode === 'reveal' ? 1 : 0});
   const maxDelay = Math.max(rows - 1 + spread, 1);
   const delays = cells.map((_, index) => {
    const row = Math.floor(index / columns);
    const waveRow = mode === 'reveal' ? row : rows - 1 - row;
    return (waveRow + hash(index) * spread) / maxDelay;
   });
   const timeline = gsap.timeline({
    defaults: {ease: 'none'},
    scrollTrigger: {
     trigger: section,
     start: mode === 'reveal' ? defaults.revealStart : defaults.coverStart,
     end: () => `+=${Math.max(layer.offsetHeight, 1)}`,
     scrub: 1,
     invalidateOnRefresh: true,
    },
   });
   timeline.to(cells, {
    duration,
    opacity: mode === 'reveal' ? 0 : 1,
    stagger: index => delays[index],
   }, 0);
   active.push({timeline, layer});
  });
  ScrollTrigger.refresh();
 }

 function rebuild() {
  destroy();
  sectionTransition03();
 }
 function start() {
  rebuild();
  let resizeTimer;
  addEventListener('resize', () => {
   clearTimeout(resizeTimer);
   resizeTimer = setTimeout(rebuild, 180);
  });
  motion.addEventListener('change', rebuild);
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
 else start();
})();
