# FT-File-Explorer

A lightweight, 35kb, library-free JavaScript file explorer backbone with built-in accessibility, built-in keyboard shortcuts for deleting or creating files or navigating trees and customizable configurations

---

> Note: this is not a file explorer in the sense of uploading and exploring an end-users actual hard drive, this is an emulation of a file explorer where you can subscribe to and process events accordingly

## Features

- Absolutely *minimal* CSS so you have the power and flexibility to create something perfect for your needs. Review how you can harness the power in the [CSS section](#css-flexibility)
- Accessibility roles and aria labels are natively included - in addition to automatically updating based on the circumstance (if a folder collapses or expands etc)
- Out-of-the-box keyboard shortcuts and keyboard navigation support
- Configurations per tree
- Some minor input sanitization is included, but you can configure your own callback to provide more thorough validations or custom overlays
- Duplicate detection
- Pick from theme options : 'material', 'compact'

## Demo

See the [github pages demo](https://soulshined.github.io/ft-file-explorer/) for examples and live demos

---

## Download

### Download and add to your project:
```html
<head>
    <script src='js/ft-file-explorer.min.js'></script>
</head>
```
or add to script tag via jsdelivr:

```html
<head>
    <script src='https://cdn.jsdelivr.net/gh/soulshined/ft-file-explorer@v1.0.0/src/ft-file-explorer.min.js'></script>
</head>
```

"Version numbers" are [releases](https://github.com/soulshined/ft-file-explorer/tags)

---

## Keyboard Events

- `Shift + n` : Add a folder
- `n` : Add a file
- `ArrowUp` : Move up to the nearest folder or file. This is a logical move up, meaning, it will move to what's visibly next, taking into account parent folders and expanded/collapsed states etc
- `ArrowDown` : Move down to the nearest folder or file. This is a logical move down, meaning, it will move to what's visibly next, taking into account parent sibling folders and expanded/collapsed states etc
- `ArrowRight` : Traverse to the right of the current directory until the bottom most file of the bottom most subfolder is selected. This will not jump parent directories. If a folder is collapsed this will simultaneously open it
- `ArrowLeft` : Traverse to the parent directory of the current item until the top most directory of the top most folder is selected. If a folder is expanded this will simultaneously collapse it
- `Delete` : Delete a folder or file
- `Space` : Select (or toggle) an item
- `Enter` : Select (or toggle) an item
- `Tab` : Tab stops are enabled for accessibility. This will activate buttons if they are enabled or the explorer
---

## Developer Usage
### Create a new File Explorer Watcher
```javascript
const fs = new FTFileExplorer();
```
One instantiated object is all you need, ***you do not need to create multiple objects for different trees***

### Structuring trees
A tree is an **array** of objects *or* strings only.

- Strings are considered 'files'
- Objects are the 'folders' which contain n number of `[key: string] : []`

  Meaning objects can ***only*** contain keys (folder names), with values that are ***only*** arrays of objects *or* string values only.

To put it simply, each subfolder will be an array with exactly one object,
and/or n number of strings.

For example, if you have a root folder for web dev it would look something like this:

```
\-root
  |__css\
      |__imports\
         |__fonts.css
      |__main.css
      |__print.css
  |__js\
     |__main.js
  |__images\
  |__index.html
```

To represent that in a tree array of objects and strings, it would look like the following:

```javascript
const root = [
    {
        "css": [
            {
                "imports" : [ "fonts.css" ]
            },
            "main.css",
            "print.css"
        ],
        "js": [ "main.js" ],
        "images": []
    },
    "index.html"
]
```

Notice how each folder is an array, with exactly one object that contains keys (folder names) with nested trees as its value, or only strings for file names.

### Register your trees
```html
<div id="myTree"></div>
<div id="myOtherTree"></div>
```
```javascript
fs.createTree("myTree", [
    {
        "src": [
            {
                "js": ["main.js"],
                "css": [
                    {
                        bootstrap: [
                            "main.min.css",
                            { common: [] }
                        ]
                    },
                    "main.css"
                ],
            },
            "index.html",
            "index.fthtml"
        ],
        ".dev": [],
        ".fthtml": [
            {
                "imports": [
                    {
                        "components" : []
                    }
                ],
            }
        ]
    },
    "index.html", "package.json"
]);

fs.createTree("myOtherTree", [
    {
        "lib": [],
        "node_modules": []
    },
    "index.html",
    "package.json"
]);
```

### Get Tree State

At any time you can get the current tree state by calling:

`fs.toJSON(<elementId>)`

### Customizations

Please see a detailed overview of the options in the [demo page](https://soulshined.github.io/ft-file-explorer/)

To configure a specific tree just add those customizations in the `createTree` call:

```javascript
fs.createTree("myOtherTree", [
    {
        "lib": [],
        "node_modules": []
    },
    "index.html",
    "package.json"
], {
    expandFolders: true,
    rootPath: "package.json",
    buttons: {
        delete: {
            text: '⛔'
        }
    }
});
```

### Event Handling

All events return the target, or the element id of that the action occurred in, and event data pertaining to that specific event:

```javascript
fs.on(<event>, (data) => {
    console.log('event in tree:', 'target', data.explorerId, 'data', data);
});
```

At minimum, every event will contain the following data properties:

```javascript
data = {
    nodeType: 'folder' | 'file';
    explorerId: "id of element",
    path: string | null;
}
```

*Where path is the path of the item the user is actively on, not the path of the one they want to create or delete etc.*

Once your instantiated watcher is created and a valid tree is created, you can listen to the following events:

- selected

  Any time a user clicks on a tree element or 'selects' it with space/enter your callback will be executed.


  ```javascript
  fs.on("selected", (data) => {
    console.log('selected in tree: target', data.explorerId, 'data', data);
  });
  ```

  Additional Data Properties:
  - `data.state` : Identifies if the folder is currently collapsed or expanded

- creating

  Any time a user starts to create a new item.

  If you include this event or add a callback, this is expecting you to return true/false, meaning true - they can create the item.

  This allows you the opportunity to add your own logic around approving/denying specific characters or words etc, or your own overlay etc.

  If you return false, the file explorer will not add the item to the tree

  If you do not use this event or add a callback, then the browsers default `prompt` dialog box will be used.

  ```javascript
  fs.on("creating", (data) => {
    console.log('creating in tree:', data.explorerId, 'data', data);
    return prompt(`Add ${data.nodeType} dir: ${data.path}`);
  })
  ```

- created

  Any time a user successfully processed creating an item

  ```javascript
  fs.on("created", (data) => {
    console.log('created in tree:', data.explorerId, 'data', data);
  })
  ```
  Additional Data Properties:
  - `data.isDuplicate` : Identifies if item the user is trying to add already exists in the tree (the item was not added in this case)
  - `data.tree` : The current tree state, as JSON, after the item was successfully created

- deleting

  Any time a user starts to delete a new item with buttons or keyboard shortcuts

  If you include this event or add a callback, this is expecting you to return true/false, meaning true - they can delete the item.

  This allows you the opportunity to add your own logic around approving/denying deletions, or your own overlay etc.

  If you return false, the file explorer will not delete the item in the tree

  ```javascript
  fs.on("deleting", (data) => {
    console.log('deleting in tree:', 'target', data.explorerId, 'data', data);
    return true;
  });
  ```

- deleted

  Any time a user successfully processed deleting an item

  ```javascript
  fs.on("deleted", (data) => {
    console.log('deleted in tree:', 'target', data.explorerId, 'data', data);
  });
  ```

  Additional Data Properties:
  - `data.tree` : The current tree state, as JSON, after the item was successfully deleted
- error

  Any time there is an error, for example say the user entered in a null value or whitespace only value when creating a new file, an error will emitted and you can process accordingly.

  The events are the same as listed above, prefixed with 'on' and camel case:

  ```javascript
  fs.on("error", (data) => {
    console.log("error -> (data)", data);
  })
  ```
  Additional Data Properties:
  - `data.error.action` : The 'event' - 'onCreating', 'onDeleted', 'onSelected' etc
  - `data.error.msg` : Description of issue

## CSS Flexibility

I purposely included minimal CSS so that you can have the flexibility 2021 should afford developers. There's no reason you should be forced to my 'design' choices.

Outside of padding and display properties (flex), you can virtually style it as if no library is the middle of it at all.

I don't recommend overriding the padding, because that's how the files and folders are 'indented' so that they look like subfolders etc, but of course nothing is stopping you from using !important.

You can simply override the default hover and active selected items by setting our variables anywhere in your CSS file, it doesn't have to be in the root selector:
```css
:root {
  --ft-fe-active: #e4e6f1;
  --ft-fe-hover: #e8e8e8;
}
```

Use the following selectors to style your explorers:

- Container
    ```css
    div.ft-file-explorer {}
    ```

- Buttons Hierarchy
    ```css
    .ft-file-explorer > .ft-file-explorer-actions {}
    ```
    Add File
    ```css
    .ft-file-explorer > .ft-file-explorer-actions > button.addfile {}
    ```
    Add Folder
    ```css
    .ft-file-explorer > .ft-file-explorer-actions > button.addfolder {}
    ```
    Delete
    ```css
    .ft-file-explorer > .ft-file-explorer-actions > button.delete {}
    ```

- Explorer Hierarchy
    ```css
    .ft-file-explorer .explorer > ul.tree {}
    ```
    Files
    ```css
    .ft-file-explorer .explorer > ul.tree li.file {}
    ```
    Folders
    ```css
    .ft-file-explorer .explorer > ul.tree li.folder {}
    ```
    Open folders
    ```css
    .ft-file-explorer .explorer > ul.tree li.folder.open {}
    ```
    Root folder
    ```css
    .ft-file-explorer .explorer > ul.tree li.folder.root {}
    ```
    Currently Selected Item
    ```css
    .ft-file-explorer .explorer > ul.tree li.file.active,
    .ft-file-explorer .explorer > ul.tree li.folder.active {}
    ```
