// dialog shown when interacitng with placard

'use strict';

modal=$('#placard');
function openPlacard(id){
  var a=ART[id];if(!a)return;var w=WING[a.wing];
  modalFrom=document.activeElement;modal.hidden=false;
  drawArt($('#pl-canvas'),a);
  $('#pl-cat').textContent='Accession '+a.id;$('#pl-title').textContent=a.title;$('#pl-desc').textContent=a.desc||a.text||'';
  $('#pl-name').textContent=a.name||a.title;$('#pl-wing').textContent=w.name;$('#pl-year').textContent=String(a.year);$('#pl-origin').textContent=a.origin||'—';
  $('#pl-close').focus();
  if(document.pointerLockElement&&document.exitPointerLock)document.exitPointerLock();
  if(world)world.pause(true);
}
function closePlacard(){
  modal.hidden=true;if(world)world.pause(false);
  if(modalFrom&&modalFrom.focus&&document.contains(modalFrom))try{modalFrom.focus()}catch(e){}
}
$('#pl-close').addEventListener('click',closePlacard);
modal.addEventListener('click',function(e){if(e.target===modal)closePlacard()});
modal.addEventListener('keydown',function(e){if(e.key==='Escape'){e.stopPropagation();closePlacard()}if(e.key==='Tab'){e.preventDefault();$('#pl-close').focus()}});
