// device checks + quality switcher

'use strict';

var glOK=(function(){try{var c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl');
  if(g){var x=g.getExtension('WEBGL_lose_context');if(x)x.loseContext()}return !!g}catch(e){return false}})();
var QUALITY={
 low:{label:'Low',tex:256,pr:1,aa:false,fog:[10,30],aniso:1},
 medium:{label:'Medium',tex:512,pr:Math.min(devicePixelRatio||1,1.5),aa:false,fog:[14,38],aniso:4},
 high:{label:'High',tex:1024,pr:Math.min(devicePixelRatio||1,2),aa:true,fog:[18,50],aniso:8}
};
function pickQuality(){
  var cores=navigator.hardwareConcurrency||4,mem=navigator.deviceMemory||0;
  if(coarse)return cores>=6?'medium':'low';
  if(cores>=8&&(mem===0||mem>=8))return 'high';
  return cores>=4?'medium':'low';
}
qKey=pickQuality();
(function(){
  ['low','medium','high'].forEach(function(k){var r=$('#q-'+k);if(r)r.checked=(k===qKey)});
  var hud=$('#hud-q');if(hud)hud.value=qKey;
  var seg=$('#q-seg');
  if(seg)seg.addEventListener('change',function(e){if(e.target.name==='q'){qKey=e.target.value;if(hud)hud.value=qKey}});
  var cores=navigator.hardwareConcurrency;
  var note=$('#device-note');
  if(!glOK){$$('[data-3d]').forEach(function(b){b.disabled=true});var warn=$('#gl-warn');if(warn)warn.hidden=false}
})();
