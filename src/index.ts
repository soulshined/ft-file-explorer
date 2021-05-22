/// <reference path="./model/options.ts" />
/// <reference path="./model/element.ts" />
/// <reference path="./model/tree/handler.ts" />
/// <reference path="./model/ft-file-explorer.ts" />

'use strict';

(function writeStylesToDOM() {
    const style = document.createElement('STYLE');
    // @ts-ignore
    style.type = 'text/css';
    style.appendChild(document.createTextNode(`/*
$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
$$$    FT-FILE-EXPLORER CREATED BY github.com/soulshined    $$$
$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/
:root{--ft-fe-active:#e4e6f1;--ft-fe-hover:#e8e8e8}.ft-file-explorer,.ft-file-explorer ul{margin:0;padding:0}.ft-file-explorer *{box-sizing:border-box}.ft-file-explorer .explorer>ul.tree{display:flex;flex-flow:column nowrap;flex:1}.ft-file-explorer .explorer>ul.tree li{list-style:none;cursor:pointer;word-break:keep-all;white-space:nowrap;padding:0;margin:0}.ft-file-explorer .explorer>ul.tree>li:not(.root){padding-left:10px}.ft-file-explorer .explorer.compact>ul.tree li.files{text-indent:7px}.ft-file-explorer li.file.active,.ft-file-explorer li.folder.active{background-color:var(--ft-fe-active)}.ft-file-explorer li.file:focus:not(.active),.ft-file-explorer li.file:hover,.ft-file-explorer li.folder:focus:not(.active),.ft-file-explorer li.folder:hover{background-color:var(--ft-fe-hover)}.ft-file-explorer .explorer>ul.tree li.file,.ft-file-explorer .explorer>ul.tree li.folder{display:flex;align-items:center;user-select:none;padding-top:2px!important;padding-bottom:2px!important}.ft-file-explorer .explorer li.folder::before{display:flex;padding-right:calc(1em / 3);align-self:flex-start;content:url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" fill="%23C8C8C8"><path d="M22,6H12l-2-2H2v16h20V6z"></path></svg>');width:1em;height:1em}.ft-file-explorer .explorer li.folder.open::before{content:url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" fill="%23C8C8C8"><path d="M22,6H12l-2-2H2v16h20V6z M20,18H4V8h16V18z"></path></svg>');width:1em;height:1em}.ft-file-explorer .explorer.compact li.folder::before{padding-right:0;content:url("data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14' width='18px' height='18px'><path fill='%23C8C8C8' d='M6 4v8l4-4-4-4zm1 2.414L8.586 8 7 9.586V6.414z'/></svg>")}.ft-file-explorer .explorer.compact li.folder.open::before{content:url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="18px" height="18px"><path fill="%23C8C8C8" d="M11 10H5.344L11 4.414V10z"/></svg>')}.ft-file-explorer li.folder:not(.open)+li.subtree{display:none}`));
    document.head.prepend(style);
}());

if (!HTMLElement.prototype.scrollTo) {
    // @ts-ignore
    HTMLElement.prototype.scrollTo = function (left, top) {
        this.scrollTop = top; this.scrollLeft = left;
    }
}

// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
    // @ts-ignore
    module.exports = {
        FTFileExplorer,
        FTFileExplorerOptions
    };
}

if (typeof window !== "undefined") {
    // @ts-ignore
    window.FTFileExplorer = FTFileExplorer;
    // @ts-ignore
    window.FTFileExplorerOptions = FTFileExplorerOptions;
}