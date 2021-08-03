// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { contextBridge, ipcRenderer} = require("electron");
const fs = require('fs');
var data = { imgs: [], current: 0, isDark: false };
const extensions = ['jpg', 'png', 'gif', 'jpeg']
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "channel", {
    send: (channel, data) => {
      // whitelist channels
      let validChannels = ["toMain"];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = ["fromMain"];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    next: () => {
      if (data.current >= data.imgs.length){
        data.current = -1
      }
      const current = data.current + 1
      data.current = current
      return data.imgs[current]
    },
    previous: () => {
      if (data.current <= 0) {
        data.current = data.imgs.length
      }
      const current = data.current - 1
      data.current = current
      return data.imgs[current]
    },
    loopDirs: (files) => {
      files.forEach((file) => {
        loopDir(file)
      });
      if (data.imgs.length>0){
        data.current = 0
        setFirstImgSrc(data.imgs[data.current])
      }
    }
  }
);

function loopDir(filePath){
  console.log(filePath)
  const stat = fs.statSync(filePath)
  if (stat.isFile()) { // 判断是否是文件
    const extension = filePath.substring(filePath.indexOf('.')+1)
    if (!data.imgs.includes(filePath) && extensions.includes(extension.toLowerCase())){
      data.imgs.push(filePath)
    }
  } else if (stat.isDirectory() && filePath.indexOf('.photoslibrary') == -1) { // 判断是否是目录
    const files = fs.readdirSync(filePath)
    files.forEach((file) => {
      itemPath = `${filePath}/${file}`
      loopDir(itemPath)
    });
  }
}

/** 将当前文件所属的文件夹也加进去 */
function arrangeFiles(files){
  var dirs = [], items = []
  // lastIndexOf
  files.forEach((resfile) => {
    console.log(resfile)
    const stat = fs.statSync(resfile)
    if (stat.isFile()) {
      items.push(resfile)
      const dir = resfile.substring(0, resfile.lastIndexOf('/'))
      if (!dirs.includes(dir)){
        dirs.push(dir)
      }
    } else if (stat.isDirectory() && resfile.indexOf('.photoslibrary') == -1){
      dirs.push(resfile)
    }
  })
  dirs.forEach((dir) => {
    items.push(dir)
  })
  return items
}

ipcRenderer.on("invoke-js", (event, files) => {
  files = arrangeFiles(files)
  files.forEach((resfile) => {
    loopDir(resfile)
  })
  if (data.imgs.length > 0) {
    data.current = 0
    setFirstImgSrc(data.imgs[data.current])
  }
});

function setFirstImgSrc(src) {
  img = document.getElementById('img')
  img.src = src

  select_win = document.getElementById('file-select-win')
  show_win = document.getElementById('file-show-win')
  select_win.classList.add("hide");
  show_win.classList.remove("hide");
}

