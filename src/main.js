// entrypoint

'use strict';

document.addEventListener('click',function(e){
  var o=e.target.closest('[data-open]');if(o){openPlacard(o.dataset.open);return}
  var t=e.target.closest('[data-3d]');if(t&&!t.disabled){enter3D(t.dataset['3d']||'')}
});
