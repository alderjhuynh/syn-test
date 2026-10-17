'use strict';

var threeP=null;
function loadThree(){
  if(window.THREE)return Promise.resolve();
  if(threeP)return threeP;
  threeP=new Promise(function(res,rej){
    var s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';s.async=true;
    s.onload=function(){window.THREE?res():rej(new Error('missing'))};
    s.onerror=function(){threeP=null;rej(new Error('load'))};
    document.head.appendChild(s);
  });
  return threeP;
}
function fontsReady(){
  if(!document.fonts||!document.fonts.load)return Promise.resolve();
  return Promise.race([Promise.all([document.fonts.load('700 40px "Schibsted Grotesk"'),document.fonts.load('500 20px "Schibsted Grotesk"'),document.fonts.load('400 20px "Instrument Sans"'),document.fonts.load('400 14px "DM Mono"')]).catch(function(){}),new Promise(function(r){setTimeout(r,1800)})]);
}
