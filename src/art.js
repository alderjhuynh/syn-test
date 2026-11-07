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

// image-based art
var POSTER_A=1728/2304;
function imgArt(src,fn){
  var im=new Image();
  im.onload=function(){fn(im)};
  im.src=src.split(' ').join('%20');
}
function drawArt(cv,a){
  var x=cv.getContext('2d'),W=cv.width,H=cv.height,g=W*.05;
  x.fillStyle='#ffffff';x.fillRect(0,0,W,H);

  if(a.posters){
    var ch=(H-3*g)/2,cw=ch*POSTER_A;

    if(cw*2+g>W-2*g){cw=(W-3*g)/2;ch=cw/POSTER_A}

    var x0=(W-(cw*2+g))/2,y0=(H-(ch*2+g))/2;
    a.posters.forEach(function(p,i){
      var cx0=x0+(i%2)*(cw+g),cy0=y0+Math.floor(i/2)*(ch+g);
      imgArt(p.img,function(im){x.drawImage(im,cx0,cy0,cw,ch)});
    });
  }else if(a.img){
    var m=W*.04,bw=W-2*m,bh=H-2*m,k=Math.min(bw/1728,bh/2304),w2=1728*k,h2=2304*k;
    imgArt(a.img,function(im){x.drawImage(im,(W-w2)/2,(H-h2)/2,w2,h2)});
  }else{
    paint(x,W,H,a);
  }
}
