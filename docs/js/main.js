const fs = new FTFileExplorer();

fs.createTree("fs", [
    {
        "src": [
            {
                "js": ["main.js"],
                "css": [{ bootstrap: ["main.min.css", { common: [] }] }, "main.css"],
            },
            "index.html",
            "index.fthtml"
        ],
        ".dev": [],
        ".fthtml": [{
            "imports": [],
            "js": []
        }]
    },
    "inde.x.html", "9", "0", "package.json"
]);

fs.createTree("fs2", [
    {
        "src": [
            {
                "js": ["main.js"],
                "css": [{ bootstrap: ["main.min.css", { common: [] }] }, "main.css"],
            },
            "index.html",
            "index.fthtml"
        ],
        ".dev": []
    }
    ,
    "inde.x.html", "9", "0", "package.json"
], {
    expandFolders: false,
    rootPath: "package.json",
    isDebug: true,
    explorerStyle: 'compact'
});

fs.createTree("fs3", [
    {
        "src": [
            {
                "js": ["main.js"],
                "css": [{ bootstrap: ["main.min.css", { common: [] }] }, "main.css"],
            },
            "index.html",
            "index.fthtml"
        ],
        ".dev": [],
        ".fthtml": [{
            "imports": [],
            "js": []
        }]
    }
    ,
    "inde.x.html", "9", "0", "package.json"
], {
    expandFolders: false,
    rootPath: "package.json",
    isDebug: false
});

fs.on("deleting", (data) => {
    console.log('deleting in tree:', 'target', data.explorerId, 'data', data);
    return true;
});

fs.on("deleted", (data) => {
    console.log('deleted in tree:', 'target', data.explorerId, 'data', data);
});

fs.on("selected", (data) => {
    console.log('selected in tree: target', data.explorerId, 'data', data);
});

fs.on("created", (data) => {
    console.log('created in tree:', data.explorerId, 'data', data);
})

fs.on("creating", (data) => {
    console.log('creating in tree:', data.explorerId, 'data', data);
    return prompt(`Add ${data.nodeType}

dir: ${data.path}`);
})

fs.on("error", (data) => {
    console.log("error -> (data)", data);
})