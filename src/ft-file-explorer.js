'use strict';
;
class FTFileExplorerOptions {
    constructor(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        this.isDebug = false;
        this.explorerStyle = 'material';
        this.expandFolders = false;
        this.rootPath = null;
        this.allowKeyboardEventsOnFocus = false;
        this.buttons = {
            addFile: {
                visible: true,
                text: 'Add File'
            },
            addFolder: {
                visible: true,
                text: 'Add Folder'
            },
            delete: {
                visible: true,
                text: 'Delete'
            }
        };
        if (!options)
            return;
        this.isDebug = this.define(options.isDebug, true, [true, false], true);
        this.expandFolders = this.define(options.expandFolders, true, [true, false], true);
        this.explorerStyle = this.define((_a = options.explorerStyle, (_a !== null && _a !== void 0 ? _a : 'material')), 'material', ['material', 'compact']);
        this.rootPath = (_b = options.rootPath, (_b !== null && _b !== void 0 ? _b : null));
        this.buttons = {
            delete: {
                visible: this.define((_e = (_d = (_c = options.buttons) === null || _c === void 0 ? void 0 : _c.delete) === null || _d === void 0 ? void 0 : _d.visible, (_e !== null && _e !== void 0 ? _e : true)), true, [true, false], true),
                text: this.define((_h = (_g = (_f = options.buttons) === null || _f === void 0 ? void 0 : _f.delete) === null || _g === void 0 ? void 0 : _g.text, (_h !== null && _h !== void 0 ? _h : 'Delete')), 'Delete', [], true)
            },
            addFile: {
                visible: this.define((_l = (_k = (_j = options.buttons) === null || _j === void 0 ? void 0 : _j.addFile) === null || _k === void 0 ? void 0 : _k.visible, (_l !== null && _l !== void 0 ? _l : true)), true, [true, false], true),
                text: this.define((_p = (_o = (_m = options.buttons) === null || _m === void 0 ? void 0 : _m.addFile) === null || _o === void 0 ? void 0 : _o.text, (_p !== null && _p !== void 0 ? _p : 'Add File')), 'Add File', [], true)
            },
            addFolder: {
                visible: this.define((_s = (_r = (_q = options.buttons) === null || _q === void 0 ? void 0 : _q.addFolder) === null || _r === void 0 ? void 0 : _r.visible, (_s !== null && _s !== void 0 ? _s : true)), true, [true, false], true),
                text: this.define((_v = (_u = (_t = options.buttons) === null || _t === void 0 ? void 0 : _t.addFolder) === null || _u === void 0 ? void 0 : _u.text, (_v !== null && _v !== void 0 ? _v : 'Add Folder')), 'Add Folder', [], true)
            }
        };
        this.allowKeyboardEventsOnFocus = this.define(options.allowKeyboardEventsOnFocus, true);
    }
    format(val) {
        if (typeof val === 'boolean' && val.constructor == Boolean)
            return val;
        return val.toString().trim().toLowerCase();
    }
    define(val, defaultOption, allowedOptions = [], isStrict = false) {
        if (val === undefined || val === null)
            return defaultOption;
        if (allowedOptions.length > 0) {
            if (!allowedOptions.includes(this.format(val))) {
                if (this.isDebug)
                    console.warn(`[FTIDEOptions] invalid property value '${val}'; expecting one of these values: ${allowedOptions.join()}`);
                return defaultOption;
            }
        }
        return isStrict === true ? val : this.format(val);
    }
}
class ElementBuilder {
    constructor(tagName) {
        if (tagName)
            this.node = document.createElement(tagName.toUpperCase());
    }
    innerHTML(html) {
        this.node.innerHTML = html;
        return this;
    }
    innerText(text) {
        this.node.innerText = text;
        return this;
    }
    styles(styles) {
        this.node.style.cssText += `;${styles}`;
        return this;
    }
    id(value) {
        this.node.id = value;
        return this;
    }
    addClass(...args) {
        args.forEach(arg => {
            if (!this.node.classList.contains(arg))
                this.node.classList.add(arg);
        });
        return this;
    }
    attr(attr, val) {
        this.node.setAttribute(attr, val);
        return this;
    }
    prepend(child) {
        this.node.prepend(child instanceof ElementBuilder ? child.build() : child);
        return this;
    }
    append(...child) {
        child.forEach(element => {
            this.node.appendChild((element instanceof ElementBuilder) ? element.build() : element);
        });
        return this;
    }
    build() {
        return this.node;
    }
    static from(element, includeChildren = true) {
        const builder = new ElementBuilder('');
        builder.node = (element instanceof ElementBuilder)
            ? element.node.cloneNode(includeChildren)
            : element.cloneNode(includeChildren);
        return builder;
    }
    static newSubtree() {
        return new ElementBuilder("li").addClass('subtree')
            .append(new ElementBuilder('ul')
            .append(new ElementBuilder('li').addClass('folders')
            .append(new ElementBuilder('ul')))
            .append(new ElementBuilder('li').addClass('files')
            .append(new ElementBuilder('ul'))));
    }
}
class FTTreeBuilder {
    constructor(options) {
        this.cDepth = 0;
        this.options = options;
    }
    generate(tree) {
        if (typeof tree !== 'object' && tree.constructor !== Object)
            throw new Error('1st Argument expecting an object of kvps');
        const div = new ElementBuilder('div')
            .addClass('explorer', this.options.explorerStyle);
        const ul = new ElementBuilder("ul")
            .addClass('tree')
            .append(new ElementBuilder('li')
            .addClass('folder', 'root', 'open')
            .innerText('/').attr('tabindex', 0)
            .attr(Utils.ATTR_NAME, "/")
            .attr('role', 'tree')
            .attr('aria-expanded', true))
            .append(new ElementBuilder('li').addClass('subtree').append(new ElementBuilder('ul').append(...this.createTree(tree))));
        return div.append(ul).build();
    }
    createTree(tree, path = "") {
        const files = new ElementBuilder("ul");
        const folders = new ElementBuilder("ul");
        tree.forEach(node => {
            if (typeof node === 'string' && node.constructor === String)
                files.append(this.createFile(node, `${path}/${node}`));
            else if (typeof node === 'object' && node.constructor === Object) {
                for (const key in node) {
                    if (node.hasOwnProperty(key)) {
                        path += `/${key}`;
                        folders.append(this.createFolder(key, path));
                        this.cDepth++;
                        const subtree = new ElementBuilder("ul").append(...this.createTree(node[key], path));
                        if (subtree.build().firstChild.firstChild.hasChildNodes() || subtree.build().lastChild.firstChild.hasChildNodes()) {
                            folders.append(new ElementBuilder("li").addClass("subtree").append(subtree));
                        }
                        path = path.substring(0, path.indexOf(key) - 1);
                    }
                }
            }
            else
                throw new Error(`[ft-file-explorer] Invalid type for file system. Expecting object or string values, got: <${typeof node}> ${node}`);
        });
        this.cDepth--;
        return [
            new ElementBuilder('li').addClass('folders').append(folders),
            new ElementBuilder('li').addClass('files').append(files)
        ];
    }
    createFolder(content, path) {
        this.throwIfHasSlashes(content);
        const li = new ElementBuilder("LI")
            .addClass('folder')
            .styles(`padding-left: ${this.cDepth * 15}px`)
            .attr(Utils.ATTR_NAME, path)
            .attr("tabindex", -1)
            .attr('aria-label', 'folder')
            .attr('role', 'group')
            .attr('aria-selected', false)
            .attr('aria-expanded', false)
            .append(document.createTextNode(content));
        if (this.options.expandFolders) {
            li.addClass('open');
            li.attr('aria-expanded', true);
        }
        return li;
    }
    createFile(content, path) {
        this.throwIfHasSlashes(content);
        const li = new ElementBuilder('LI')
            .addClass('file')
            .styles(`padding-left: ${this.cDepth * 15}px;`)
            .attr(Utils.ATTR_NAME, path)
            .attr("tabindex", -1)
            .attr('aria-label', 'file')
            .attr('role', 'treeitem')
            .attr('aria-selected', false)
            .append(document.createTextNode(content));
        return li;
    }
    throwIfHasSlashes(content) {
        if (~content.indexOf('/') || ~content.indexOf('\\'))
            throw new Error(`[ft-file-explorer] Invalid content name. A file or folder can not contain slashes`);
    }
}
class FTFileExplorer {
    constructor() {
        this.events = {
            'selected': null,
            'created': null,
            'creating': null,
            'deleted': null,
            'deleting': null,
            'error': null
        };
    }
    createTree(elementId, tree, options) {
        const explorer = document.getElementById(elementId);
        if (explorer === null)
            throw new Error(`1st argument expecting a valid element id, '${elementId}' does not exist`);
        if (!explorer.classList.contains('ft-file-explorer'))
            explorer.classList.add('ft-file-explorer');
        options = new FTFileExplorerOptions(options);
        if (options.isDebug) {
            console.log(`FTFileExplorerOptions for #${elementId}:`);
            console.table(options);
        }
        tree = this.sort(tree);
        const _tree = new FTTreeBuilder(options)
            .generate(tree);
        this.writeToDOM(explorer, options, _tree);
        this.registerEvents(explorer, options, _tree);
    }
    toJSON(elementId) {
        const explorer = document.getElementById(elementId);
        if (explorer === null)
            throw new Error(`1st argument expecting a valid element id, '${elementId}' does not exist`);
        return Utils.convertToJSON(elementId);
    }
    emit(event) {
        if (!Object.keys(this.events).includes(event.type) || !this.events[event.type])
            return;
        return this.events[event.type].apply(null, [event.data]);
    }
    on(event, callback) {
        if (!Object.keys(this.events).includes(event) || typeof callback !== 'function')
            return;
        this.events[event] = callback;
    }
    sort(tree) {
        const folders = {};
        const files = [];
        let nested = 0;
        for (let i = 0; i < tree.length; i++) {
            const element = tree[i];
            if (typeof element === 'object' && element.constructor === Object) {
                if (++nested > 1)
                    throw new Error(`[ft-file-explorer] tree structures should contain only 1 child object : [{ ...folders }, ...files]`);
                const keys = Object.keys(element).sort();
                keys.forEach(key => folders[key] = this.sort(element[key]));
            }
            else if (typeof element === 'string')
                files.push(element);
            else
                throw new Error(`[ft-file-explorer] Invalid type for file system. Expecting object or string values, got: <${typeof element}> ${element}`);
        }
        return [folders, ...files.sort()];
    }
    writeToDOM(explorer, options, tree) {
        explorer.innerHTML = `<!--
    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    $$$    FT-FileExplorer CREATED BY github.com/soulshined    $$$
    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    -->`;
        const actions = new ElementBuilder("div")
            .addClass("ft-file-explorer-actions")
            .styles("display:flex; flex-flow: row nowrap; align-items: center; justify-content: flex-end");
        const deleteBtn = new ElementBuilder("button")
            .addClass("delete")
            .attr('title', 'Delete Item')
            .innerText(options.buttons.delete.text.trim());
        const addFileBtn = new ElementBuilder("button")
            .addClass("addfile")
            .attr('title', 'Add File')
            .innerText(options.buttons.addFile.text.trim()).attr("value", "file");
        const addFolderBtn = new ElementBuilder("button")
            .addClass("addfolder")
            .attr('title', 'Add Folder')
            .innerText(options.buttons.addFolder.text.trim()).attr("value", "folder");
        if (!options.buttons.delete.visible)
            deleteBtn.styles('visibility: collapse');
        if (!options.buttons.addFile.visible)
            addFileBtn.styles('visibility: collapse');
        if (!options.buttons.addFolder.visible)
            addFolderBtn.styles('visibility: collapse');
        actions.append(deleteBtn, addFileBtn, addFolderBtn);
        explorer.appendChild(actions.build());
        explorer.appendChild(tree);
        if (options.rootPath !== null && options.rootPath !== "/" && typeof options.rootPath === 'string') {
            this.navigateToPath(explorer.id, options.rootPath);
        }
        else {
            let f = tree.querySelector('.tree:first-of-type > .subtree .folder');
            if (!f) {
                f = tree.querySelector('.tree:first-of-type > .subtree .file');
                if (!f) {
                    Utils.toggleActiveExplorerItem(explorer.id, Utils.getRootFileExplorerItem(explorer.id));
                    return;
                }
            }
            Utils.toggleActiveExplorerItem(explorer.id, f);
        }
    }
    registerEvents(explorer, options, tree) {
        const fe = document.querySelector(`#${explorer.id} div.explorer`);
        const addBtns = document.querySelectorAll(`#${explorer.id} .ft-file-explorer-actions .addfile, #${explorer.id} .ft-file-explorer-actions .addfolder`);
        const deleteBtn = document.querySelector(`#${explorer.id} .ft-file-explorer-actions .delete`);
        addBtns.forEach(btn => {
            btn.addEventListener('click', e => {
                const target = e.target;
                let active = document.querySelector(`#${explorer.id} .active`);
                if (fe.contains(document.activeElement) && Utils.isFileOrFolder(document.activeElement))
                    active = document.activeElement;
                if (!active) {
                    this.emit(new FTFileExplorerErrorEvent(explorer.id, null, 'onCreating', "No tree node is selected"));
                    return;
                }
                const val = target.value;
                if (!['file', 'folder'].includes(val.toLowerCase())) {
                    this.emit(new FTFileExplorerErrorEvent(explorer.id, null, "InvalidInputError", "Can not properly identify button type"));
                    return;
                }
                let targetPath = active.getAttribute(Utils.ATTR_NAME);
                let event = new FTFileExplorerEvent(EventTypes.CREATING, explorer.id, targetPath);
                event.data.nodeType = val.toLowerCase();
                if (Utils.isFile(active))
                    targetPath = targetPath.substring(0, targetPath.lastIndexOf("/"));
                let result = this.emit(event);
                if (this.events[EventTypes.CREATING] === null)
                    result = prompt(`Add ${val.toLowerCase()}\n\n${targetPath}`);
                if ((result === null || result === undefined) || result.trim().length === 0) {
                    this.emit(new FTFileExplorerErrorEvent(explorer.id, null, 'onCreating', 'Invalid user input. Can not contain path separators and can not be empty'));
                    return;
                }
                result = result.trim();
                if (/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(result)) {
                    this.emit(new FTFileExplorerErrorEvent(explorer.id, result, "InvalidInputError", "Input can not contain path separators or special characters"));
                    return;
                }
                const padding = parseInt(active.style.paddingLeft, 10) || 0;
                event = new FTFileExplorerEvent(EventTypes.CREATED, explorer.id, targetPath + "/" + result);
                if (event.data.path.startsWith("//"))
                    event.data.path = event.data.path.substring(1);
                event.data.nodeType = val.toLowerCase();
                event.data['isDuplicate'] = false;
                if (document.querySelector(`[${Utils.ATTR_NAME}="${targetPath + "/" + result}"]`) !== null) {
                    const err = new FTFileExplorerErrorEvent(explorer.id, event.data.path, 'onCreating', `The directory already contains a file or folder with the name '${result}'`);
                    err.data['isDuplicate'] = true;
                    this.emit(err);
                    return;
                }
                const elem = new ElementBuilder('li')
                    .addClass(val)
                    .attr(Utils.ATTR_NAME, event.data.path)
                    .attr('tabindex', 0)
                    .innerText(result);
                const insertBeforeResult = Utils.getInsertBeforeNode(event.data.path, active, val.toLowerCase(), explorer.id);
                if (Utils.isFile(active) && event.data.nodeType === 'file') {
                    elem.attr('role', 'treeitem');
                    insertBeforeResult.parent.insertBefore(elem.styles(`padding-left: ${padding}px`).build(), insertBeforeResult.target);
                }
                else if (Utils.isFile(active) && event.data.nodeType === 'folder') {
                    elem.attr('aria-expanded', true);
                    elem.attr('role', 'group');
                    insertBeforeResult.parent.insertBefore(elem.styles(`padding-left: ${padding}px`).build(), insertBeforeResult.target);
                }
                else if (Utils.isFolder(active)) {
                    elem.styles(`padding-left: ${padding + 15}px`);
                    if (event.data.nodeType === 'folder') {
                        elem.attr('aria-expanded', true);
                        elem.attr('role', 'group');
                    }
                    else {
                        elem.attr('role', 'treeitem');
                    }
                    insertBeforeResult.parent.insertBefore(elem.build(), insertBeforeResult.target);
                }
                Utils.toggleActiveExplorerItem(explorer.id, elem.build());
                if (Utils.isFolder(elem.build()))
                    Utils.openFolder(elem.build());
                if (!document.activeElement.isSameNode(fe) && fe.contains(document.activeElement))
                    elem.build().focus();
                this.updateActionButtons(explorer.id);
                event.data['tree'] = Utils.convertToJSON(explorer.id);
                this.emit(event);
            });
        });
        deleteBtn.onclick = e => {
            let active = document.querySelector(`#${explorer.id} .active`);
            if (fe.contains(document.activeElement) && Utils.isFileOrFolder(document.activeElement))
                active = document.activeElement;
            if (!active)
                return;
            let shouldDelete = this.emit(new FTFileExplorerEvent(EventTypes.DELETING, explorer.id, active.getAttribute(Utils.ATTR_NAME)));
            if (this.events['deleting'] === null)
                shouldDelete = confirm(`Are you sure you want to delete ${active.getAttribute(Utils.ATTR_NAME).substring(1)}?`);
            if (!shouldDelete || typeof shouldDelete !== 'boolean')
                return;
            const event = new FTFileExplorerDeletedEvent(explorer.id, active.getAttribute(Utils.ATTR_NAME));
            let sibling = null;
            const parentDir = Utils.getFileExplorerItemByPath(explorer.id, Utils.getFileExplorerItemParentDirPath(active));
            if (Utils.isFolder(active)) {
                const siblingFolders = Utils.getSiblingFolders(active);
                if (siblingFolders.count > 0) {
                    if (siblingFolders.next.length > 0)
                        sibling = siblingFolders.next[0];
                    else {
                        if (siblingFolders.previous.length > 0)
                            sibling = siblingFolders.previous[0];
                    }
                    if (active.nextSibling && active.nextSibling.classList.contains('subtree'))
                        active.closest('ul').removeChild(active.nextSibling);
                    active.closest('ul').removeChild(active);
                    if (sibling) {
                        sibling.focus();
                        Utils.toggleActiveExplorerItem(explorer.id, sibling);
                    }
                    else {
                        const files = Utils.getItemsForDirectory('files', parentDir);
                        if (files.length > 0) {
                            files[0].focus();
                            Utils.toggleActiveExplorerItem(explorer.id, files[0]);
                        }
                        else {
                            parentDir.focus();
                            Utils.toggleActiveExplorerItem(explorer.id, parentDir);
                        }
                    }
                }
                else {
                    const files = Utils.getItemsForDirectory('files', parentDir);
                    if (files.length > 0) {
                        if (active.nextSibling && active.nextSibling.classList.contains('subtree'))
                            active.closest('ul').removeChild(active.nextSibling);
                        active.closest('ul').removeChild(active);
                        files[0].focus();
                        Utils.toggleActiveExplorerItem(explorer.id, files[0]);
                    }
                    else {
                        if (active.nextSibling && active.nextSibling.classList.contains('subtree'))
                            active.closest('ul').removeChild(active.nextSibling);
                        active.closest('ul').removeChild(active);
                        parentDir.focus();
                        Utils.toggleActiveExplorerItem(explorer.id, parentDir);
                    }
                }
            }
            else if (Utils.isFile(active)) {
                if (active.nextSibling)
                    sibling = active.nextSibling;
                else if (active.previousSibling)
                    sibling = active.previousSibling;
                else {
                    const siblingFolders = Utils.getItemsForDirectory('folders', parentDir);
                    if (siblingFolders.length > 0)
                        sibling = siblingFolders.pop();
                }
                active.closest('ul').removeChild(active);
                if (sibling) {
                    Utils.toggleActiveExplorerItem(explorer.id, sibling);
                    sibling.focus();
                }
                else {
                    Utils.toggleActiveExplorerItem(explorer.id, parentDir);
                    parentDir.focus();
                }
            }
            event.data.tree = Utils.convertToJSON(explorer.id);
            this.updateActionButtons(explorer.id);
            this.emit(event);
        };
        fe.onclick = (e) => {
            const target = e.target;
            if (Utils.isFile(target) || Utils.isFolder(target)) {
                const event = new FTFileExplorerSelectedEvent(explorer.id, target.getAttribute(Utils.ATTR_NAME));
                let padding = +target.style.paddingLeft.substring(0, target.style.paddingLeft.length - 2);
                fe.scrollTo(padding - 10, fe.scrollTop);
                if (Utils.isFolder(target)) {
                    if (!Utils.isRoot(target)) {
                        target.classList.toggle('open');
                        target.setAttribute('aria-expanded', `${Utils.isFolderOpen(target)}`);
                        event.data.state = Utils.isFolderOpen(target) ? 'expanded' : 'collapsed';
                    }
                }
                else if (Utils.isFile(target))
                    event.data.nodeType = 'file';
                Utils.toggleActiveExplorerItem(explorer.id, target);
                target.focus();
                this.emit(event);
            }
        };
        fe.onkeyup = (e) => {
            if (!options.allowKeyboardEventsOnFocus)
                return;
            const target = e.target;
            if (!fe.contains(target) && !document.activeElement.isSameNode(fe) && !Utils.isFile(target) && !Utils.isFolder(target))
                return;
            if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
                let newTarget = null;
                if (e.key === 'ArrowDown')
                    newTarget = Utils.getNextVisibleLogicalOrderFileExplorerItem(explorer.id, target);
                else
                    newTarget = Utils.getPreviousVisibleLogicalOrderFileExlporerItem(explorer.id, target);
                if (newTarget)
                    newTarget.focus();
            }
            else if (e.key === 'ArrowRight') {
                if (Utils.isFolder(target)) {
                    target.setAttribute('aria-expanded', `${Utils.isFolderOpen(target)}`);
                    if (!Utils.isFolderOpen(target)) {
                        Utils.openFolder(target);
                        return;
                    }
                    const subfolders = Utils.getItemsForDirectory('folders', target);
                    if (subfolders.length > 0) {
                        subfolders[0].focus();
                        return;
                    }
                    const files = Utils.getItemsForDirectory('files', target);
                    if (files.length > 0)
                        files[0].focus();
                }
            }
            else if (e.key === 'ArrowLeft' && !Utils.isRoot(target)) {
                if (Utils.isFileOrFolder(target)) {
                    if (Utils.isFolder(target) && Utils.isFolderOpen(target)) {
                        target.classList.remove('open');
                        return;
                    }
                    const parent = Utils.getFileExplorerItemByPath(explorer.id, Utils.getFileExplorerItemParentDirPath(target));
                    if (parent)
                        parent.focus();
                }
            }
            else if (e.key === ' ' && !Utils.isRoot(target) ||
                e.key === 'Enter' && !Utils.isRoot(target)) {
                if (!Utils.isFileOrFolder(target))
                    return;
                const event = new FTFileExplorerSelectedEvent(explorer.id, target.getAttribute(Utils.ATTR_NAME));
                if (Utils.isFolder(target)) {
                    event.data.nodeType = 'folder';
                    Utils.toggleFolder(target);
                    if (!Utils.isRoot(target)) {
                        event.data.state = Utils.isFolderOpen(target) ? 'expanded' : 'collapsed';
                    }
                }
                Utils.toggleActiveExplorerItem(explorer.id, target);
                target.focus();
                this.emit(event);
            }
            else if (e.key === 'Delete') {
                document.querySelector(`#${explorer.id} button.delete`).click();
                this.updateActionButtons(explorer.id);
            }
            else if (e.key === 'n' && !e.shiftKey && !e.ctrlKey) {
                document.querySelector(`#${explorer.id} button.addfile`).click();
                deleteBtn.disabled = false;
            }
            else if (e.key === 'N' && e.shiftKey && !e.ctrlKey) {
                document.querySelector(`#${explorer.id} button.addfolder`).click();
                deleteBtn.disabled = false;
            }
        };
    }
    updateActionButtons(explorerId) {
        const deleteBtn = document.querySelector(`#${explorerId} .ft-file-explorer-actions button.delete`);
        deleteBtn.disabled = Utils.getAllItemsForDirectory(Utils.getRootFileExplorerItem(explorerId)).count === 0;
    }
    navigateToPath(explorerId, path) {
        if (typeof path === 'string' && path !== "" && path !== "/") {
            let rootPath = path;
            if (!rootPath.startsWith("/"))
                rootPath = "/" + rootPath;
            const root = document.querySelector(`#${explorerId} [${Utils.ATTR_NAME}="${rootPath}"]`);
            if (root) {
                const paths = rootPath.split("/").filter(f => f.trim() !== "").map(m => `/${m}`);
                let currentDir = "";
                paths.forEach(path => {
                    currentDir += path;
                    Utils.openFolder(document.querySelector(`#${explorerId} [${Utils.ATTR_NAME}="${currentDir}"]`));
                });
                Utils.toggleActiveExplorerItem(explorerId, root);
                root.focus();
            }
            else {
                this.emit(new FTFileExplorerErrorEvent(explorerId, path, 'openPath', "Explorer item doesn't exist"));
            }
        }
        else
            throw new Error('[ft-file-explorer] path must be a string datatype referencing a valid tree node path');
    }
}
(function writeStylesToDOM() {
    const style = document.createElement('STYLE');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(`/*
$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
$$$    FT-FILE-EXPLORER CREATED BY github.com/soulshined    $$$
$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/
:root{--ft-fe-active:#e4e6f1;--ft-fe-hover:#e8e8e8}.ft-file-explorer,.ft-file-explorer ul{margin:0;padding:0}.ft-file-explorer *{box-sizing:border-box}.ft-file-explorer .explorer>ul.tree{display:flex;flex-flow:column nowrap;flex:1}.ft-file-explorer .explorer>ul.tree li{list-style:none;cursor:pointer;word-break:keep-all;white-space:nowrap;padding:0;margin:0}.ft-file-explorer .explorer>ul.tree>li:not(.root){padding-left:10px}.ft-file-explorer .explorer.compact>ul.tree li.files{text-indent:7px}.ft-file-explorer li.file.active,.ft-file-explorer li.folder.active{background-color:var(--ft-fe-active)}.ft-file-explorer li.file:focus:not(.active),.ft-file-explorer li.file:hover,.ft-file-explorer li.folder:focus:not(.active),.ft-file-explorer li.folder:hover{background-color:var(--ft-fe-hover)}.ft-file-explorer .explorer>ul.tree li.file,.ft-file-explorer .explorer>ul.tree li.folder{display:flex;align-items:center;user-select:none;padding-top:2px!important;padding-bottom:2px!important}.ft-file-explorer .explorer li.folder::before{display:flex;padding-right:calc(1em / 3);align-self:flex-start;content:url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" fill="%23C8C8C8"><path d="M22,6H12l-2-2H2v16h20V6z"></path></svg>');width:1em;height:1em}.ft-file-explorer .explorer li.folder.open::before{content:url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" fill="%23C8C8C8"><path d="M22,6H12l-2-2H2v16h20V6z M20,18H4V8h16V18z"></path></svg>');width:1em;height:1em}.ft-file-explorer .explorer.compact li.folder::before{padding-right:0;content:url("data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14' width='18px' height='18px'><path fill='%23C8C8C8' d='M6 4v8l4-4-4-4zm1 2.414L8.586 8 7 9.586V6.414z'/></svg>")}.ft-file-explorer .explorer.compact li.folder.open::before{content:url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="18px" height="18px"><path fill="%23C8C8C8" d="M11 10H5.344L11 4.414V10z"/></svg>')}.ft-file-explorer li.folder:not(.open)+li.subtree{display:none}`));
    document.head.prepend(style);
}());
if (!HTMLElement.prototype.scrollTo) {
    HTMLElement.prototype.scrollTo = function (left, top) {
        this.scrollTop = top;
        this.scrollLeft = left;
    };
}
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        FTFileExplorer,
        FTFileExplorerOptions
    };
}
if (typeof window !== "undefined") {
    window.FTFileExplorer = FTFileExplorer;
    window.FTFileExplorerOptions = FTFileExplorerOptions;
}
var EventTypes;
(function (EventTypes) {
    EventTypes["SELECTED"] = "selected";
    EventTypes["DELETED"] = "deleted";
    EventTypes["DELETING"] = "deleting";
    EventTypes["CREATED"] = "created";
    EventTypes["CREATING"] = "creating";
    EventTypes["ERROR"] = "error";
})(EventTypes || (EventTypes = {}));
class EventData {
    constructor(explorerId, path) {
        this.nodeType = 'file';
        this.explorerId = explorerId;
        this.path = path;
        if (Utils.isFolder(Utils.getFileExplorerItemByPath(explorerId, path)))
            this.nodeType = 'folder';
        this.path = path || null;
    }
}
class FTFileExplorerEvent {
    constructor(type, explorerId, path) {
        this.type = type;
        this.data = new EventData(explorerId, path);
    }
}
class FTFileExplorerErrorEvent extends FTFileExplorerEvent {
    constructor(explorerId, path, action, errorMsg) {
        super(EventTypes.ERROR, explorerId, path);
        this.data.error = {
            action,
            msg: errorMsg
        };
    }
}
class FTFileExplorerSelectedEvent extends FTFileExplorerEvent {
    constructor(explorerId, path) {
        super(EventTypes.SELECTED, explorerId, path);
    }
}
class FTFileExplorerDeletedEvent extends FTFileExplorerEvent {
    constructor(explorerId, path) {
        super(EventTypes.DELETED, explorerId, path);
    }
}
class Utils {
    static openFolder(target) {
        if (!this.isFolderOpen(target)) {
            target.classList.add('open');
            target.setAttribute('aria-selected', "true");
            target.setAttribute('aria-expanded', "true");
        }
    }
    static closeFolder(target) {
        if (this.isFolderOpen(target)) {
            target.classList.remove('open');
            target.setAttribute('aria-selected', "false");
            target.setAttribute('aria-expanded', "false");
        }
    }
    static toggleFolder(target) {
        if (this.isFolderOpen(target)) {
            this.closeFolder(target);
        }
        else
            this.openFolder(target);
    }
    static isFile(element) {
        return element && element.tagName === 'LI' && element.classList.contains('file');
    }
    static isFolder(element) {
        return element && element.tagName === 'LI' && element.classList.contains("folder");
    }
    static isFileOrFolder(element) {
        return this.isFile(element) || this.isFolder(element);
    }
    static isFolderOpen(element) {
        return element && element.classList.contains('open');
    }
    static isRoot(element) {
        return this.isFolder(element) && element.getAttribute(this.ATTR_NAME) === '/';
    }
    static toggleActiveExplorerItem(explorerId, target) {
        [...document.querySelectorAll(`#${explorerId} div.explorer li.file, #${explorerId} div.explorer li.folder`)].map(m => {
            m.classList.remove('active');
            m.setAttribute("aria-selected", "false");
        });
        target.classList.add('active');
        target.setAttribute('aria-selected', "true");
    }
    static getRootFileExplorerItem(explorerId) {
        return document.querySelector(`#${explorerId} div.explorer [${this.ATTR_NAME}="/"]`);
    }
    static getFileExplorerItemByPath(explorerId, path) {
        return document.querySelector(`#${explorerId} div.explorer [${this.ATTR_NAME}="${path}"]`);
    }
    static getFileExplorerItemParentDirPath(target) {
        let path = target.getAttribute(this.ATTR_NAME);
        path = path.substring(0, path.lastIndexOf("/"));
        return path === "" ? "/" : path;
    }
    static getItemsForDirectory(itemType, target) {
        if (!this.isFolder(target))
            return [];
        if (target.nextSibling && target.nextSibling.classList.contains('subtree')) {
            const subtree = itemType === 'files'
                ? target.nextSibling.firstChild.lastChild.firstChild
                : target.nextSibling.firstChild.firstChild.firstChild;
            if (subtree.parentElement.classList.contains(itemType) && subtree.parentElement.tagName === 'LI')
                return [...subtree.childNodes].filter(f => !f.classList.contains('subtree'));
        }
        return [];
    }
    static getAllItemsForDirectory(target, excludeSubtree = true) {
        if (!this.isFolder(target))
            return { folders: [], files: [], count: 0 };
        if (target.nextSibling && target.nextSibling.classList.contains('subtree')) {
            const subtree = target.nextSibling.firstChild;
            let folders = [...subtree.firstChild.firstChild.childNodes];
            if (excludeSubtree)
                folders = folders.filter(f => !f.classList.contains('subtree'));
            const files = [...subtree.lastChild.firstChild.childNodes];
            return {
                folders,
                files,
                count: folders.length + files.length
            };
        }
        return {
            folders: [],
            files: [],
            count: 0
        };
    }
    static getSiblingFolders(target) {
        const subtree = target.closest('.subtree > ul:first-child > li.folders:first-child > ul:first-child');
        const children = [...subtree.children].filter(c => c.classList.contains("folder"));
        const index = children.indexOf(target);
        if (index < 0)
            return { previous: [], next: [], count: 0 };
        const previous = children.slice(0, index).reverse();
        const next = children.slice(index + 1);
        return {
            previous,
            next,
            count: previous.length + next.length
        };
    }
    static getPreviousVisibleLogicalOrderFileExlporerItem(explorerId, target) {
        if (this.isRoot(target))
            return;
        if (this.isFile(target)) {
            if (target.previousSibling)
                return target.previousSibling;
            const dir = this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(target));
            const siblingFolders = this.getItemsForDirectory('folders', dir);
            if (siblingFolders.length > 0) {
                const last = siblingFolders[siblingFolders.length - 1];
                if (!last.classList.contains('open'))
                    return last;
                const files = this.getItemsForDirectory('files', last);
                if (files.length > 0)
                    return files.pop();
                const subfolders = this.getItemsForDirectory('folders', last);
                if (subfolders.length > 0) {
                    if (!subfolders[subfolders.length - 1].classList.contains('open'))
                        return subfolders[subfolders.length - 1];
                    const files = this.getItemsForDirectory('files', subfolders[subfolders.length - 1]);
                    if (files.length > 0)
                        return files[files.length - 1];
                    else
                        return subfolders[subfolders.length - 1];
                }
                else {
                    return last;
                }
            }
            else {
                const parentDir = this.getFileExplorerItemParentDirPath(target);
                return this.getFileExplorerItemByPath(explorerId, parentDir);
            }
        }
        else if (this.isFolder(target)) {
            const siblingFolders = this.getSiblingFolders(target);
            if (siblingFolders.previous.length > 0) {
                if (!siblingFolders.previous[0].classList.contains('open'))
                    return siblingFolders.previous[0];
                const subtree = siblingFolders.previous[0].nextSibling;
                if (subtree) {
                    const files = this.getItemsForDirectory('files', subtree.previousSibling);
                    if (files.length > 0) {
                        let file = null;
                        fileLoop: for (let i = 0; i < files.length; i++) {
                            const element = files[i];
                            if (this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(element)).classList.contains('open')) {
                                file = element;
                                break fileLoop;
                            }
                        }
                        if (file)
                            return file;
                    }
                }
                const siblingSubfolders = this.getItemsForDirectory('folders', siblingFolders.previous[0]);
                if (siblingSubfolders.length === 0)
                    return siblingFolders.previous[0];
                const closedFoldersAboveTarget = siblingSubfolders[0].parentElement.querySelectorAll('li.folder:not(.open)');
                const bottomMostOpenFoldersAboveTarget = siblingSubfolders[0].parentElement.querySelectorAll('li.folder.open');
                let folder = null;
                if (closedFoldersAboveTarget.length === 0 && bottomMostOpenFoldersAboveTarget.length > 0) {
                    folder = this.getFileExplorerItemByPath(explorerId, bottomMostOpenFoldersAboveTarget[bottomMostOpenFoldersAboveTarget.length - 1].getAttribute(this.ATTR_NAME));
                }
                else {
                    folder = this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(closedFoldersAboveTarget[0]));
                }
                const files = this.getItemsForDirectory('files', folder);
                if (files.length > 0)
                    return files[files.length - 1];
                const bottomMostFolderSubFolders = this.getItemsForDirectory('folders', folder);
                if (bottomMostFolderSubFolders.length === 0)
                    return folder;
                return bottomMostFolderSubFolders.pop();
            }
            else {
                const parentDir = this.getFileExplorerItemParentDirPath(target);
                return this.getFileExplorerItemByPath(explorerId, parentDir);
            }
        }
    }
    static getNextVisibleLogicalOrderFileExplorerItem(explorerId, target) {
        if (this.isFile(target)) {
            if (target.nextSibling)
                return target.nextSibling;
            let closestSubtree = target.closest('.subtree');
            let dirParent = this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(closestSubtree.previousSibling));
            if (closestSubtree.nextSibling) {
                return closestSubtree.nextSibling;
            }
            else if (!target.nextSibling && Utils.isRoot(this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(target)))) {
                return;
            }
            else {
                do {
                    const files = this.getItemsForDirectory('files', dirParent);
                    if (files.length > 0)
                        return files[0];
                    dirParent = this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(dirParent));
                } while (dirParent !== null && this.getFileExplorerItemParentDirPath(dirParent) !== '/');
            }
        }
        else if (this.isFolder(target)) {
            if (this.isFolderOpen(target)) {
                const subfolders = this.getItemsForDirectory('folders', target);
                if (subfolders.length > 0)
                    return subfolders[0];
                let files = this.getItemsForDirectory('files', target);
                if (files.length > 0)
                    return files[0];
                if (this.isRoot(target))
                    return;
                const siblingFolders = this.getSiblingFolders(target);
                if (siblingFolders.next.length > 0)
                    return siblingFolders.next[0];
                files = this.getItemsForDirectory('files', this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(target)));
                if (files.length > 0)
                    return files[0];
                const parent = this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(target));
                let dirParent = parent;
                let dirTarget = target;
                do {
                    const siblingFolders = this.getSiblingFolders(dirParent);
                    if (siblingFolders.next.length > 0)
                        return siblingFolders.next[0];
                    let files = this.getItemsForDirectory('files', dirParent);
                    if (files.length > 0)
                        return files[0];
                    files = this.getItemsForDirectory('files', this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(dirParent)));
                    if (files.length > 0)
                        return files[0];
                    const cachedParent = dirParent;
                    dirParent = this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(dirTarget));
                    dirTarget = cachedParent;
                } while (dirParent !== null && !this.isRoot(dirParent));
            }
            else {
                const parent = this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(target));
                let dirParent = parent;
                let dirTarget = target;
                do {
                    const siblingFolders = this.getSiblingFolders(dirTarget);
                    if (siblingFolders.next.length > 0)
                        return siblingFolders.next[0];
                    let files = this.getItemsForDirectory('files', dirParent);
                    if (files.length > 0)
                        return files[0];
                    const cachedParent = dirParent;
                    dirParent = this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(dirTarget));
                    dirTarget = cachedParent;
                } while (dirParent !== null && !this.isRoot(dirParent));
            }
        }
    }
    static getInsertBeforeNode(targetPath, activeNode, addType, explorerId) {
        let result = {
            parent: null,
            target: null
        };
        if (Utils.isFolder(activeNode)) {
            if (!activeNode.nextSibling || !activeNode.nextSibling.classList.contains('subtree')) {
                activeNode.parentElement.insertBefore(ElementBuilder.newSubtree().build(), activeNode.nextSibling);
            }
            let target = activeNode.nextSibling.firstChild;
            target = addType === 'file' ? target.lastChild.firstChild : target.firstChild.firstChild;
            if (addType === 'file') {
                result.parent = target;
                const childNodes = [...result.parent.childNodes];
                const files = childNodes.map(m => m.getAttribute(Utils.ATTR_NAME));
                files.push(targetPath);
                files.sort();
                if (files.length > 1) {
                    const targetIndex = files.indexOf(targetPath);
                    result.target = childNodes.filter(f => f.getAttribute(Utils.ATTR_NAME) === files[targetIndex + 1])[0];
                }
            }
            else {
                result.parent = target;
                const childNodes = [...result.parent.childNodes];
                const subfolders = childNodes.filter(f => !f.classList.contains('subtree')).map(m => m.getAttribute(Utils.ATTR_NAME));
                if (subfolders.length > 0) {
                    subfolders.push(targetPath);
                    subfolders.sort();
                    const targetIndex = subfolders.indexOf(targetPath);
                    if (targetIndex !== subfolders.length - 1 && targetIndex !== -1)
                        result.target = childNodes.filter(f => f.getAttribute(Utils.ATTR_NAME) === subfolders[targetIndex + 1])[0];
                }
            }
            if (!Utils.isFolderOpen(activeNode) && !Utils.isRoot(activeNode))
                Utils.openFolder(activeNode);
        }
        else if (Utils.isFile(activeNode)) {
            result.parent = activeNode.parentElement;
            const items = Utils.getAllItemsForDirectory(Utils.getFileExplorerItemByPath(explorerId, Utils.getFileExplorerItemParentDirPath(activeNode)), false);
            if (addType === 'file') {
                const files = items.files.map(m => m.getAttribute(Utils.ATTR_NAME));
                files.push(targetPath);
                files.sort();
                const targetIndex = files.indexOf(targetPath);
                result.target = items.files.filter(f => f.getAttribute(Utils.ATTR_NAME) === files[targetIndex + 1])[0];
            }
            else {
                result.parent = document.querySelector(`#${explorerId} [${Utils.ATTR_NAME}="${Utils.getFileExplorerItemParentDirPath(activeNode)}"] + .subtree > ul:first-child > li.folders > ul:first-child `);
                let prev = null;
                const folders = items.folders.map(m => {
                    if (m.classList.contains('subtree'))
                        return prev;
                    else {
                        const path = m.getAttribute(Utils.ATTR_NAME);
                        prev = path;
                        return path;
                    }
                });
                folders.push(targetPath);
                folders.sort();
                const targetIndex = folders.indexOf(targetPath);
                result.target = items.folders.filter(f => f.getAttribute(Utils.ATTR_NAME) === folders[targetIndex + 1])[0];
            }
        }
        return result;
    }
    static convertToJSON(explorerId) {
        const root = Utils.getRootFileExplorerItem(explorerId);
        return this.getJSONSegements(explorerId, root);
    }
    static getJSONSegements(explorerId, dir) {
        const json = [];
        const items = Utils.getAllItemsForDirectory(dir);
        const folders = {};
        if (items.count > 0) {
            items.folders.forEach(f => {
                const path = f.getAttribute(this.ATTR_NAME);
                folders[path.substring(path.lastIndexOf("/") + 1)] = this.getJSONSegements(explorerId, Utils.getFileExplorerItemByPath(explorerId, path));
            });
            json.push(folders);
            json.push(...items.files.map(f => {
                const path = f.getAttribute(this.ATTR_NAME);
                return path.substring(path.lastIndexOf('/') + 1);
            }));
        }
        return json;
    }
}
Utils.ATTR_NAME = 'data-ft-file-explorer-path';
//# sourceMappingURL=ft-file-explorer.js.map