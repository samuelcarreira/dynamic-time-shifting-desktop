/*!
 * Dynamic Time-shifting Desktop renderer main page
 * 
 * @author    Samuel Carreira <samuelcarreira@outlook.com>
 * @copyright (C) 2018 Samuel Carreira
 * @license   MIT
 * @version   See package.json
 */

'use strict';

const {
    ipcRenderer
} = require('electron');

const path = require('path');

let wallpaperList = new Array();

const el = document.getElementById('filelist-list');
var sortable = new Sortable(el, {
    animation: 250,
    onUpdate: function (evt) {
        // var order = sortable.toArray();
        // console.log(order)
        wallpaperList = reorderList();
    }
});

function reorderList() {
    const list = document.querySelectorAll('#filelist-list li');

    let newWallpaperList = new Array();
    list.forEach(element => {
        newWallpaperList.push(element.getAttribute('data-file'));
    });

    ipcRenderer.send('ipcNewWallpaperList', newWallpaperList);
    return newWallpaperList;
}


ipcRenderer.on('ipcShowNotification', (event, arg) => {
    showNotification(arg);
});



ipcRenderer.on('ipcAddImages', (event, arg) => {
    wallpaperList.push(arg);
    renderImageList(arg);
});


function renderImageList(imageList) {
    const ul = document.getElementById('filelist-list');

    //ul.innerHTML = ''; //clear content

    imageList.forEach(element => {
        const filename = path.basename(element);
        const filepath = path.dirname(element);

        const node = document.createElement('li');
        node.setAttribute('data-file', element);
        node.className = 'filelist-listitem';
        node.dataset.filename = element;
        node.innerHTML = `<div class="filelist-listitem-filenames">
        <p class="filelist-filename">${filename}</p>
        <p class="filelist-path">${filepath}</p>
    </div>
    <div>
        <button title="Remove item from list" class="btn-remove-listitem">
            <img src="./assets/img/close-circle.svg" alt="X">
        </button>
    </div>`;

        ul.appendChild(node);
    });

    showHideTimeBar();
}

/**
 * Only shows time side bar helper if height is above 100px
 */
function showHideTimeBar() {
    const ul = document.getElementById('filelist-list');
    if (ul.clientHeight > 100) {
        document.getElementById('filelist-time-container').style.visibility = 'visible';
        document.getElementById('filelist-time-container').style.height = ul.clientHeight + 'px';
    } else {
        document.getElementById('filelist-time-container').style.visibility = 'hidden';
    }
}

/**
 * Show html5 notification
 * 
 * @param {object} options options
 * @param {string} options.body text to show on message (Required), max 250 chars
 * @param {string} options.title title of notitication (check Mac OS)
 * @param {data} options.imagedata picture data in base64
 * @param {string} options.id indentifier of the notification to listening the clicks
 */
function showNotification(options) {
    if (typeof options !== 'object' || options === null) {
        throw new Error('Must specify configuration object');
    }

    if (typeof options.title !== 'undefined' || !options.title) {
        options.title = 'Dynamic Time-shifting Desktop'; // default title
    }

    if (typeof options.imagedata === 'undefined') {
        // default image icon
        options.imagedata = path.join(__dirname, 'assets', 'icons', 'notification.png');
    }

    if (!options.id) {
        options.id = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Date.now();
    }

    const notiticationOptions = [{
        title: String(options.title),
        body: String(options.body).substring(0, 250),
        icon: options.imagedata,
        tag: options.id,
        silent: true
    }];

    try {
        const notification = new Notification(notiticationOptions[0].title, notiticationOptions[0]);
        notification.onclick = () => {
            ipcRenderer.send('ipcNotificationClicked', options.id);
            console.log('Notification clicked, id: ' + options.id);
        };
    } catch (err) {
        console.error(err);
    }
}

// detect key presses (toogle settings or playlist)
document.onkeyup = function (evt) {
    evt.preventDefault();

    evt = evt || window.evt;

    var charCode = evt.keyCode || evt.which;

    // F5 preview
    if (charCode === 116) {
        
    }

    // F1 help
    if (charCode === 112) {
        document.getElementById('dialog-tips').showModal();
    }
};

function addEvent(el, type, handler) {
    el.addEventListener(type, handler);
}


// live binding helper with CSS selector
function live(selector, event, callback, context) {
    addEvent(context || document, event, function (e) {
        var qs = (context || document).querySelectorAll(selector);
        if (qs) {
            var el = e.target || e.srcElement,
                index = -1;
            while (el && ((index = Array.prototype.indexOf.call(qs, el)) === -1)) el = el.parentElement;
            if (index > -1) callback.call(el, e);
        }
    });
}

live('.btn-remove-listitem', 'click', function () {
    const elem = this;
    //const elemIndex = Array.from(elem.parentNode.parentNode.parentNode.children).indexOf(elem.parentNode.parentNode);

    //ipcRenderer.send('ipcRemoveWallpaperItem', elemIndex);

    elem.parentNode.parentNode.parentNode.removeChild(elem.parentNode.parentNode);
    showHideTimeBar();
    wallpaperList = reorderList();
});


document.getElementById('btn-settings').onclick = () => {
    ipcRenderer.send('ipcButtonSettings');
};
document.getElementById('btn-preview').onclick = () => {
    ipcRenderer.send('ipcButtonPreview');
};
document.getElementById('btn-add-folder').onclick = () => {
    ipcRenderer.send('ipcButtonAddFolder');
};
document.getElementById('btn-add-file').onclick = () => {
    ipcRenderer.send('ipcButtonAddFile');
};

//ipcRenderer.send('ipcOpen-folder-dialog');

//document.getElementById('modal-settings').showModal();

document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('getInitialContent');
});


