// dialog shown when interacitng with placard

'use strict';

function escA(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}
modal=$('#placard');
function openPlacard(id){
  var a=ART[id];if(!a)return;var w=WING[a.wing];
  modalFrom=document.activeElement;modal.hidden=false;
  var strip=$('#pl-posters'),frame=$('#pl-frame');
  if(a.posters){
    frame.hidden=true;strip.hidden=false;strip.scrollLeft=0;
    strip.innerHTML=a.posters.map(function(p){
      return '<figure><img src="'+escA(p.img.split(' ').join('%20'))+'" alt="'+escA(a.title+': '+p.cap)+'" loading="lazy"><figcaption>'+escA(p.cap)+'</figcaption></figure>';
    }).join('');
  }else{
    strip.hidden=true;strip.innerHTML='';frame.hidden=false;
    drawArt($('#pl-canvas'),a);
  }
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
modal.addEventListener('keydown',function(e){if(e.key==='Escape'){e.stopPropagation();closePlacard()}if(e.key==='Tab'){
    e.preventDefault();
    var strip=$('#pl-posters'),close=$('#pl-close');
    if(strip.hidden)close.focus();else (document.activeElement===close?strip:close).focus();
  }});
