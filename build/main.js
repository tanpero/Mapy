var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/electron/index.js
var require_electron = __commonJS({
  "node_modules/electron/index.js"(exports, module2) {
    var fs2 = require("fs");
    var path2 = require("path");
    var pathFile = path2.join(__dirname, "path.txt");
    function getElectronPath() {
      let executablePath;
      if (fs2.existsSync(pathFile)) {
        executablePath = fs2.readFileSync(pathFile, "utf-8");
      }
      if (process.env.ELECTRON_OVERRIDE_DIST_PATH) {
        return path2.join(process.env.ELECTRON_OVERRIDE_DIST_PATH, executablePath || "electron");
      }
      if (executablePath) {
        return path2.join(__dirname, "dist", executablePath);
      } else {
        throw new Error("Electron failed to install correctly, please delete node_modules/electron and try installing again");
      }
    }
    module2.exports = getElectronPath();
  }
});

// app/application-menu.js
var require_application_menu = __commonJS({
  "app/application-menu.js"(exports, module2) {
    var { app: app2, BrowserWindow: BrowserWindow2, Menu: Menu2, shell: shell2, dialog: dialog2 } = require_electron();
    var mainProcess = (init_main(), __toCommonJS(main_exports));
    var template = [
      {
        label: "文件",
        submenu: [
          {
            label: "新建",
            accelerator: "CommandOrControl+N",
            click() {
              mainProcess.createWindow();
            }
          },
          {
            label: "打开",
            accelerator: "CommandOrControl+O",
            click(item, focusedWindow) {
              mainProcess.openFileFromUser(focusedWindow);
            }
          }
        ]
      },
      {
        label: "编辑",
        submenu: [
          {
            label: "撤销",
            accelerator: "CommandOrControl+Z",
            role: "undo"
          },
          {
            label: "重做",
            accelerator: "CommandOrControl+Y",
            role: "redo"
          },
          { type: "separator" },
          {
            label: "剪切",
            accelerator: "CommandOrControl+X",
            role: "cut"
          },
          {
            label: "复制",
            accelerator: "CommandOrControl+C",
            role: "copy"
          },
          {
            label: "粘贴",
            accelerator: "CommandOrControl+V",
            role: "paste"
          },
          {
            label: "全选",
            accelerator: "CommandOrControl+A",
            role: "selectall"
          }
        ]
      },
      {
        label: "帮助",
        role: "help",
        submenu: [
          {
            label: "项目主页",
            click() {
            }
          },
          {
            label: "开发者工具",
            click(item, focusedWindow) {
              if (focusedWindow) {
                focusedWindow.webContents.toggleDevTools();
              }
            }
          },
          { type: "separator" },
          {
            label: "关于项目",
            click(item, focusedWindow) {
              if (focusedWindow) {
                mainProcess.showAboutWindow();
              }
            }
          }
        ]
      }
    ];
    if (process.platform === "darwin") {
      const name = "Mapy";
      template.unshift({ label: name });
    }
    module2.exports = Menu2.buildFromTemplate(template);
  }
});

// app/main.js
var main_exports = {};
__export(main_exports, {
  createWindow: () => createWindow,
  openFile: () => openFile,
  openFileFromUser: () => openFileFromUser,
  showAboutWindow: () => showAboutWindow
});
module.exports = __toCommonJS(main_exports);
var import_electron, import_path, import_fs, import_application_menu, as, windowInitSettings, windows, randomOffset, createWindow, showAboutWindow, openFile, openFileFromUser, openFiles, stopWatchingFile;
var init_main = __esm({
  "app/main.js"() {
    import_electron = __toESM(require_electron());
    import_path = __toESM(require("path"));
    import_fs = __toESM(require("fs"));
    import_application_menu = __toESM(require_application_menu());
    console.time("Mapy");
    as = (fileName) => import_path.default.join("app", "view", fileName);
    windowInitSettings = {
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webviewTag: true,
        enableRemoteModule: true
      }
    };
    windows = /* @__PURE__ */ new Set();
    randomOffset = () => {
      let signX = Math.random() >= 0.5 ? 1 : -1;
      let signY = Math.random() >= 0.5 ? 1 : -1;
      let incrementX = Math.random() * 100;
      let incrementY = Math.random() * 100;
      return [signX * incrementX, signY * incrementY];
    };
    createWindow = (file = "index.html", windowConfigure) => {
      import_electron.nativeTheme.themeSource = "dark";
      let x, y;
      const currentWindow = import_electron.BrowserWindow.getFocusedWindow();
      if (currentWindow) {
        const [currentWindowX, currentWindowY] = currentWindow.getPosition();
        const [offsetX, offsetY] = randomOffset();
        x = currentWindowX + offsetX;
        y = currentWindowY + offsetY;
      }
      let newWindow = new import_electron.BrowserWindow(Object.assign(windowInitSettings, {
        x,
        y,
        show: false,
        autoHideMenuBar: !!windowConfigure
      }));
      newWindow.webContents.loadFile(as(file));
      if (windowConfigure) {
        windowConfigure(newWindow);
      }
      import_electron.Menu.setApplicationMenu(import_application_menu.default);
      newWindow.once("ready-to-show", () => (newWindow.show(), console.timeEnd("Mapy")));
      newWindow.on("closed", () => {
        windows.delete(newWindow);
        stopWatchingFile(newWindow);
        newWindow = null;
      });
      newWindow.webContents.setWindowOpenHandler(({ url }) => {
        import_electron.shell.openExternal(url);
        return { action: "deny" };
      });
      windows.add(newWindow);
      return newWindow;
    };
    import_electron.app.whenReady().then(() => {
      createWindow();
    });
    import_electron.app.on("activate", (e, hasVisibleWindows) => !hasVisibleWindows && createWindow());
    import_electron.app.on("window-all-closed", () => process.platform !== "darwin" && import_electron.app.quit());
    import_electron.app.on("open-file", (event, filePath) => {
      const targetWindow = windows.values().next().value;
      openFile(targetWindow, filePath);
    });
    import_electron.app.on("will-finish-launching", () => {
      import_electron.app.on("open-file", (e, file) => {
        const win = createWindow();
        win.once("ready-to-show", () => {
          openFile(win, file);
        });
      });
    });
    showAboutWindow = () => {
      createWindow("about.html", (window) => {
        window.setTitle("关于 Mapy");
      });
    };
    openFile = (targetWindow, path2) => {
      const content = import_fs.default.readFileSync(path2).toString();
      import_electron.app.addRecentDocument(path2);
      targetWindow.setRepresentedFilename(path2);
      targetWindow.webContents.send("file-has-been-opened", { path: path2, content });
    };
    openFileFromUser = (win) => {
      import_electron.dialog.showOpenDialog(win, {
        filters: [
          {
            name: "Markdown",
            extensions: ["md", "markdown"]
          },
          {
            name: "纯文本",
            extensions: ["txt"]
          },
          {
            name: "所有文件",
            extensions: ["*"]
          }
        ]
      }).then((result) => {
        if (!result.canceled) {
          const filePath = result.filePaths[0];
          openFile(win, filePath);
        }
      });
    };
    import_electron.ipcMain.on("openNewBlankFileWindow", (e) => {
      createWindow().focus();
    });
    import_electron.ipcMain.on("showOpenFileDialog", (e) => {
      const win = import_electron.BrowserWindow.getFocusedWindow();
      openFileFromUser(win);
    });
    import_electron.ipcMain.on("showSaveFileDialog", (e) => {
      import_electron.dialog.showSaveDialog(import_electron.BrowserWindow.getFocusedWindow(), {
        filters: [
          {
            name: "Markdown",
            extensions: ["md", "markdown"]
          },
          {
            name: "所有文件",
            extensions: ["*"]
          }
        ]
      }).then((result) => {
        if (!result.canceled) {
          const filePath = result.filePath;
          e.reply("save-file", {
            path: filePath
          });
        }
      });
    });
    import_electron.ipcMain.on("showSaveHtmlFileDialog", (e) => {
      import_electron.dialog.showSaveDialog(import_electron.BrowserWindow.getFocusedWindow(), {
        title: "保存预览",
        defaultPath: import_electron.app.getPath("desktop"),
        filters: [
          {
            name: "HTML 文件",
            extensions: ["html"]
          },
          {
            name: "所有文件",
            extensions: ["*"]
          }
        ]
      }).then((result) => {
        if (!result.canceled) {
          const filePath = result.filePath;
          e.reply("html-path-has-been-set", {
            path: filePath
          });
        }
      });
    });
    import_electron.ipcMain.on("to-save-html", (e, { filePath, content }) => {
      import_fs.default.writeFileSync(filePath, content, "utf-8", (e2) => {
        if (e2)
          console.error(e2);
      });
    });
    openFiles = /* @__PURE__ */ new Map();
    stopWatchingFile = (targetWindow) => {
      if (openFiles.has(targetWindow)) {
        openFiles.get(targetWindow).stop();
        openFiles.delete(targetWindow);
      }
    };
    import_electron.ipcMain.on("showFileHasBeenChangedAccidentally", (e) => {
      import_electron.dialog.showMessageBox(import_electron.BrowserWindow.getFocusedWindow(), {
        type: "warning",
        title: "需要注意的情况 😮",
        message: "文件被外部程序修改了!🤦‍♀️\n是否仍然保存？💁‍♀️",
        buttons: ["是的", "不"],
        defaultId: 0,
        cancelId: 1
      }).then((result) => {
        if (result.response === 0) {
          e.reply("overwrite-external-edit");
        } else {
          e.reply("reload-external-edit");
        }
      });
    });
  }
});
init_main();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createWindow,
  openFile,
  openFileFromUser,
  showAboutWindow
});
