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
var POSTER_DIR='/assets/artifact/eden/our-future/';
var OF_TEXT='A public awareness campaign designed to promote community-based environmental initiatives across the country. Advertisements promoted different local involvement opportunities in various environments.';
var ARTS=[
 {id:'OF',wing:'east',title:'Our Future, Our Actions',name:'Our Future, Our Actions Campaign',year:'2030',origin:'United States',
  desc:OF_TEXT,
  posters:[
   {cap:'Beach cleanup',img:POSTER_DIR+'Beach cleanup.png'},
   {cap:'Clothing swap',img:POSTER_DIR+'Clothing swap.png'},
   {cap:'E-waste collection',img:POSTER_DIR+'Ewaste.png'},
   {cap:'Tree planting',img:POSTER_DIR+'Tree planting.png'}
  ],
  row:{u:9.2,side:-1,pw:2.05,gap:.75}},
 {id:'OF-1',wing:'east',title:'Our Future, Our Actions: Beach cleanup',name:'Our Future, Our Actions Campaign',year:'2030',origin:'United States',desc:OF_TEXT,img:POSTER_DIR+'Beach cleanup.png'},
 {id:'OF-2',wing:'east',title:'Our Future, Our Actions: Clothing swap',name:'Our Future, Our Actions Campaign',year:'2030',origin:'United States',desc:OF_TEXT,img:POSTER_DIR+'Clothing swap.png'},
 {id:'OF-3',wing:'east',title:'Our Future, Our Actions: E-waste collection',name:'Our Future, Our Actions Campaign',year:'2030',origin:'United States',desc:OF_TEXT,img:POSTER_DIR+'Ewaste.png'},
 {id:'OF-4',wing:'east',title:'Our Future, Our Actions: Tree planting',name:'Our Future, Our Actions Campaign',year:'2030',origin:'United States',desc:OF_TEXT,img:POSTER_DIR+'Tree planting.png'},
 {id:'CI-1',wing:'north',title:'Cook Islands Climate and Indigenous Heritage Treaty',name:'Cook Islands Climate and Indigenous Heritage Treaty',year:'2063',
  origin:'Rarotonga, Cook Islands – A fictional international agreement established between the Cook Islands government, Indigenous Cook Islands representatives, traditional leaders, and international climate partners such as New Zealand and Australia.',
  desc:'This treaty signed in 2063 established legal protections for Indigenous lands, cultural heritage, and marine ecosystems across the Cook Islands. It provides funding from New Zealand and Australia for climate adaptation while ensuring Indigenous communities have a central role in environmental decision-making. It also protects traditional knowledge, fishing practices, and culturally significant sites for future generations.',
  img:'/assets/artifact/issi/this-poster-has-text-that-is-clearly-ai-generated-and-i-hate-it/Treaty document.png',size:[1654,2339],slot:{u:9.2,side:1}},
 {id:'TT-1',wing:'west',title:'Treaty Timeline: A Century of Climate Cooperation',name:'Treaty Timeline: A Century of Climate Cooperation',year:'2000–2100',
  origin:'International Climate Cooperation Archive',
  desc:"This timeline documents the international treaties, agreements, amendments, and climate-related legislation established between 2000 and 2100. It highlights major milestones in global climate cooperation, showing how countries worked together to reduce greenhouse gas emissions, protect ecosystems, advance renewable energy, and promote environmental justice. Visitors can explore key agreements throughout the century and see how international commitments helped shape the world's response to the climate crisis.",
  img:'/assets/artifact/issi/you-need-to-stop-using-ai-in-your-projects/Treaty Timeline.png',size:[2000,800],slot:{u:9.2,side:-1,pw:10.5}},
 {id:'N-1',wing:'north',title:'Example Project 1',year:'20XX',by:'Example team',text:'This is an example description.'},
 {id:'S-1',wing:'south',title:'Example Project 5',year:'20XX',by:'Example team',text:'This is an example description.'},
 {id:'S-2',wing:'south',title:'Example Project 6',year:'20XX',by:'Example team',text:'This is an example description.'},
];
var ART={};ARTS.forEach(function(a){ART[a.id]=a});
