(()=>{"use strict";var e={"./client/private/styles/global.scss":
/*!*******************************************!*\
  !*** ./client/private/styles/global.scss ***!
  \*******************************************/(e,t,s)=>{s.r(t),s.d(t,{default:()=>o});const o={link:"link-DIoV5"}},"./client/private/styles/index.scss":
/*!******************************************!*\
  !*** ./client/private/styles/index.scss ***!
  \******************************************/(e,t,s)=>{s.r(t),s.d(t,{default:()=>o});const o={link:"link-VAlZj",nav:"nav-glXMJ",container:"container-OxoKA",logo:"logo-XWlIa",links:"links-zb8Va",login:"login-cifGj",button:"button-Vglpx"}},"./client/private/ts/global.ts":
/*!*************************************!*\
  !*** ./client/private/ts/global.ts ***!
  \*************************************/(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.injectClassNames=void 0,t.injectClassNames=function(e){if(!Array.isArray(e)&&"object"==typeof e)for(const t of Object.keys(e))for(const s of[...document.getElementsByClassName(t)])s.classList.remove(t),s.classList.add(e[t])}}},t={};function s(o){var l=t[o];if(void 0!==l)return l.exports;var n=t[o]={exports:{}};return e[o](n,n.exports,s),n.exports}s.d=(e,t)=>{for(var o in t)s.o(t,o)&&!s.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},s.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),s.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var o={};(()=>{var e=o;
/*!************************************!*\
  !*** ./client/private/ts/index.ts ***!
  \************************************/Object.defineProperty(e,"__esModule",{value:!0});const t=s(/*! ../ts/global */"./client/private/ts/global.ts"),l={global:s(/*! ../styles/global.scss */"./client/private/styles/global.scss"),index:s(/*! ../styles/index.scss */"./client/private/styles/index.scss").default};(0,t.injectClassNames)(l.index)})()})();