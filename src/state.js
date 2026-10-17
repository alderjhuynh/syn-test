// shared mutable state

'use strict';

var world = null;                   // the running 3D world, or null when the flat site is showing
var world_tryLock = function () {}; // replaced by the gallery once a canvas exists
var modal = $('#placard');          // the placard dialog element
var modalFrom = null;               // element that opened the placard, so focus can be restored
var qKey = 'medium';                // current 3D quality preset: low | medium | high
