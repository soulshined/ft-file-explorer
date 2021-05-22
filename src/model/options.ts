interface IFTFileExplorerOptions {
    isDebug?: boolean;
    expandFolders?: boolean;
    explorerStyle?: 'material' | 'compact';
    rootPath?: string;
    allowKeyboardEventsOnFocus: boolean,
    buttons: {
        addFile: {
            visible: boolean,
            text: string
        },
        addFolder: {
            visible: boolean,
            text: string
        },
        delete: {
            visible: boolean,
            text: string
        }
    }
};

class FTFileExplorerOptions implements IFTFileExplorerOptions {
    public isDebug: boolean = false;
    public explorerStyle: 'material' | 'compact' = 'material';
    public expandFolders: boolean = false;
    public rootPath = null;
    public allowKeyboardEventsOnFocus: boolean = false;
    public buttons = {
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
    }

    constructor(options?: { [key: string]: any }) {
        if (!options) return;

        this.isDebug = this.define(options.isDebug, true, [true, false], true);
        this.expandFolders = this.define(options.expandFolders, true, [true, false], true);
        this.explorerStyle = this.define(options.explorerStyle ?? 'material', 'material', ['material', 'compact']);
        this.rootPath = options.rootPath ?? null;
        this.buttons = {
            delete: {
                visible: this.define(options.buttons?.delete?.visible ?? true, true, [true, false], true),
                text: this.define(options.buttons?.delete?.text ?? 'Delete', 'Delete', [], true)
            },
            addFile: {
                visible: this.define(options.buttons?.addFile?.visible ?? true, true, [true, false], true),
                text: this.define(options.buttons?.addFile?.text ?? 'Add File', 'Add File', [], true)
            },
            addFolder: {
                visible: this.define(options.buttons?.addFolder?.visible ?? true, true, [true, false], true),
                text: this.define(options.buttons?.addFolder?.text ?? 'Add Folder', 'Add Folder', [], true)
            }
        }
        this.allowKeyboardEventsOnFocus = this.define(options.allowKeyboardEventsOnFocus, true);
    }

    private format(val) {
        if (typeof val === 'boolean' && val.constructor == Boolean)
            return val;
        return val.toString().trim().toLowerCase();
    }

    private define(val, defaultOption, allowedOptions = [], isStrict = false) {

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