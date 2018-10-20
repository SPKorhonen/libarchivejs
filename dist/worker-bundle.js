!function(){"use strict";const e={32768:"FILE",16384:"DIR",40960:"SYMBOLIC_LINK",49152:"SOCKET",8192:"CHARACTER_DEVICE",24576:"BLOCK_DEVICE",4096:"NAMED_PIPE"};class t{constructor(e){this._wasmModule=e,this._runCode=e.runCode,this._file=null}open(e){null!==this._file&&(console.warn("Closing previous file"),this.close());const{promise:t,resolve:r,reject:s}=this._promiseHandles();this._file=e;const i=new FileReader;return i.onload=(()=>this._loadFile(i.result,r,s)),i.readAsArrayBuffer(e),t}close(){this._runCode.closeArchive(this._archive),this._wasmModule._free(this._filePtr),this._file=null,this._filePtr=null,this._archive=null}*entries(t=!1){let r;for(this._archive=this._runCode.openArchive(this._filePtr,this._fileLength);0!==(r=this._runCode.getNextEntry(this._archive));){const s={size:this._runCode.getEntrySize(r),path:this._runCode.getEntryName(r),type:e[this._runCode.getEntryType(r)]};if(t)this._runCode.skipEntry(this._archive);else{const e=this._runCode.getFileData(this._archive,s.size);if(e<0)throw new Error(this._runCode.getError(this._archive));const t=this._wasmModule.HEAP8.slice(e,e+s.size);if(this._wasmModule._free(e),"FILE"===s.type){let e=s.path.split("/");e=e[e.length-1],s.file=new File([t],e,{type:"application/octet-stream"})}}yield s}}_loadFile(e,t,r){try{const s=new Uint8Array(e);this._fileLength=s.length,this._filePtr=this._runCode.malloc(this._fileLength),this._wasmModule.HEAP8.set(s,this._filePtr),t()}catch(e){r(e)}}_promiseHandles(){let e=null,t=null;return{promise:new Promise((r,s)=>{e=r,t=s}),resolve:e,reject:t}}}self.Module=new class{constructor(){this.preRun=[],this.postRun=[],this.totalDependencies=0}onRuntimeInitialized(){this.runCode={getVersion:Module.cwrap("get_version","string",[]),openArchive:Module.cwrap("archive_open","number",["number","number"]),getNextEntry:Module.cwrap("get_next_entry","number",["number"]),getFileData:Module.cwrap("get_filedata","number",["number","number"]),skipEntry:Module.cwrap("archive_read_data_skip","number",["number"]),closeArchive:Module.cwrap("archive_close",null,["number"]),getEntrySize:Module.cwrap("archive_entry_size","number",["number"]),getEntryName:Module.cwrap("archive_entry_pathname","string",["number"]),getEntryType:Module.cwrap("archive_entry_filetype","number",["number"]),getError:Module.cwrap("archive_error_string","string",["number"]),malloc:Module.cwrap("malloc","number",["number"]),free:Module.cwrap("free",null,["number"])},console.log(this.runCode.getVersion()),this.ready&&this.ready()}print(...e){console.log(e)}printErr(...e){console.error(e)}monitorRunDependencies(e){}locateFile(e,t=""){return`wasm-gen/${t}${e}`}},importScripts("wasm-gen/libarchive.js");let r=null,s=!1;self.Module.ready=(()=>{r=new t(self.Module),s=!1,self.postMessage({type:"READY"})}),self.onmessage=(async({data:e})=>{if(s)return void self.postMessage({type:"BUSY"});let t=!1;s=!0;try{switch(e.type){case"HELLO":break;case"OPEN":await r.open(e.file),self.postMessage({type:"OPENED"});break;case"LIST_FILES":t=!0;case"EXTRACT_FILES":for(const e of r.entries(t))self.postMessage({type:"ENTRY",entry:e});self.postMessage({type:"END"});break;default:throw new Error("Invalid Command")}}catch(e){self.postMessage({type:"ERROR",error:{message:e.message,name:e.name,stack:e.stack}})}finally{s=!1}})}();
