// im gonna slap all the museum data into one js file to make my life easier
'use strict';

var WINGS=[
 {id:'north',compass:'North',name:'North Wing',where:'Placeholder region',blurb:'This is an example description.',
  pal:{top:'#dfe5ec',bot:'#9aa8ba',ink:'#2d3a4c',hi:'#f6f8fa'},wall:'#f1f3f6',color:'#9fb4ee'},
 {id:'east',compass:'East',name:'East Wing',where:'Placeholder region',blurb:'This is an example description.',
  pal:{top:'#e0e8e2',bot:'#9db3a3',ink:'#2c4034',hi:'#f7faf8',},wall:'#f1f4f1',color:'#6fbf7f'},
 {id:'south',compass:'South',name:'South Wing',where:'Placeholder region',blurb:'This is an example description.',
  pal:{top:'#ece5dc',bot:'#bfa88c',ink:'#4a3a2a',hi:'#faf7f2'},wall:'#f5f2ee',color:'#e5a13a'},
 {id:'west',compass:'West',name:'West Wing',where:'Placeholder region',blurb:'This is an example description.',
  pal:{top:'#dce8e9',bot:'#93b3b6',ink:'#27434a',hi:'#f5fafa'},wall:'#f0f4f4',color:'#2fb3c4'}
];
var WING={};WINGS.forEach(function(w){WING[w.id]=w});
var FLOOR='#c4c6c8';
var ARTS=[
 {id:'N-1',wing:'north',title:'Example Project 1',year:'20XX',by:'Example team',text:'This is an example description.'},
 {id:'N-2',wing:'north',title:'Example Project 2',year:'20XX',by:'Example team',text:'This is an example description.'},
 {id:'E-1',wing:'east',title:'Example Project 3',year:'20XX',by:'Example team',text:'This is an example description.'},
 {id:'E-2',wing:'east',title:'Example Project 4',year:'20XX',by:'Example team',text:'This is an example description.'},
 {id:'S-1',wing:'south',title:'Example Project 5',year:'20XX',by:'Example team',text:'This is an example description.'},
 {id:'S-2',wing:'south',title:'Example Project 6',year:'20XX',by:'Example team',text:'This is an example description.'},
 {id:'W-1',wing:'west',title:'Example Project 7',year:'20XX',by:'Example team',text:'This is an example description.'},
 {id:'W-2',wing:'west',title:'Example Project 8',year:'20XX',by:'Example team',text:'This is an example description.'}
];
var ART={};ARTS.forEach(function(a){ART[a.id]=a});
