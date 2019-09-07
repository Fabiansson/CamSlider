(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{328:function(e,t,a){e.exports=a(558)},333:function(e,t,a){},334:function(e,t,a){},350:function(e,t,a){},528:function(e,t,a){},555:function(e,t){},558:function(e,t,a){"use strict";a.r(t);var n=a(0),i=a.n(n),r=a(17),o=a.n(r),s=(a(333),a(64)),l=a(20),c=a(18),m=a(22),h=a(21),u=a(23),d=a(596),p=a(268),v=a.n(p),g=a(269),b=a.n(g),f=a(270),E=a.n(f),k=i.a.createContext(),C=a(35),O=(a(334),function(e){function t(){var e;return Object(l.a)(this,t),(e=Object(m.a)(this,Object(h.a)(t).call(this))).state={},e}return Object(u.a)(t,e),Object(c.a)(t,[{key:"componentDidMount",value:function(){this.props.socket.emit("softResetPlaner")}},{key:"render",value:function(){var e=this,t={background:"linear-gradient(223deg, rgba(9,9,121,1) 0%, rgba(0,212,255,1) 100%)",border:0,borderRadius:3,boxShadow:"0 3px 5px 2px rgba(0, 0, 0, .3)",color:"white",height:48,padding:"0 30px",margin:"3em",width:"70%"};return i.a.createElement("div",null,i.a.createElement("div",null,i.a.createElement(d.a,{style:t,variant:"contained",size:"large",color:"primary",component:C.b,to:"/timelapse"},"Timelapse",i.a.createElement(v.a,null))),i.a.createElement("div",null,i.a.createElement(d.a,{style:t,variant:"contained",size:"large",color:"primary",component:C.b,to:"/panorama"},"Panorama",i.a.createElement(b.a,null))),i.a.createElement("div",null,i.a.createElement(d.a,{style:t,variant:"contained",size:"large",color:"primary",onClick:function(){return e.props.socket.emit("init")},component:C.b,to:"/movie"},"Movie",i.a.createElement(E.a,null))),i.a.createElement(d.a,{variant:"outlined",onClick:function(){return e.props.socket.emit("shutdown")}},"Shutdown"),i.a.createElement(d.a,{variant:"outlined",onClick:function(){return e.props.socket.emit("reboot")}},"Reboot"),i.a.createElement(d.a,{variant:"outlined",onClick:function(){return e.props.socket.emit("update")}},"Update"))}}]),t}(i.a.Component)),j=function(e){return i.a.createElement(k.Consumer,null,function(t){return i.a.createElement(O,Object.assign({},e,{socket:t}))})},S=a(8),y=a(599),T=a(600),w=a(186),P=a(199),A=a(86),x=a(619),I=a(121),R=a(179),D=a.n(R),B=a(180),N=a.n(B),z=a(598),Z=a(138),M=a(266),L=a(290),H=a(271),F=a.n(H),W=Object(P.a)(function(e){return{chipConnected:{margin:G.spacing(1),color:G.status.connected},chipDisconnected:{margin:G.spacing(1),color:G.status.disconnected}}}),G=Object(I.a)({status:{connected:z.a[500],disconnected:Z.a[500]}});var q=function(e){var t=W(),a=e.cameraActive,n=e.hasCamera,r=i.a.useState(!1),o=Object(A.a)(r,2),s=o[0],l=o[1];function c(){e.toggleCamera(),l(!0)}function m(e,t){"clickaway"!==t&&l(!1)}return a?i.a.createElement("div",null,i.a.createElement(x.a,{icon:i.a.createElement(D.a,null),label:"Use Camera",clickable:!0,className:t.chipConnected,onClick:c,deleteIcon:i.a.createElement(N.a,null)})):i.a.createElement("div",null,i.a.createElement(x.a,{icon:i.a.createElement(D.a,null),label:"No Camera",clickable:!0,className:t.chipDisconnected,onClick:c,deleteIcon:i.a.createElement(N.a,null)}),!n&&i.a.createElement(M.a,{anchorOrigin:{vertical:"bottom",horizontal:"left"},open:s,autoHideDuration:5e3,onClose:m,ContentProps:{"aria-describedby":"message-id"},message:i.a.createElement("span",{id:"message-id"},"No camera connected"),action:[i.a.createElement(L.a,{key:"close","aria-label":"Close",color:"inherit",className:t.close,onClick:m},i.a.createElement(F.a,null))]}))},U=a(272),X=a.n(U),K=Object(P.a)(function(e){return{root:{flexGrow:1},title:{flexGrow:1}}});var J=function(e){var t=K();return i.a.createElement("header",null,i.a.createElement("div",{className:t.root},i.a.createElement(y.a,{position:"static",color:"default"},i.a.createElement(T.a,null,e.backButton&&i.a.createElement(L.a,{"aria-label":"back",component:C.b,to:"/"},i.a.createElement(X.a,null)),i.a.createElement(w.a,{variant:"h6",color:"inherit",className:t.title},e.title),void 0!==e.toggleCamera&&i.a.createElement(q,{cameraActive:e.cameraActive,hasCamera:e.hasCamera,toggleCamera:e.toggleCamera})))))},Y=a(615),$=a(601),Q=a(602),V=function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(m.a)(this,Object(h.a)(t).call(this,e))).toggleBrightnesscontrol=a.toggleBrightnesscontrol.bind(Object(S.a)(a)),a.takeReferencePicture=a.takeReferencePicture.bind(Object(S.a)(a)),a.state={referencePicture:!1,loading:!1},a}return Object(u.a)(t,e),Object(c.a)(t,[{key:"toggleBrightnesscontrol",value:function(){this.props.toggleBrightnesscontrol()}},{key:"takeReferencePicture",value:function(){this.props.socket.emit("takeReferencePicture"),this.setState({loading:!0}),this.setState({loading:!1}),this.setState({referencePicture:!0}),this.props.camControlsOk(!0)}},{key:"render",value:function(){return i.a.createElement("div",null,i.a.createElement($.a,{control:i.a.createElement(Y.a,{checked:this.props.brightnessControl,onChange:this.toggleBrightnesscontrol}),label:"Control brightness"}),this.props.brightnessControl&&!this.state.referencePicture&&!this.state.loading&&i.a.createElement(d.a,{variant:"contained",onClick:this.takeReferencePicture},"Take Reference Picture"),this.state.loading&&i.a.createElement(Q.a,null))}}]),t}(i.a.Component),_=a(137);var ee=function(e){return i.a.createElement(n.Fragment,null,i.a.createElement(_.b,{disabled:e.disabled,ampm:!1,openTo:"hours",views:["hours","minutes","seconds"],format:"HH:mm:ss",label:e.label,value:e.value,onChange:function(t){e.onChange(t)}}))},te=a(607),ae=a(614),ne=a(608),ie=a(609),re=a(563),oe=a(616),se=a(620),le=function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(m.a)(this,Object(h.a)(t).call(this,e))).createIntervalOptions=function(){for(var e=[],t=1;t<=120;t++)e.push(i.a.createElement("option",{key:t.toString(),value:t},t));return e},a.handleIntervalChange=a.handleIntervalChange.bind(Object(S.a)(a)),a.handleRecordingTimeChange=a.handleRecordingTimeChange.bind(Object(S.a)(a)),a.handleMovieTimeChange=a.handleMovieTimeChange.bind(Object(S.a)(a)),a.handleDisableChange=a.handleDisableChange.bind(Object(S.a)(a)),a.state={disabled:"interval"},a}return Object(u.a)(t,e),Object(c.a)(t,[{key:"handleIntervalChange",value:function(e){this.props.calculateSliders(this.state.disabled,"interval",e.target.value)}},{key:"handleRecordingTimeChange",value:function(e){var t=this.toSeconds(e);this.props.calculateSliders(this.state.disabled,"recordingTime",t)}},{key:"handleMovieTimeChange",value:function(e){var t=this.toSeconds(e);this.props.calculateSliders(this.state.disabled,"movieTime",t)}},{key:"toDateTime",value:function(e){console.log("lklkl");var t=new Date(1970,0,1);return t.setSeconds(e),t}},{key:"toSeconds",value:function(e){return 3600*e.getHours()+60*e.getMinutes()+e.getSeconds()}},{key:"handleDisableChange",value:function(e){this.setState({disabled:e.target.value})}},{key:"render",value:function(){return console.log("rerender general options"),i.a.createElement("div",null,i.a.createElement(ie.a,{container:!0,spacing:1},i.a.createElement(ie.a,{item:!0,xs:8},i.a.createElement("div",null,i.a.createElement(te.a,null,i.a.createElement(ne.a,{htmlFor:"age-native-simple"},"Interval"),i.a.createElement(ae.a,{native:!0,disabled:"interval"===this.state.disabled,value:this.props.interval,onChange:this.handleIntervalChange,inputProps:{name:"Interval",id:"age-native-simple"}},this.createIntervalOptions()))),i.a.createElement("div",null,i.a.createElement(ee,{disabled:"recordingTime"===this.state.disabled,label:"Recording Time",value:this.toDateTime(this.props.recordingTime),onChange:this.handleRecordingTimeChange})),i.a.createElement("div",null,i.a.createElement(ee,{disabled:"movieTime"===this.state.disabled,label:"Movie Time",value:this.toDateTime(this.props.movieTime),onChange:this.handleMovieTimeChange}))),i.a.createElement(ie.a,{item:!0,xs:4},i.a.createElement(te.a,{component:"fieldset"},i.a.createElement(re.a,{component:"legend"},"Lock"),i.a.createElement(se.a,{"aria-label":"Lock",name:"lock",value:"interval",onChange:this.handleDisableChange},i.a.createElement($.a,{checked:"interval"===this.state.disabled,value:"interval",control:i.a.createElement(oe.a,null),labelPlacement:"top"}),i.a.createElement($.a,{checked:"recordingTime"===this.state.disabled,value:"recordingTime",control:i.a.createElement(oe.a,null),labelPlacement:"top"}),i.a.createElement($.a,{checked:"movieTime"===this.state.disabled,value:"movieTime",control:i.a.createElement(oe.a,null),labelPlacement:"top"}))))))}}]),t}(i.a.Component),ce=a(45),me=a(181),he=a(273),ue=a.n(he),de={listStyleType:"none",lineHeight:"2.5",padding:0},pe={overflow:"auto"},ve={float:"right"},ge=Object(me.sortableElement)(function(e){var t,a=e.value,n=e.onDelete,r=i.a.createElement(L.a,{style:ve,onClick:n,"aria-label":"Delete"},i.a.createElement(ue.a,{fontSize:"small"}));return 3===a.length?t=i.a.createElement("li",{style:pe},"X: ",a[0]," Y: ",a[1]," Z: ",a[2],r):2===a.length&&(t=i.a.createElement("li",{style:pe},"Photos: ",a[0]," Angle: ",a[1],r)),t}),be=Object(me.sortableContainer)(function(e){var t=e.children;return i.a.createElement("ul",{style:de},t)}),fe=function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(m.a)(this,Object(h.a)(t).call(this,e))).onDelete=a.onDelete.bind(Object(S.a)(a)),a.state={items:e.points},a}return Object(u.a)(t,e),Object(c.a)(t,[{key:"onDelete",value:function(e){this.props.handleDelete(e)}},{key:"render",value:function(){var e=this,t=this.props.points;return i.a.createElement(be,{distance:2,onSortEnd:this.props.onSortEnd},t.map(function(t,a){return i.a.createElement(ge,{key:"item-".concat(a),index:a,value:t,onDelete:function(){return e.onDelete(a)}})}))}}]),t}(i.a.Component),Ee=a(618),ke=a(604),Ce=a(603),Oe=a(610),je=a(274),Se=a.n(je),ye=function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(m.a)(this,Object(h.a)(t).call(this,e))).onSortEnd=function(e){var t=e.oldIndex,n=e.newIndex;a.setState(function(e){var a=e.items;return{items:Se()(a,t,n)}})},a.handleClickOpen=a.handleClickOpen.bind(Object(S.a)(a)),a.handleClose=a.handleClose.bind(Object(S.a)(a)),a.onSortEnd=a.onSortEnd.bind(Object(S.a)(a)),a.handleSave=a.handleSave.bind(Object(S.a)(a)),a.handleDelete=a.handleDelete.bind(Object(S.a)(a)),a.state={dialogOpen:!1,items:Object(ce.a)(a.props.items)},a}return Object(u.a)(t,e),Object(c.a)(t,[{key:"componentWillReceiveProps",value:function(e){var t=e.items;this.setState({items:Object(ce.a)(t)})}},{key:"handleClickOpen",value:function(){this.setState({dialogOpen:!0})}},{key:"handleClose",value:function(){this.setState({dialogOpen:!1}),this.setState({items:Object(ce.a)(this.props.items)})}},{key:"handleSave",value:function(){this.props.handleSave(this.state.items),this.setState({dialogOpen:!1})}},{key:"handleDelete",value:function(e){var t=Object(ce.a)(this.state.items);t.splice(e,1),this.setState({items:t})}},{key:"render",value:function(){return i.a.createElement("div",{style:{width:"100%"}},i.a.createElement(d.a,{variant:"outlined",color:"primary",onClick:this.handleClickOpen},"Manage Points"),i.a.createElement(Ee.a,{open:this.state.dialogOpen,onClose:this.handleClose,"aria-labelledby":"alert-dialog-title","aria-describedby":"alert-dialog-description"},i.a.createElement(Oe.a,{id:"alert-dialog-title"},"Rearange or delete Points"),i.a.createElement(Ce.a,null,i.a.createElement(fe,{points:this.state.items,onSortEnd:this.onSortEnd,handleDelete:this.handleDelete})),i.a.createElement(ke.a,null,i.a.createElement(d.a,{onClick:this.handleClose,color:"primary"},"Dismiss"),i.a.createElement(d.a,{onClick:this.handleSave,color:"primary",autoFocus:!0},"Save"))))}}]),t}(i.a.Component),Te=a(275),we=a.n(Te);var Pe=function(e){var t=Object(n.useState)("z"),a=Object(A.a)(t,2),r=a[0],o=a[1];return i.a.createElement("div",null,i.a.createElement(te.a,{component:"fieldset"},i.a.createElement(se.a,{"aria-label":"Axis",name:"axis",value:"X-Axis",onChange:function(t){return function(t){o(t.target.value),e.handleAxisChange(t.target.value)}(t)},row:!0},3===e.nrOfAxis&&i.a.createElement($.a,{label:"X",checked:"x"===r,value:"x",control:i.a.createElement(oe.a,null),labelPlacement:"start"}),i.a.createElement($.a,{label:"Y",checked:"y"===r,value:"y",control:i.a.createElement(oe.a,null),labelPlacement:"start"}),i.a.createElement($.a,{label:"Z",checked:"z"===r,value:"z",control:i.a.createElement(oe.a,null),labelPlacement:"start"}))))},Ae=Object(P.a)(function(e){return{container:{position:"relative"}}});function xe(e){var t=Ae(),a=Object(n.useState)("z"),r=Object(A.a)(a,2),o=r[0],s=r[1];return i.a.createElement("div",{className:t.container},i.a.createElement(Pe,{nrOfAxis:e.nrOfAxis,handleAxisChange:function(e){s(e)}}),i.a.createElement(we.a,{options:{mode:"static",position:{top:"60%",left:"50%"},threshold:.2,lockX:!0,color:"black"},style:{outline:"1px dashed red",width:"100%",height:130},onEnd:function(t,a){return e.socket.emit("stop reposition")},onPlain:function(t,a){e.socket.emit("stop reposition"),"right"===a.direction.x?e.socket.emit("reposition",{axis:o,direction:"right"}):"left"===a.direction.x&&e.socket.emit("reposition",{axis:o,direction:"left"})}}))}var Ie=function(e){return i.a.createElement(k.Consumer,null,function(t){return i.a.createElement(xe,Object.assign({},e,{socket:t}))})},Re=function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(m.a)(this,Object(h.a)(t).call(this,e))).handleSave=a.handleSave.bind(Object(S.a)(a)),a.getAndSavePosition=a.getAndSavePosition.bind(Object(S.a)(a)),a.sendPoints=a.sendPoints.bind(Object(S.a)(a)),a.addtoLocal=a.addtoLocal.bind(Object(S.a)(a)),a.state={points:[]},a}return Object(u.a)(t,e),Object(c.a)(t,[{key:"componentDidMount",value:function(){this.props.socket.on("reportingPosition",function(e){console.log(e);var t=[e.x,e.y,e.z];this.addtoLocal(t)}.bind(this))}},{key:"addtoLocal",value:function(e){this.setState({points:[].concat(Object(ce.a)(this.state.points),[e])},function(){this.sendPoints()})}},{key:"getAndSavePosition",value:function(){this.props.socket.emit("getPosition")}},{key:"handleSave",value:function(e){this.setState({points:e},function(){this.sendPoints()})}},{key:"sendPoints",value:function(){this.props.socket.emit("points",{points:this.state.points}),this.props.handlePointsChange(this.state.points.length)}},{key:"render",value:function(){return i.a.createElement("div",{style:{width:"100%"}},i.a.createElement(ie.a,{container:!0,spacing:1},i.a.createElement(ie.a,{item:!0,xs:8},i.a.createElement(Ie,{nrOfAxis:3})),i.a.createElement(ie.a,{item:!0,xs:4},i.a.createElement(ye,{items:this.state.points,handleSave:this.handleSave}))),i.a.createElement(d.a,{variant:"outlined",onClick:this.getAndSavePosition},"Add Point"))}}]),t}(i.a.Component),De=a(621),Be=a(612),Ne=a(613),ze=a(52),Ze=a.n(ze),Me=a(611),Le=(a(350),function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(m.a)(this,Object(h.a)(t).call(this,e))).toggleCamera=a.toggleCamera.bind(Object(S.a)(a)),a.activateCamera=a.activateCamera.bind(Object(S.a)(a)),a.toggleBrightnesscontrol=a.toggleBrightnesscontrol.bind(Object(S.a)(a)),a.camControlsOk=a.camControlsOk.bind(Object(S.a)(a)),a.pointsOk=a.pointsOk.bind(Object(S.a)(a)),a.calculateSliders=a.calculateSliders.bind(Object(S.a)(a)),a.timelapse=a.timelapse.bind(Object(S.a)(a)),a.state={initializing:!0,hasCamera:!1,cameraActive:!1,brightnessControl:!1,camControlsOk:!1,pointsOk:!1,interval:10,recordingTime:6e3,movieTime:12},a}return Object(u.a)(t,e),Object(c.a)(t,[{key:"componentDidMount",value:function(){var e=this;this.activateCamera(),this.props.socket.on("initDone",function(){e.setState({initializing:!1})}),this.props.socket.emit("init"),this.props.socket.on("hasCamera",function(t){e.setState({cameraActive:t.hasCamera}),e.setState({hasCamera:t.hasCamera})})}},{key:"activateCamera",value:function(){this.props.socket.emit("requestCamera")}},{key:"toggleCamera",value:function(){this.state.cameraActive?this.setState({cameraActive:!this.state.cameraActive}):this.activateCamera()}},{key:"toggleBrightnesscontrol",value:function(){this.setState({brightnessControl:!this.state.brightnessControl})}},{key:"camControlsOk",value:function(e){this.setState({camControlsOk:e})}},{key:"pointsOk",value:function(e){this.setState({pointsOk:e>1})}},{key:"calculateSliders",value:function(e,t,a){var n;console.log(e+t+a),"interval"===e&&"recordingTime"===t?(n=a/this.state.interval/25,this.setState({recordingTime:a}),this.setState({movieTime:n})):"interval"===e&&"movieTime"===t?(n=25*a*this.state.interval,this.setState({movieTime:a}),this.setState({recordingTime:n})):"recordingTime"===e&&"interval"===t?(n=this.state.recordingTime/a/25,this.setState({interval:a}),this.setState({movieTime:n})):"recordingTime"===e&&"movieTime"===t?(n=this.state.recordingTime/(25*a),this.setState({movieTime:a}),this.setState({interval:n})):"movieTime"===e&&"interval"===t?(n=this.state.movieTime*a*25,this.setState({interval:a}),this.setState({recordingTime:n})):"movieTime"===e&&"recordingTime"===t&&(n=a/(25*this.state.movieTime),this.setState({recordingTime:a}),this.setState({interval:n}))}},{key:"timelapse",value:function(){this.props.socket.emit("timelapse",{interval:this.state.interval,movieTime:this.state.movieTime,cameraControl:this.state.cameraActive,ramping:this.state.brightnessControl})}},{key:"render",value:function(){return this.state.initializing?i.a.createElement("div",null,i.a.createElement("br",null),i.a.createElement(Me.a,null),i.a.createElement(Me.a,{color:"secondary"})):i.a.createElement("div",null,i.a.createElement(J,{title:"Timelapse",cameraActive:this.state.cameraActive,hasCamera:this.state.hasCamera,toggleCamera:this.toggleCamera,backButton:!0})," ",this.state.cameraActive&&i.a.createElement(V,{brightnessControl:this.state.brightnessControl,toggleBrightnesscontrol:this.toggleBrightnesscontrol,camControlsOk:this.camControlsOk,socket:this.props.socket})," ",(!this.state.brightnessControl||this.state.brightnessControl&&this.state.camControlsOk)&&i.a.createElement("div",null,i.a.createElement(De.a,null,i.a.createElement(Be.a,{expandIcon:i.a.createElement(Ze.a,null),"aria-controls":"panel1a-content",id:"panel1a-header"},i.a.createElement(w.a,null,"General Options")),i.a.createElement(Ne.a,null,i.a.createElement(le,{interval:this.state.interval,recordingTime:this.state.recordingTime,movieTime:this.state.movieTime,calculateSliders:this.calculateSliders}))),i.a.createElement(De.a,null,i.a.createElement(Be.a,{expandIcon:i.a.createElement(Ze.a,null),"aria-controls":"panel1a-content",id:"panel1a-header"},i.a.createElement(w.a,null,"Timelapse Points")),i.a.createElement(Ne.a,null,i.a.createElement(Re,{socket:this.props.socket,handlePointsChange:this.pointsOk})))),this.state.pointsOk&&this.camControlsOk&&i.a.createElement(d.a,{variant:"outlined",onClick:this.timelapse,component:C.b,to:"/runningTimelapse"},"Start"))}}]),t}(i.a.Component)),He=function(e){return i.a.createElement(k.Consumer,null,function(t){return i.a.createElement(Le,Object.assign({},e,{socket:t}))})};function Fe(e,t){if(e===t)return!0;if(null==e||null==t)return!1;if(e.length!=t.length)return!1;for(var a=0;a<e.length;++a)if(e[a]!==t[a])return!1;return!0}var We=function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(m.a)(this,Object(h.a)(t).call(this,e))).createAngleOptions=function(){for(var e=[],t=90;t>=-90;t--)e.push(i.a.createElement("option",{value:t},t));return e},a.createPicturesOptions=function(){for(var e=[],t=1;t<=30;t++)e.push(i.a.createElement("option",{value:t},t));return e},a.handleSave=a.handleSave.bind(Object(S.a)(a)),a.handlePicturesChange=a.handlePicturesChange.bind(Object(S.a)(a)),a.handleAngleChange=a.handleAngleChange.bind(Object(S.a)(a)),a.addRow=a.addRow.bind(Object(S.a)(a)),a.toggleZN=a.toggleZN.bind(Object(S.a)(a)),a.deleteZN=a.deleteZN.bind(Object(S.a)(a)),a.state={angle:0,pictures:1,nadir:!1,zenit:!1,rows:[]},a}return Object(u.a)(t,e),Object(c.a)(t,[{key:"handlePicturesChange",value:function(e){this.setState({pictures:e.target.value})}},{key:"handleAngleChange",value:function(e){this.setState({angle:e.target.value})}},{key:"addRow",value:function(e){var t;t=Array.isArray(e)?e:[this.state.pictures,this.state.angle],this.setState({rows:[].concat(Object(ce.a)(this.state.rows),[t])},function(){this.props.handleRowChange(this.state.rows)})}},{key:"handleSave",value:function(e){this.setState({rows:e},function(){this.props.handleRowChange(this.state.rows)})}},{key:"toggleZN",value:function(e){e?this.setState({zenit:!this.state.zenit},function(){this.state.zenit?this.addRow([1,90]):this.deleteZN(!0)}):this.setState({nadir:!this.state.nadir},function(){this.state.nadir?this.addRow([1,-90]):this.deleteZN(!1)})}},{key:"deleteZN",value:function(e){var t,a=this.state.rows;t=e?[1,90]:[1,-90];for(var n=a.length-1;n>=0;n--)Fe(a[n],t)&&(console.log("DELETE NOW"),a.splice(n,1));this.handleSave(a)}},{key:"render",value:function(){var e=this;return i.a.createElement("div",{style:{width:"100%"}},i.a.createElement($.a,{control:i.a.createElement(Y.a,{checked:this.state.zenit,onChange:function(){return e.toggleZN(!0)}}),label:"Zenit"}),i.a.createElement($.a,{control:i.a.createElement(Y.a,{checked:this.state.nadir,onChange:function(){return e.toggleZN(!1)}}),label:"Nadir"}),i.a.createElement(ie.a,{container:!0,spacing:1},i.a.createElement(ie.a,{item:!0,xs:8},i.a.createElement(te.a,null,i.a.createElement(ne.a,{htmlFor:"age-native-simple"},"Angle"),i.a.createElement(ae.a,{native:!0,value:this.state.angle,onChange:this.handleAngleChange,inputProps:{name:"Interval",id:"age-native-simple"}},this.createAngleOptions())),i.a.createElement(te.a,null,i.a.createElement(ne.a,{htmlFor:"age-native-simple"},"Pictures"),i.a.createElement(ae.a,{native:!0,value:this.state.pictures,onChange:this.handlePicturesChange,inputProps:{name:"Interval",id:"age-native-simple"}},this.createPicturesOptions()))),i.a.createElement(ie.a,{item:!0,xs:4},i.a.createElement(ye,{items:this.state.rows,handleSave:this.handleSave}))),i.a.createElement(d.a,{variant:"outlined",onClick:this.addRow},"Add Point"))}}]),t}(i.a.Component),Ge=function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(m.a)(this,Object(h.a)(t).call(this,e))).state={axis:[]},a}return Object(u.a)(t,e),Object(c.a)(t,[{key:"render",value:function(){return i.a.createElement("div",null,i.a.createElement(Ie,null),i.a.createElement(d.a,{variant:"outlined",onClick:this.props.setZero},"Set zero"))}}]),t}(i.a.Component),qe=function(e){function t(e){var a;Object(l.a)(this,t),(a=Object(m.a)(this,Object(h.a)(t).call(this,e))).createIntervalOptions=function(){for(var e=[],t=1;t<=120;t++)e.push(i.a.createElement("option",{key:t,value:t},t));return e},a.toggleCamera=a.toggleCamera.bind(Object(S.a)(a)),a.activateCamera=a.activateCamera.bind(Object(S.a)(a)),a.toggleHdr=a.toggleHdr.bind(Object(S.a)(a)),a.handleIntervalChange=a.handleIntervalChange.bind(Object(S.a)(a)),a.createIntervalOptions=a.createIntervalOptions.bind(Object(S.a)(a)),a.handleRowChange=a.handleRowChange.bind(Object(S.a)(a)),a.panorama=a.panorama.bind(Object(S.a)(a)),a.setZero=a.setZero.bind(Object(S.a)(a));var n=e.socket;return a.state={hasCamera:!1,cameraActive:!1,hdr:!1,waterscale:!1,interval:10,rows:[]},n.on("hasCamera",function(e){a.setState({cameraActive:e.hasCamera}),a.setState({hasCamera:e.hasCamera})}),a}return Object(u.a)(t,e),Object(c.a)(t,[{key:"componentDidMount",value:function(){this.activateCamera()}},{key:"activateCamera",value:function(){this.props.socket.emit("requestCamera")}},{key:"toggleCamera",value:function(){this.state.cameraActive?this.setState({cameraActive:!this.state.cameraActive}):this.activateCamera()}},{key:"toggleHdr",value:function(){this.setState({hdr:!this.state.hdr})}},{key:"handleIntervalChange",value:function(e){this.setState({interval:e.target.value})}},{key:"handleRowChange",value:function(e){this.setState({rows:e})}},{key:"setZero",value:function(){this.setState({waterscale:!0}),this.props.socket.emit("waterscale")}},{key:"panorama",value:function(){this.props.socket.emit("panorama",{config:this.state.rows,interval:this.state.interval,cameraControl:this.state.cameraActive,hdr:this.state.hdr})}},{key:"render",value:function(){return i.a.createElement("div",null,i.a.createElement(J,{title:"Panorama",cameraActive:this.state.cameraActive,hasCamera:this.state.hasCamera,toggleCamera:this.toggleCamera,backButton:!0}),i.a.createElement("div",null,!this.state.waterscale&&i.a.createElement(Ge,{nrOfAxis:2,setZero:this.setZero}),this.state.waterscale&&i.a.createElement("div",null,i.a.createElement(De.a,null,i.a.createElement(Be.a,{expandIcon:i.a.createElement(Ze.a,null),"aria-controls":"panel1a-content",id:"panel1a-header"},i.a.createElement(w.a,null,"General Options")),i.a.createElement(Ne.a,null,i.a.createElement(te.a,null,i.a.createElement(ne.a,{htmlFor:"age-native-simple"},"Interval"),i.a.createElement(ae.a,{native:!0,value:this.state.interval,onChange:this.handleIntervalChange,inputProps:{name:"Interval",id:"age-native-simple"}},this.createIntervalOptions())),this.state.cameraActive&&i.a.createElement($.a,{control:i.a.createElement(Y.a,{checked:this.state.hdr,onChange:this.toggleHdr}),label:"HDR"}))),i.a.createElement(De.a,null,i.a.createElement(Be.a,{expandIcon:i.a.createElement(Ze.a,null),"aria-controls":"panel1a-content",id:"panel1a-header"},i.a.createElement(w.a,null,"Panorama Options")),i.a.createElement(Ne.a,null,i.a.createElement(We,{rows:this.state.rows,handleRowChange:this.handleRowChange}))),this.state.rows.length>0&&i.a.createElement(d.a,{variant:"outlined",onClick:this.panorama,component:C.b,to:"/runningPanorama"},"Start"))))}}]),t}(i.a.Component),Ue=function(e){return i.a.createElement(k.Consumer,null,function(t){return i.a.createElement(qe,Object.assign({},e,{socket:t}))})},Xe=function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(m.a)(this,Object(h.a)(t).call(this,e))).toggleCamera=a.toggleCamera.bind(Object(S.a)(a)),a.activateCamera=a.activateCamera.bind(Object(S.a)(a)),a.toggleBrightnesscontrol=a.toggleBrightnesscontrol.bind(Object(S.a)(a)),a.camControlsOk=a.camControlsOk.bind(Object(S.a)(a)),a.pointsOk=a.pointsOk.bind(Object(S.a)(a)),a.calculateSliders=a.calculateSliders.bind(Object(S.a)(a)),a.state={hasCamera:!1,cameraActive:!1,brightnessControl:!1,camControlsOk:!1,pointsOk:!1,interval:10,recordingTime:6e3,movieTime:12},a}return Object(u.a)(t,e),Object(c.a)(t,[{key:"componentDidMount",value:function(){this.activateCamera()}},{key:"activateCamera",value:function(){}},{key:"toggleCamera",value:function(){this.state.cameraActive?this.setState({cameraActive:!this.state.cameraActive}):this.activateCamera()}},{key:"toggleBrightnesscontrol",value:function(){this.setState({brightnessControl:!this.state.brightnessControl})}},{key:"camControlsOk",value:function(e){this.setState({camControlsOk:e})}},{key:"pointsOk",value:function(e){this.setState({pointsOk:e>1})}},{key:"calculateSliders",value:function(e,t,a){var n;"interval"===e&&"recordingTime"===t?(n=a/this.state.interval/25,this.setState({recordingTime:a}),this.setState({movieTime:n})):"interval"===e&&"movieTime"===t?(n=25*a*this.state.interval,this.setState({movieTime:a}),this.setState({recordingTime:n})):"recordingTime"===e&&"interval"===t?(n=this.state.recordingTime/a/25,this.setState({interval:a}),this.setState({movieTime:n})):"recordingTime"===e&&"movieTime"===t?(n=this.state.recordingTime/(25*a),this.setState({movieTime:a}),this.setState({interval:n})):"movieTime"===e&&"interval"===t?(n=this.state.movieTime*a*25,this.setState({interval:a}),this.setState({recordingTime:n})):"movieTime"===e&&"recordingTime"===t&&(n=a/(25*this.state.movieTime),this.setState({recordingTime:a}),this.setState({interval:n}))}},{key:"render",value:function(){return i.a.createElement("div",null,i.a.createElement(J,{title:"Timelapse",cameraActive:this.state.cameraActive,hasCamera:this.state.hasCamera,toggleCamera:this.toggleCamera,backButton:!0})," ",this.state.cameraActive&&i.a.createElement(V,{brightnessControl:this.state.brightnessControl,toggleBrightnesscontrol:this.toggleBrightnesscontrol,camControlsOk:this.camControlsOk})," ",(!this.state.brightnessControl||this.state.brightnessControl&&this.state.camControlsOk)&&i.a.createElement("div",null,i.a.createElement(De.a,null,i.a.createElement(Be.a,{expandIcon:i.a.createElement(Ze.a,null),"aria-controls":"panel1a-content",id:"panel1a-header"},i.a.createElement(w.a,null,"General Options")),i.a.createElement(Ne.a,null,i.a.createElement(le,{interval:this.state.interval,recordingTime:this.state.recordingTime,movieTime:this.state.movieTime,calculateSliders:this.calculateSliders}))),i.a.createElement(De.a,null,i.a.createElement(Be.a,{expandIcon:i.a.createElement(Ze.a,null),"aria-controls":"panel1a-content",id:"panel1a-header"},i.a.createElement(w.a,null,"Timelapse Points")),i.a.createElement(Ne.a,null,i.a.createElement(Re,{handlePointsChange:this.pointsOk})))),this.state.pointsOk&&this.camControlsOk&&i.a.createElement(d.a,{variant:"outlined"},"Start"))}}]),t}(i.a.Component),Ke=a(54),Je=function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(m.a)(this,Object(h.a)(t).call(this,e))).state={data:[],progress:0},a}return Object(u.a)(t,e),Object(c.a)(t,[{key:"componentDidMount",value:function(){var e=this,t=[];this.props.waypoints.forEach(function(e){var a=Object.assign({},e);t.push(a)}),this.setState({data:t}),this.props.socket.on("progress",function(t){e.setState({progress:t.value})})}},{key:"render",value:function(){return i.a.createElement("div",null,i.a.createElement(Ke.c,{width:300,height:100,data:this.state.data},i.a.createElement(Ke.b,{type:"monotone",dot:!1,dataKey:"1",stroke:"#006992",strokeWidth:2}),i.a.createElement(Ke.b,{type:"monotone",dot:!1,dataKey:"2",stroke:"#ECA400",strokeWidth:2}),i.a.createElement(Ke.f,{x:this.state.progress,stroke:"red"})))}}]),t}(i.a.Component),Ye=function(e){return i.a.createElement(k.Consumer,null,function(t){return i.a.createElement(Je,Object.assign({},e,{socket:t}))})},$e=function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(m.a)(this,Object(h.a)(t).call(this,e))).retake=a.retake.bind(Object(S.a)(a)),a.state={data:[],progress:0,progressState:[]},a}return Object(u.a)(t,e),Object(c.a)(t,[{key:"componentDidMount",value:function(){var e=this,t=[],a=[],n=0;this.props.config.forEach(function(e){for(var i=[],r=0;r<e[0];r++){var o=Object.assign({image:n,angle:e[1],innerIndex:r,value:1});n++,console.log(o),i.push(o),a.push(!1)}t.push(i)}),a[0]=!0,this.setState({data:t}),this.setState({progressState:a}),this.props.socket.on("progress",function(t){var a=e.state.progressState;a[t.value]=!0,e.setState({progressState:a})})}},{key:"retake",value:function(e,t){var a=e[1],n=e[0];console.log(a+" "+n+" "+t),this.props.socket.emit("retakePanoPicture",{angle:a,index:n,totalInRow:t})}},{key:"generatePies",value:function(){for(var e=[],t=0;t<this.state.data.length;t++){var a=this.state.data[t];e.push(i.a.createElement(Ke.d,{key:t,data:a,dataKey:"value",cx:155,cy:150,outerRadius:25*(t+1),innerRadius:25*(t+1)-20,paddingAngle:0,fill:"#8884d8"},this.generateCells(a)," "))}return e}},{key:"generateCells",value:function(e){for(var t=this,a=[],n=function(){var n=e[r].image,o=[e[r].innerIndex,e[r].angle];console.log(o);var s=e.length;a.push(i.a.createElement(Ke.a,{key:n,onClick:function(){return t.retake(o,s)},fill:t.state.progressState[n]?"#00C49F":"#FF8042"}))},r=0;r<e.length;r++)n();return a}},{key:"render",value:function(){return i.a.createElement("div",null,i.a.createElement(Ke.e,{width:500,height:400},this.generatePies()))}}]),t}(i.a.Component),Qe=function(e){return i.a.createElement(k.Consumer,null,function(t){return i.a.createElement($e,Object.assign({},e,{socket:t}))})},Ve=a(136),_e=function(e){function t(e){var a;return Object(l.a)(this,t),(a=Object(m.a)(this,Object(h.a)(t).call(this,e))).togglePause=a.togglePause.bind(Object(S.a)(a)),a.abort=a.abort.bind(Object(S.a)(a)),a.state={maxProgress:100,waypoints:void 0,amountPauses:0,panoConfig:void 0,pause:!1},a}return Object(u.a)(t,e),Object(c.a)(t,[{key:"componentDidMount",value:function(){var e=this;this.props.socket.on("progress",function(t){e.setState({progress:t.value,maxProgress:t.max})}),this.props.socket.on("timelapseInfoResponse",function(t){console.log("hey"),e.setState({waypoints:t.waypoints})}),this.props.socket.on("panoramaInfoResponse",function(t){e.setState({panoConfig:t.config})}),"/runningPanorama"===this.props.location.pathname?this.props.socket.emit("panoramaInfo"):"/runningTimelapse"===this.props.location.pathname&&this.props.socket.emit("timelapseInfo"),this.props.socket.on("isBusy",function(t){e.props.enqueueSnackbar("CamSlider is busy"),t.fromSingle&&e.setState({pause:!0})})}},{key:"componentWillUnmount",value:function(){this.props.socket.removeAllListeners("progress"),this.props.socket.removeAllListeners("timelapseInfoResponse"),this.props.socket.removeAllListeners("panoramaInfoResponse"),this.props.socket.removeAllListeners("isBusy")}},{key:"togglePause",value:function(){this.setState({pause:!this.state.pause},function(){this.state.pause?this.props.socket.emit("pause"):this.props.socket.emit("resume")})}},{key:"abort",value:function(){this.props.socket.emit("abort"),"timelapse"===this.props.type&&(window.location.href="/timelapse"),"panorama"===this.props.type&&(window.location.href="/panorama"),"movie"===this.props.type&&(window.location.href="/movie")}},{key:"render",value:function(){var e=this.props.type,t=e.charAt(0).toUpperCase()+e.slice(1);return i.a.createElement("div",null,i.a.createElement(J,{title:t+" Progress"}),"timelapse"===this.props.type&&void 0!==this.state.waypoints&&i.a.createElement(Ye,{waypoints:this.state.waypoints}),"panorama"===this.props.type&&void 0!==this.state.panoConfig&&i.a.createElement("div",null,i.a.createElement(Qe,{config:this.state.panoConfig}),i.a.createElement(d.a,{variant:"outlined",onClick:this.togglePause},this.state.pause?"Resume":"Pause")),i.a.createElement(d.a,{style:{border:0,borderRadius:3,color:"red",height:30,padding:"0 0",marginTop:"2em",position:"absolute",left:"1em",top:"2.5em"},color:"secondary",variant:"outlined",onClick:this.abort},"Abort"))}}]),t}(i.a.Component),et=Object(Ve.withSnackbar)(function(e){return i.a.createElement(k.Consumer,null,function(t){return i.a.createElement(_e,Object.assign({},e,{socket:t}))})});function tt(e){return e.socket.on("status",function(e){switch(e.running){case"timelapse":"/runningTimelapse"!=window.location.pathname&&(window.location.href="/runningTimelapse"),console.log("timelapse running");break;case"panorama":"/runningPanorama"!=window.location.pathname&&(window.location.href="/runningPanorama"),console.log("panorama running");break;case null:console.log("nothing running")}}),e.socket.emit("requestStatus"),i.a.createElement("main",null,i.a.createElement(s.c,null,i.a.createElement(s.a,{exact:!0,path:"/",component:j}),i.a.createElement(s.a,{path:"/timelapse",component:He}),i.a.createElement(s.a,{path:"/panorama",component:Ue}),i.a.createElement(s.a,{path:"/movie",component:Xe}),i.a.createElement(s.a,{path:"/runningTimelapse",render:function(e){return i.a.createElement(et,Object.assign({},e,{type:"timelapse"}))}}),i.a.createElement(s.a,{path:"/runningPanorama",render:function(e){return i.a.createElement(et,Object.assign({},e,{type:"panorama"}))}})))}var at=function(e){return i.a.createElement(k.Consumer,null,function(t){return i.a.createElement(tt,Object.assign({},e,{socket:t}))})},nt=a(265),it=a(176),rt=a.n(it),ot=a(288),st=a.n(ot),lt=(a(528),a(289)),ct=a(287),mt=a.n(ct),ht=Object(I.a)({palette:{primary:st.a,secondary:rt.a}});var ut=function(){var e=mt()("http://localhost:8000");return i.a.createElement("div",{className:"App"},i.a.createElement(k.Provider,{value:e},i.a.createElement(Ve.SnackbarProvider,{maxSnack:3,dense:!0,anchorOrigin:{vertical:"top",horizontal:"center"}},i.a.createElement(_.a,{utils:lt.a},i.a.createElement(nt.a,{theme:ht},i.a.createElement(at,null))))))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(i.a.createElement(C.a,null,i.a.createElement(ut,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[328,1,2]]]);
//# sourceMappingURL=main.8aaf336e.chunk.js.map