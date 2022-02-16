(()=>{"use strict";var e={};(()=>{var t=e;
/*!*************************************!*\
  !*** ./client/private/ts/global.ts ***!
  \*************************************/Object.defineProperty(t,"__esModule",{value:!0}),t.injectClassNames=t.RTCConnection=t.Logger=void 0;class n{constructor(e){this.title=e}debug(e,t,n){const s={args:[],message:"",title:this.title};if("object"==typeof e)Object.keys(e).forEach((t=>s[t]=e[t]));else s.args=null!=t?t:[],s.message=null!=e?e:"",s.title=null!=n?n:this.title;console.log(`%c[${s.title}]`,"color: purple;",s.message,...s.args)}error(){console.error.apply(this,arguments)}log(){console.log.apply(this,arguments)}warn(){console.warn.apply(this,arguments)}}t.Logger=n,window.logger=new n("Window");t.RTCConnection=class{constructor(e){this.connection=new RTCPeerConnection,this.logger=new n("RTCConnection"),this.ws=new WebSocket(e.server),this.ws.addEventListener("message",(async({data:e})=>{const t=await new Promise((t=>t(JSON.parse(e)))).catch((()=>e));"ID"===t.event?window.id=t.id:"ANSWER"===t.event&&await this.connection.setRemoteDescription(t.answer)})),this.connection.addEventListener("connectionstatechange",(()=>{this.logger.debug({message:`connectionState => ${this.connection.connectionState}`})})),this.connection.addEventListener("iceconnectionstatechange",(()=>{this.logger.debug({message:`iceConnectionState => ${this.connection.iceConnectionState}`})})),this.connection.addEventListener("icegatheringstatechange",(()=>{this.logger.debug({message:`iceGatheringState => ${this.connection.iceGatheringState}`})})),this.connection.addEventListener("negotiationneeded",(async()=>{await this.connection.setLocalDescription(await this.connection.createOffer()),this.ws.send(JSON.stringify({_id:window.id,event:"OFFER",offer:this.connection.localDescription}))})),this.connection.addEventListener("signalingstatechange",(()=>{this.logger.debug({message:`signalingState => ${this.connection.signalingState}`})})),this.connection.addEventListener("track",(({streams:e,track:t})=>{this.logger.debug({args:[e],message:"[STREAMS]"}),this.logger.debug({args:[t],message:"[TRACK]"})}))}},t.injectClassNames=function(e){if(!Array.isArray(e)&&"object"==typeof e)for(const t of Object.keys(e))for(const n of[...document.getElementsByClassName(t)])n.classList.remove(t),n.classList.add(e[t])}})()})();