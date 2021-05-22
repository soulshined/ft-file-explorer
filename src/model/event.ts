enum EventTypes {
    SELECTED = 'selected',
    DELETED = 'deleted',
    DELETING = 'deleting',
    CREATED = 'created',
    CREATING = 'creating',
    ERROR = 'error'
}

class EventData {
    public explorerId: string;
    public nodeType: 'folder' | 'file' = 'file';
    public path?: string;
    public error?: {
        action: string,
        msg: string
    };

    constructor(explorerId, path) {
        this.explorerId = explorerId;
        this.path = path;
        if (Utils.isFolder(Utils.getFileExplorerItemByPath(explorerId, path)))
            this.nodeType = 'folder';
        this.path = path || null;
    }
}

class FTFileExplorerEvent {
    public type: EventTypes;
    public data: EventData;

    constructor(type: EventTypes, explorerId, path) {
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
        }
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