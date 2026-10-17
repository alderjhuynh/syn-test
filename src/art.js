// procedural paintings since i cba to make paintings myself

'use strict';

function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function rgba(hex,a){var n=parseInt(hex.slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')'}
function shade(hex,k){var n=parseInt(hex.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255,t=k<0?0:255,p=Math.abs(k);
  return 'rgb('+Math.round((t-r)*p+r)+','+Math.round((t-g)*p+g)+','+Math.round((t-b)*p+b)+')'}
function paint(ctx,w,h,a){
  var p=WING[a.wing].pal,R=rng(hash(a.id)),g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,p.top);g.addColorStop(1,p.bot);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.save();ctx.scale(w/100,h/125);
  ctx.fillStyle=p.hi;ctx.beginPath();ctx.arc(70,38,12,0,6.3);ctx.fill();
  ctx.fillStyle=rgba(p.ink,.32);ctx.beginPath();ctx.moveTo(0,125);ctx.lineTo(0,84+R()*8);ctx.lineTo(34,58+R()*8);ctx.lineTo(62,88);ctx.lineTo(100,72);ctx.lineTo(100,125);ctx.closePath();ctx.fill();
  ctx.fillStyle=rgba(p.ink,.6);ctx.beginPath();ctx.moveTo(0,125);ctx.lineTo(0,106);ctx.lineTo(46,82+R()*6);ctx.lineTo(100,108);ctx.lineTo(100,125);ctx.closePath();ctx.fill();
  var v=ctx.createRadialGradient(50,62,40,50,62,92);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.1)');ctx.fillStyle=v;ctx.fillRect(0,0,100,125);
  ctx.restore();
}
