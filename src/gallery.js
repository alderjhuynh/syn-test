// opening and closing the 3D gallery, including its load and error screens

'use strict';

var overlay=$('#gallery3d'),loadEl=$('#gl-load'),opener=null;
function setLoad(title,msg,go,back){$('#gl-title').textContent=title;$('#gl-msg').textContent=msg;$('#gl-go').hidden=!go;$('#gl-back').hidden=!back;loadEl.hidden=false}
function spawnFor(id){
  if(!id)return {x:0,z:7,yaw:0,pitch:0};
  var w=WING[id],d=DIRS[w.compass];
  return {x:d.x*13,z:d.z*13,yaw:Math.atan2(-d.x,-d.z),pitch:0};
}
function enter3D(id){
  if(!glOK)return;
  opener=document.activeElement;overlay.hidden=false;$('#site').inert=true;document.documentElement.style.overflow='hidden';
  setLoad('Opening the gallery','Loading the 3D library.',false,false);
  loadThree().then(function(){
    return loadFBXSupport().catch(function(){});
  }).then(function(){
    setLoad('Opening the gallery','Building the rooms.',false,false);
    return fontsReady();
  }).then(function(){return new Promise(function(r){requestAnimationFrame(function(){setTimeout(r,30)})})})
  .then(function(){
    $('#hud-q').value=qKey;
    world=startWorld(qKey,spawnFor(id));
    setLoad('Ready','You are in the '+(id?WING[id].name+' wing':'atrium')+'. Look around, walk, and stop in front of a painting to read it.',true,false);
    $('#gl-go').focus();
  }).catch(function(err){
    if(world){try{world.stop()}catch(e){}world=null}
    setLoad('Could not open the gallery',err&&err.message==='load'?'The 3D library did not load. Check your connection, or browse the collection instead.':'This device could not start 3D. Browse the collection instead.',false,true);
    $('#gl-back').focus();
  });
}
function exit3D(){
  if(!modal.hidden){modal.hidden=true}
  if(document.pointerLockElement&&document.exitPointerLock)document.exitPointerLock();
  if(world){world.stop();world=null}
  overlay.hidden=true;$('#site').inert=false;document.documentElement.style.overflow='';
  if(opener&&opener.focus&&document.contains(opener))try{opener.focus()}catch(e){}
}
$('#gl-go').addEventListener('click',function(){loadEl.hidden=true;if(!coarse)world_tryLock()});
$('#gl-back').addEventListener('click',exit3D);
$('#gl-exit').addEventListener('click',exit3D);
$('#hud-q').addEventListener('change',function(e){
  qKey=e.target.value;$('#q-'+qKey).checked=true;
  if(!world)return;var pose=world.pose();world.stop();world=null;
  try{world=startWorld(qKey,pose)}catch(err){exit3D()}
});
