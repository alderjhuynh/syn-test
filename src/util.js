'use strict';

var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
var coarse=matchMedia('(pointer: coarse)').matches;
