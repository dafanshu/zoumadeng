// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
// global.$ = $;
var btn = document.getElementById('btn-open-file');

btn.onclick = openFileWin;

document.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    files = []
    for (const f of e.dataTransfer.files) {
        console.log(f)
        files.push(f.path)
    }
    window.channel.loopDirs(files)
});
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

function openFileWin(){
    window.channel.send("toMain", "");
}

document.onkeydown = function (event) {
    var e = event || window.event || arguments.callee.caller.arguments[0]
    let imgSrc
    if (e && e.keyCode == 37) { // 按 左
        imgSrc = window.channel.previous()
    }else if (e && e.keyCode == 39) { // 按 右
        imgSrc = window.channel.next()
    }
    if (imgSrc){
        setImgSrc(imgSrc)
    }
}

function setImgSrc(src) {
    img = document.getElementById('img')
    img.src = src
}