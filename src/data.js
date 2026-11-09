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
  origin:'Rarotonga, Cook Islands.',
  desc:'This protest, led by Cook Islands community members, youth, and Indigenous leaders, calls for stronger international climate action and protection of Pacific Island communities from rising sea levels. Protesters demand greater recognition of Indigenous land and ocean rights, funding for climate adaptation, and protection of their cultural heritage. The movement raises international awareness and helps inspire the creation of the 2063 Cook Islands Climate and Indigenous Heritage Treaty.',
  img:'/assets/artifact/issi/this-poster-has-text-that-is-clearly-ai-generated-and-i-hate-it/Treaty document.png',size:[1654,2339],slot:{u:9.2,side:1}},
 {id:'TT-1',wing:'west',title:'Treaty Timeline: A Century of Climate Cooperation',name:'Treaty Timeline: A Century of Climate Cooperation',year:'2000–2100',
  origin:'International Climate Cooperation Archive',
  desc:"This timeline documents the international treaties, agreements, amendments, and climate-related legislation established between 2000 and 2100. It highlights major milestones in global climate cooperation, showing how countries worked together to reduce greenhouse gas emissions, protect ecosystems, advance renewable energy, and promote environmental justice. Visitors can explore key agreements throughout the century and see how international commitments helped shape the world's response to the climate crisis.",
  img:'/assets/artifact/issi/you-need-to-stop-using-ai-in-your-projects/Treaty Timeline.png',size:[2000,800],slot:{u:9.2,side:-1,pw:10.5}},
 {id:'RRR-1',wing:'east',title:'Reuse, Reduce, Recycle Ordinance',name:'Reuse, Reduce, Recycle Ordinance',year:'2042',origin:'Rio De Janeiro, Brazil',
  desc:'A policy designed to reduce urban waste by replacing unnecessary plastics with sustainable, eco-friendly materials throughout the city. The ordinance completely banned single-use products and other disposables. These items were replaced with reusable and recyclable alternatives, successfully reducing landfill waste and halting plastic pollution in the city by over 30% in just six months.',
  img:'/assets/artifact/eden/reuse-reduce-recycle-ordinance/Reuse Reduce Recycle.png',size:[1728,2688],slot:{u:3.6,side:1}},
 {id:'CGN-1',wing:'east',title:'The Community Garden Network',name:'The Community Garden Network',year:'2065',origin:'Tokyo, Japan',
  desc:'An expansion of community-based urban agriculture designed to support local food resources, improve environmental conditions, and promote togetherness through community involvement. The Garden Network granted citizens all across Tokyo more access to healthy, fresh produce without the high costs.',
  img:'/assets/artifact/eden/the-community-garden-network/Garden Network.png',size:[2000,1414],slot:{u:9.2,side:1}},
 {id:'TSOB-1',wing:'east',title:'Two Sides, One Blanket',name:'Two Sides, One Blanket',year:'2025',origin:'University of California, San Diego',
  desc:'An educational art project created by Synthesis students at UC San Diego targeting circular fashion and its potential positive impact on the climate crisis. This infinity blanket has two contrasting sides, one using raw and one using upcycled materials to demonstrate the life cycle of clothing. This project raised awareness about fast fashion and overconsumption, showcasing a future for sustainable fashion.',
  img:'/assets/artifact/eden/two-sides-one-blanket/2sides1blanketfin.png',size:[1658,662],slot:{u:14.8,side:1,pw:4}},
];
var ART={};ARTS.forEach(function(a){ART[a.id]=a});