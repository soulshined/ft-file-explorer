class FTFileExplorer {
    private events = {
        'selected': null,
        'created': null,
        'creating': null,
        'deleted': null,
        'deleting': null,
        'error': null
    };

    public createTree(elementId: string, tree, options) {
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

    public toJSON(elementId: string) {
        const explorer = document.getElementById(elementId);

        if (explorer === null)
            throw new Error(`1st argument expecting a valid element id, '${elementId}' does not exist`);

        return Utils.convertToJSON(elementId);
    }

    private emit(event: FTFileExplorerEvent) {
        if (!Object.keys(this.events).includes(event.type) || !this.events[event.type]) return;

        return this.events[event.type].apply(null, [event.data]);
    }

    public on(event: string, callback: Function) {
        if (!Object.keys(this.events).includes(event) || typeof callback !== 'function') return;

        this.events[event] = callback;
    }

    private sort(tree) {
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
            else if (typeof element === 'string') files.push(element);
            else
                throw new Error(`[ft-file-explorer] Invalid type for file system. Expecting object or string values, got: <${typeof element}> ${element}`);
        }

        return [folders, ...files.sort()];
    }

    private writeToDOM(explorer: HTMLElement, options: FTFileExplorerOptions, tree) {
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

    private registerEvents(explorer: HTMLElement, options, tree) {
        const fe: HTMLElement = document.querySelector(`#${explorer.id} div.explorer`);
        const addBtns = document.querySelectorAll(`#${explorer.id} .ft-file-explorer-actions .addfile, #${explorer.id} .ft-file-explorer-actions .addfolder`);
        const deleteBtn = document.querySelector(`#${explorer.id} .ft-file-explorer-actions .delete`) as HTMLButtonElement;

        addBtns.forEach(btn => {
            btn.addEventListener('click', e => {
                const target = e.target as HTMLButtonElement;
                let active = document.querySelector(`#${explorer.id} .active`);

                if (fe.contains(document.activeElement) && Utils.isFileOrFolder(document.activeElement as HTMLElement))
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
                // @ts-ignore
                event.data.nodeType = val.toLowerCase();

                if (Utils.isFile(active as HTMLElement))
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

                /// @ts-ignore
                const padding = parseInt(active.style.paddingLeft, 10) || 0;

                event = new FTFileExplorerEvent(EventTypes.CREATED, explorer.id, targetPath + "/" + result);
                if (event.data.path.startsWith("//"))
                    event.data.path = event.data.path.substring(1);

                // @ts-ignore
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

                // @ts-ignore
                const insertBeforeResult = Utils.getInsertBeforeNode(event.data.path, active, val.toLowerCase(), explorer.id);

                if (Utils.isFile(active as HTMLElement) && event.data.nodeType === 'file') {
                    elem.attr('role', 'treeitem');
                    insertBeforeResult.parent.insertBefore(elem.styles(`padding-left: ${padding}px`).build(), insertBeforeResult.target);
                }
                else if (Utils.isFile(active as HTMLElement) && event.data.nodeType === 'folder') {
                    elem.attr('aria-expanded', true);
                    elem.attr('role', 'group');

                    insertBeforeResult.parent.insertBefore(elem.styles(`padding-left: ${padding}px`).build(), insertBeforeResult.target);
                }
                else if (Utils.isFolder(active as HTMLElement)) {
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
            })
        })

        deleteBtn.onclick = e => {
            let active: HTMLElement = document.querySelector(`#${explorer.id} .active`);

            if (fe.contains(document.activeElement) && Utils.isFileOrFolder(document.activeElement as HTMLElement))
                active = document.activeElement as HTMLElement;

            if (!active) return;

            let shouldDelete = this.emit(new FTFileExplorerEvent(EventTypes.DELETING, explorer.id, active.getAttribute(Utils.ATTR_NAME)));

            if (this.events['deleting'] === null)
                shouldDelete = confirm(`Are you sure you want to delete ${active.getAttribute(Utils.ATTR_NAME).substring(1)}?`)

            if (!shouldDelete || typeof shouldDelete !== 'boolean') return;

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

                    // @ts-ignore
                    if (active.nextSibling && active.nextSibling.classList.contains('subtree'))
                        active.closest('ul').removeChild(active.nextSibling);

                    active.closest('ul').removeChild(active);
                    if (sibling) {
                        sibling.focus();
                        Utils.toggleActiveExplorerItem(explorer.id, sibling);
                    }
                    else {
                        //check for files on same level
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
                    //check for files in same dir
                    const files = Utils.getItemsForDirectory('files', parentDir);
                    if (files.length > 0) {
                        // @ts-ignore
                        if (active.nextSibling && active.nextSibling.classList.contains('subtree'))
                            active.closest('ul').removeChild(active.nextSibling);

                        active.closest('ul').removeChild(active);
                        files[0].focus();
                        Utils.toggleActiveExplorerItem(explorer.id, files[0]);
                    }
                    else {
                        //no files go to parent
                        // @ts-ignore
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
                    sibling = active.previousSibling
                else {
                    //find something to focus on
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

            // @ts-ignore
            event.data.tree = Utils.convertToJSON(explorer.id);
            this.updateActionButtons(explorer.id);
            this.emit(event);
        }

        fe.onclick = (e) => {
            const target: HTMLElement = e.target as HTMLElement;

            if (Utils.isFile(target) || Utils.isFolder(target)) {
                const event = new FTFileExplorerSelectedEvent(explorer.id, target.getAttribute(Utils.ATTR_NAME));

                let padding = +target.style.paddingLeft.substring(0, target.style.paddingLeft.length - 2);
                fe.scrollTo(padding - 10, fe.scrollTop);

                if (Utils.isFolder(target)) {
                    if (!Utils.isRoot(target)) {
                        target.classList.toggle('open');
                        target.setAttribute('aria-expanded', `${Utils.isFolderOpen(target)}`);
                        // @ts-ignore
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

        fe.onkeyup = (e: KeyboardEvent) => {
            if (!options.allowKeyboardEventsOnFocus) return;
            const target: HTMLElement = e.target as HTMLElement;

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
                        Utils.openFolder(target)
                        return;
                    }

                    const subfolders = Utils.getItemsForDirectory('folders', target);

                    if (subfolders.length > 0) {
                        // @ts-ignore
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
                if (!Utils.isFileOrFolder(target)) return;
                const event = new FTFileExplorerSelectedEvent(explorer.id, target.getAttribute(Utils.ATTR_NAME));

                if (Utils.isFolder(target)) {
                    event.data.nodeType = 'folder';
                    Utils.toggleFolder(target);
                    if (!Utils.isRoot(target)) {
                        // @ts-ignore
                        event.data.state = Utils.isFolderOpen(target) ? 'expanded' : 'collapsed';
                    }
                }

                Utils.toggleActiveExplorerItem(explorer.id, target);
                target.focus();
                this.emit(event);
            }
            else if (e.key === 'Delete') {
                // @ts-ignore
                document.querySelector(`#${explorer.id} button.delete`).click();
                this.updateActionButtons(explorer.id);
            }
            else if (e.key === 'n' && !e.shiftKey && !e.ctrlKey) {
                //add file
                // @ts-ignore
                document.querySelector(`#${explorer.id} button.addfile`).click();
                deleteBtn.disabled = false;

            }
            else if (e.key === 'N' && e.shiftKey && !e.ctrlKey) {
                //add folder
                // @ts-ignore
                document.querySelector(`#${explorer.id} button.addfolder`).click();
                deleteBtn.disabled = false;
            }
        };
    }

    private updateActionButtons(explorerId: string) {
        const deleteBtn = document.querySelector(`#${explorerId} .ft-file-explorer-actions button.delete`) as HTMLButtonElement;

        deleteBtn.disabled = Utils.getAllItemsForDirectory(Utils.getRootFileExplorerItem(explorerId)).count === 0;
    }

    private navigateToPath(explorerId: string, path: string) {
        if (typeof path === 'string' && path !== "" && path !== "/") {

            let rootPath = path;
            if (!rootPath.startsWith("/"))
                rootPath = "/" + rootPath;

            const root = document.querySelector(`#${explorerId} [${Utils.ATTR_NAME}="${rootPath}"]`);
            if (root) {
                const paths = rootPath.split("/").filter(f => f.trim() !== "").map(m => `/${m}`);

                let currentDir = ""
                paths.forEach(path => {
                    currentDir += path;
                    Utils.openFolder(document.querySelector(`#${explorerId} [${Utils.ATTR_NAME}="${currentDir}"]`));
                })

                Utils.toggleActiveExplorerItem(explorerId, root as HTMLElement);
                // @ts-ignore
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