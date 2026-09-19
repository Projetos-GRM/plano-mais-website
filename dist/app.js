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
