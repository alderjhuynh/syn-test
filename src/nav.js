'use strict';

(function(){
  var header=$('.top');
  if(!header)return;
  var nav=$('.nav',header),wrap=$('.wrap',header);
  if(!nav||!wrap)return;

  var panel=document.createElement('div');
  panel.className='nav-links';
  panel.id='nav-links';
  nav.insertBefore(panel,nav.firstChild);
  $$('a',nav).forEach(function(a){panel.appendChild(a)});

  var menu=document.createElement('button');
  menu.type='button';
  menu.className='nav-menu';
  menu.textContent='Menu';
  menu.setAttribute('aria-expanded','false');
  menu.setAttribute('aria-controls','nav-links');
  var btn3d=$('[data-3d]',nav);
  if(btn3d)btn3d.insertAdjacentElement('afterend',menu);
  else nav.appendChild(menu);

  function sync(){menu.setAttribute('aria-expanded',header.classList.contains('nav-open')?'true':'false')}
  function setOpen(open){header.classList.toggle('nav-open',!!open);sync()}

  function overflows(){return wrap.scrollWidth>wrap.clientWidth+1}
  function layout(){
    if(wrap.offsetWidth===0)return;
    header.classList.remove('nav-compact','nav-open');
    if(!overflows()){sync();return}
    header.classList.add('nav-compact');
    if(overflows())header.classList.remove('nav-compact');
    sync();
  }

  window.addEventListener('resize',layout);
  window.addEventListener('orientationchange',layout);
  window.addEventListener('load',layout);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(layout);
  layout();

  menu.addEventListener('click',function(){setOpen(!header.classList.contains('nav-open'))});
  panel.addEventListener('click',function(e){if(e.target.closest('a'))setOpen(false)});
  document.addEventListener('click',function(e){if(!header.contains(e.target))setOpen(false)});
  window.addEventListener('keydown',function(e){if(e.key==='Escape')setOpen(false)});
})();
