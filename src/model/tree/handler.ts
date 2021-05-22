class FTTreeBuilder {
    private options: FTFileExplorerOptions;
    private cDepth = 0;

    constructor(options: FTFileExplorerOptions) {
        this.options = options;
    }

    public generate(tree: { [key: string]: any }) {
        // @ts-ignore
        if (typeof tree !== 'object' && tree.constructor !== Object)
            throw new Error('1st Argument expecting an object of kvps');

        const div = new ElementBuilder('div')
            .addClass('explorer', this.options.explorerStyle);

        const ul = new ElementBuilder("ul")
            .addClass('tree')
            .append(
                new ElementBuilder('li')
                    .addClass('folder', 'root', 'open')
                    .innerText('/').attr('tabindex', 0)
                    .attr(Utils.ATTR_NAME, "/")
                    .attr('role', 'tree')
                    .attr('aria-expanded', true)
        )

            .append(new ElementBuilder('li').addClass('subtree').append(new ElementBuilder('ul').append(...this.createTree(tree))));

        return div.append(ul).build();
    }

    private createTree(tree, path = ""): [ElementBuilder, ElementBuilder] {
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
        })

        this.cDepth--;
        return [
            new ElementBuilder('li').addClass('folders').append(folders),
            new ElementBuilder('li').addClass('files').append(files)
        ];
    }

    private createFolder(content: string, path: string) {
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
            li.attr('aria-expanded', true)
        }

        return li;
    }

    private createFile(content, path) {
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

    private throwIfHasSlashes(content: string) {
        if (~content.indexOf('/') || ~content.indexOf('\\'))
            throw new Error(`[ft-file-explorer] Invalid content name. A file or folder can not contain slashes`);
    }
}