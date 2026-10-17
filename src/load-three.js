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
var fbxP=null;
function loadScript(src){
  return new Promise(function(res,rej){
    var s=document.createElement('script');s.src=src;s.async=true;s.onload=res;s.onerror=function(){rej(new Error('load'))};document.head.appendChild(s);
  });
}
function loadFBXSupport(){
  if(window.THREE&&THREE.FBXLoader)return Promise.resolve();
  if(fbxP)return fbxP;
  fbxP=loadScript('src/vendor/fflate.min.js').then(function(){return loadScript('src/vendor/FBXLoader.js')}).catch(function(e){fbxP=null;throw e});
  return fbxP;
}
function fontsReady(){
  if(!document.fonts||!document.fonts.load)return Promise.resolve();
  return Promise.race([Promise.all([document.fonts.load('700 40px "Schibsted Grotesk"'),document.fonts.load('500 20px "Schibsted Grotesk"'),document.fonts.load('400 20px "Instrument Sans"'),document.fonts.load('400 14px "DM Mono"')]).catch(function(){}),new Promise(function(r){setTimeout(r,1800)})]);
}
