(()=>{"use strict";var e;e={},
/*!*************************************!*\
  !*** ./client/private/ts/global.ts ***!
  \*************************************/
Object.defineProperty(e,"__esModule",{value:!0}),e.injectClassNames=void 0,e.injectClassNames=function(e){if(!Array.isArray(e)&&"object"==typeof e)for(const s of Object.keys(e))for(const t of[...document.getElementsByClassName(s)])t.classList.remove(s),t.classList.add(e[s])}})();