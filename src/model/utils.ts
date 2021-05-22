class Utils {
    public static ATTR_NAME = 'data-ft-file-explorer-path';

    static openFolder(target: HTMLElement) {
        if (!this.isFolderOpen(target)) {
            target.classList.add('open');
            target.setAttribute('aria-selected', "true");
            target.setAttribute('aria-expanded', "true");
        }
    }

    static closeFolder(target: HTMLElement) {
        if (this.isFolderOpen(target)) {
            target.classList.remove('open');
            target.setAttribute('aria-selected', "false");
            target.setAttribute('aria-expanded', "false");
        }
    }

    static toggleFolder(target: HTMLElement) {
        if (this.isFolderOpen(target)) {
            this.closeFolder(target);
        }
        else this.openFolder(target);
    }

    static isFile(element: HTMLElement): boolean {
        return element && element.tagName === 'LI' && element.classList.contains('file');
    }

    static isFolder(element: HTMLElement): boolean {
        return element && element.tagName === 'LI' && element.classList.contains("folder");
    }

    static isFileOrFolder(element: HTMLElement) {
        return this.isFile(element) || this.isFolder(element);
    }

    static isFolderOpen(element: HTMLElement) {
        return element && element.classList.contains('open');
    }

    static isRoot(element: HTMLElement) {
        return this.isFolder(element) && element.getAttribute(this.ATTR_NAME) === '/';
    }

    static toggleActiveExplorerItem(explorerId: string, target: HTMLElement) {
        [...document.querySelectorAll(`#${explorerId} div.explorer li.file, #${explorerId} div.explorer li.folder`)].map(m => {
            m.classList.remove('active');
            m.setAttribute("aria-selected", "false");
        });
        target.classList.add('active');
        target.setAttribute('aria-selected', "true");
    }

    static getRootFileExplorerItem(explorerId: string): HTMLElement {
        return document.querySelector(`#${explorerId} div.explorer [${this.ATTR_NAME}="/"]`);
    }

    static getFileExplorerItemByPath(explorerId: string, path: string): HTMLElement {
        return document.querySelector(`#${explorerId} div.explorer [${this.ATTR_NAME}="${path}"]`);
    }

    static getFileExplorerItemParentDirPath(target: HTMLElement): string {
        let path = target.getAttribute(this.ATTR_NAME);
        path = path.substring(0, path.lastIndexOf("/"));
        return path === "" ? "/" : path;
    }

    /**
     * Get all files or folders when actively on a folder (directory)
     * @param itemType files | folders
     * @param target
     * @returns
     */
    static getItemsForDirectory(itemType: 'files' | 'folders', target: HTMLElement): HTMLElement[] {
        // if (!this.isFolder(target) && !this.isRoot(target)) return [];
        if (!this.isFolder(target)) return [];

        // @ts-ignore
        if (target.nextSibling && target.nextSibling.classList.contains('subtree')) {
            const subtree = itemType === 'files'
                ? target.nextSibling.firstChild.lastChild.firstChild
                : target.nextSibling.firstChild.firstChild.firstChild;

            if (subtree.parentElement.classList.contains(itemType) && subtree.parentElement.tagName === 'LI')
                // @ts-ignore
                return [...subtree.childNodes].filter(f => !f.classList.contains('subtree')) as HTMLElement[];
        }

        return [];
    }

    static getAllItemsForDirectory(target: HTMLElement, excludeSubtree = true) {
        // if (!this.isFolder(target) && !this.isRoot(target)) return [];
        if (!this.isFolder(target)) return { folders: [], files: [], count: 0 };

        // @ts-ignore
        if (target.nextSibling && target.nextSibling.classList.contains('subtree')) {
            const subtree = target.nextSibling.firstChild;
            let folders = [...subtree.firstChild.firstChild.childNodes];
            // @ts-ignore
            if (excludeSubtree) folders = folders.filter(f => !f.classList.contains('subtree'));
            const files = [...subtree.lastChild.firstChild.childNodes];

            return {
                folders,
                files,
                count: folders.length + files.length
            }
        }

        return {
            folders: [],
            files: [],
            count: 0
        };
    }

    /**
     * Get folders on the same level, even if the target is a file
     * @param target
     * @returns
     */
    static getSiblingFolders(target) {
        const subtree = target.closest('.subtree > ul:first-child > li.folders:first-child > ul:first-child');
        const children = [...subtree.children].filter(c => c.classList.contains("folder"));

        const index = children.indexOf(target);
        if (index < 0) return { previous: [], next: [], count: 0 };

        const previous = children.slice(0, index).reverse();
        const next = children.slice(index + 1);

        return {
            previous,
            next,
            count: previous.length + next.length
        }
    }

    static getPreviousVisibleLogicalOrderFileExlporerItem(explorerId, target) {
        if (this.isRoot(target)) return;

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
                    else return subfolders[subfolders.length - 1];
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
                        fileLoop:
                        for (let i = 0; i < files.length; i++) {
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
                //now get open folder stuff
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
                    folder = this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(closedFoldersAboveTarget[0] as HTMLElement));
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

            //check for sibling folder of parent directory
            if (closestSubtree.nextSibling) {
                return closestSubtree.nextSibling;
            }
            else if (!target.nextSibling && Utils.isRoot(this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(target)))) {
                return;
            }
            else {
                do {
                    const files = this.getItemsForDirectory('files', dirParent);

                    if (files.length > 0) return files[0];
                    dirParent = this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(dirParent));
                } while (dirParent !== null && this.getFileExplorerItemParentDirPath(dirParent) !== '/');
            }
        }
        else if (this.isFolder(target)) {
            if (this.isFolderOpen(target)) {
                //check for subfolders
                const subfolders = this.getItemsForDirectory('folders', target);

                if (subfolders.length > 0)
                    return subfolders[0];

                //check for subfiles
                let files = this.getItemsForDirectory('files', target);

                if (files.length > 0)
                    return files[0];

                if (this.isRoot(target)) return;

                const siblingFolders = this.getSiblingFolders(target);

                if (siblingFolders.next.length > 0)
                    return siblingFolders.next[0];

                files = this.getItemsForDirectory('files', this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(target)));

                if (files.length > 0)
                    return files[0];

                const parent = this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(target));

                //get parent folders files/folders recursively
                let dirParent = parent;
                let dirTarget = target;

                do {
                    //check for folders on same level
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
                //collapsed folder
                const parent = this.getFileExplorerItemByPath(explorerId, this.getFileExplorerItemParentDirPath(target));

                let dirParent = parent;
                let dirTarget = target;

                do {
                    //check for folders on same level
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

    static getInsertBeforeNode(targetPath: string, activeNode, addType: 'file' | 'folder', explorerId) {
        let result = {
            parent: null,
            target: null
        }

        if (Utils.isFolder(activeNode)) {
            if (!activeNode.nextSibling || !activeNode.nextSibling.classList.contains('subtree')) {
                (activeNode.parentElement as HTMLElement).insertBefore(ElementBuilder.newSubtree().build(), activeNode.nextSibling);
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
                // @ts-ignore
                const files = items.files.map(m => m.getAttribute(Utils.ATTR_NAME));

                files.push(targetPath);
                files.sort();
                const targetIndex = files.indexOf(targetPath);
                // @ts-ignore
                result.target = items.files.filter(f => f.getAttribute(Utils.ATTR_NAME) === files[targetIndex + 1])[0];
            }
            else {
                result.parent = document.querySelector(`#${explorerId} [${Utils.ATTR_NAME}="${Utils.getFileExplorerItemParentDirPath(activeNode)}"] + .subtree > ul:first-child > li.folders > ul:first-child `);

                let prev = null;
                // @ts-ignore
                const folders = items.folders.map(m => {
                    // @ts-ignore
                    if (m.classList.contains('subtree')) return prev;
                    else {
                        // @ts-ignore
                        const path = m.getAttribute(Utils.ATTR_NAME);
                        prev = path;
                        return path;
                    }
                });
                folders.push(targetPath);
                folders.sort();
                const targetIndex = folders.indexOf(targetPath);
                // @ts-ignore
                result.target = items.folders.filter(f => f.getAttribute(Utils.ATTR_NAME) === folders[targetIndex + 1]
                )[0];
            }
        }

        return result;
    }

    static convertToJSON(explorerId: string) {
        const root = Utils.getRootFileExplorerItem(explorerId);

        return this.getJSONSegements(explorerId, root);
    }

    private static getJSONSegements(explorerId: string, dir: HTMLElement) {
        const json = [];

        const items = Utils.getAllItemsForDirectory(dir);
        const folders = {};

        if (items.count > 0) {
            items.folders.forEach(f => {
                // @ts-ignore
                const path = f.getAttribute(this.ATTR_NAME);
                folders[path.substring(path.lastIndexOf("/") + 1)] = this.getJSONSegements(explorerId, Utils.getFileExplorerItemByPath(explorerId, path));
            })
            json.push(folders);
            json.push(...items.files.map(f => {
                // @ts-ignore
                const path = f.getAttribute(this.ATTR_NAME);
                return path.substring(path.lastIndexOf('/') + 1);
            }));
        }

        return json;
    }
}