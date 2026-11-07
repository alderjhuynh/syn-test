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

function drawImgNice(x,src,dx,dy,dw,dh){
  var sw=src.width,sh=src.height;

  while(sw>dw*2&&sh>dh*2){
    var hw=Math.max(Math.round(dw),Math.round(sw/2)),hh=Math.max(Math.round(dh),Math.round(sh/2));
    var c=document.createElement('canvas');
    c.width=hw;
    c.height=hh;

    var t=c.getContext('2d');
    t.imageSmoothingQuality='high';
    t.drawImage(src,0,0,hw,hh);

    src=c;
    sw=hw;
    sh=hh;
  }

  x.imageSmoothingEnabled=true;
  x.imageSmoothingQuality='high';
  x.drawImage(src,dx,dy,dw,dh);
}
function drawArt(cv,a){
  var x=cv.getContext('2d'),ratio=cv.height/cv.width;

  var cw=cv.clientWidth>2?cv.clientWidth:cv.width*2;
  cv.width=Math.min(2400,Math.round(cw*(window.devicePixelRatio||1)));
  cv.height=Math.round(cv.width*ratio);
  var W=cv.width,H=cv.height,g=W*.05;
  x.fillStyle='#ffffff';x.fillRect(0,0,W,H);

  if(a.posters){
    var ch=(H-3*g)/2,cw2=ch*POSTER_A;

    if(cw2*2+g>W-2*g){cw2=(W-3*g)/2;ch=cw2/POSTER_A}

    var x0=(W-(cw2*2+g))/2,y0=(H-(ch*2+g))/2;
    a.posters.forEach(function(p,i){
      var cx0=x0+(i%2)*(cw2+g),cy0=y0+Math.floor(i/2)*(ch+g);
      imgArt(p.img,function(im){drawImgNice(x,im,cx0,cy0,cw2,ch)});
    });
  }else if(a.img){
    var m=W*.04,bw=W-2*m,bh=H-2*m,k=Math.min(bw/1728,bh/2304),w2=1728*k,h2=2304*k;
    imgArt(a.img,function(im){drawImgNice(x,im,(W-w2)/2,(H-h2)/2,w2,h2)});
  }else{
    paint(x,W,H,a);
  }
}
