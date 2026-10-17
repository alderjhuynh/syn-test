// build 2d collection (wing sections, framed cards, wing filter, region options)

'use strict';
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function cardHTML(a){
  return '<button class="art" type="button" data-open="'+a.id+'" aria-label="Read placard: '+esc(a.title)+'">'+
   '<div class="frame"><div class="mat"><canvas data-art="'+a.id+'" width="400" height="500" aria-hidden="true"></canvas></div></div>'+
   '<div class="plate">'+a.id+' · '+a.year+'<b>'+esc(a.title)+'</b>'+esc(a.by)+'</div></button>';
}
function fillCards(root,ids){if(!root)return;root.innerHTML=ids.map(function(id){return cardHTML(ART[id])}).join('')}

var wingsEl=$('#wings');
if(wingsEl)WINGS.forEach(function(w){
  var arts=ARTS.filter(function(a){return a.wing===w.id});
  var s=document.createElement('section');s.className='wing';s.dataset.wing=w.id;s.setAttribute('aria-labelledby','h-'+w.id);
  s.innerHTML='<div class="wing-head"><p class="mono">'+w.where+'</p><h3 id="h-'+w.id+'">'+w.name+'</h3><p>'+w.blurb+'</p>'+
    '<button class="btn btn-ghost" type="button" data-3d="'+w.id+'">Visit this wing in 3D</button></div>'+
    '<div class="wing-art">'+arts.map(cardHTML).join('')+'</div>';
  wingsEl.appendChild(s);
});
fillCards($('#hero-wall'),['N-1','E-1','S-1']);
$$('canvas[data-art]').forEach(function(cv){paint(cv.getContext('2d'),cv.width,cv.height,ART[cv.dataset.art])});

var chips=$('#chips');
if(chips){
  [{id:'all',name:'All wings'}].concat(WINGS).forEach(function(w,i){
    var b=document.createElement('button');b.type='button';b.className='chip';b.dataset.filter=w.id;b.textContent=w.name;b.setAttribute('aria-pressed',i===0?'true':'false');chips.appendChild(b);
  });
  chips.addEventListener('click',function(e){
    var b=e.target.closest('.chip');if(!b)return;
    $$('.chip',chips).forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
    $$('.wing').forEach(function(s){s.hidden=!(b.dataset.filter==='all'||s.dataset.wing===b.dataset.filter)});
  });
}
var regionSel=$('#c-region');
if(regionSel)WINGS.map(function(w){return w.name}).concat(['Somewhere else']).forEach(function(n){var o=document.createElement('option');o.textContent=n;regionSel.appendChild(o)});
