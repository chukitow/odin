import { app, Tray, Menu, ipcMain, nativeImage } from 'electron';
import log from 'electron-log';
import application from '@app/windows/application';
import { convert } from '@app/utils/converter';
import path from 'path';

import MainWindow from '@app/windows/main';
import CameraWindow from '@app/windows/camera';
import PreviewWindow from '@app/windows/preview';
import ToolsWindow from '@app/windows/tools';

let tray : Tray;
let mainWindow : MainWindow;
let cameraWindow : CameraWindow;
let previewWindow : PreviewWindow;
let toolsWindow : ToolsWindow;
const lockSingleInstance = app.requestSingleInstanceLock();

if (!lockSingleInstance) {
  app.quit();
}
else {
  initApplicationBindings();
}

ipcMain.on('DISPLAY_CAMERA', displayCamera);
ipcMain.on('CLOSE_CAMERA', closeCamera);
ipcMain.on('START_RECORDING', startRecording);
ipcMain.on('STOP_RECORDING', stopRecording);
ipcMain.on('DISPLAY_PREVIEW', displayPreview);
ipcMain.on('EXPORT', (_, data) => {
  convert(data, previewWindow);
})

function initApplicationBindings() {
  app.on('ready', createWindow);

  app.on('before-quit', function () {
    application.isQuiting = true;
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('second-instance', () => {
    if (mainWindow) {
      mainWindow.window.restore();
      mainWindow.window.focus();
      mainWindow.show();
      toolsWindow.show();
      mainWindow.window.webContents.send('DISPLAY_WINDOW');
    }
  });

  if(process.platform === 'darwin') {
    app.dock.hide();
  }
}

function createWindow() : void {
  createTray();
  createMainWindow();
  createToolsWindow();
}

function createTray() {
  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'assets', 'icons', 'tray.png')));

  tray.on('right-click', () => {
    const menu = [
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          application.isQuiting = true;
          app.quit();
        }
      }
    ];

    tray.popUpContextMenu(Menu.buildFromTemplate(menu));
  });

  tray.on('click', () => {
    if(application.isRecording) {
      stopRecording();
    }
    else {
      log.info('Display window');
      if(mainWindow.window.isVisible()) {
        mainWindow.window.hide();
        closeCamera();
        closeTools();
      }
      else {
        mainWindow.window.webContents.send('DISPLAY_WINDOW');
        mainWindow.show();
        createToolsWindow();
      }
    }
  });
}

function createMainWindow() {
  mainWindow = new MainWindow(tray);

  mainWindow.window.on('close', () => {
    closeCamera();
    closeTools();
  })

  mainWindow.window.on('blur', () => {
    if(process.platform == 'darwin') {
      log.info('Blur main window');
      mainWindow.window.hide();
      if(!application.isRecording) {
        toolsWindow.window.hide();
        closeCamera();
      }
    }
  });

  mainWindow.show();
}

function createToolsWindow() {
  toolsWindow = new ToolsWindow();
  toolsWindow.window.on('close', () => toolsWindow = null);
  toolsWindow.show();
}

function closeCamera() {
  if(cameraWindow) {
    log.info('Closing camera');
    cameraWindow.close();
  }
}

function closeTools() {
  if(toolsWindow) {
    toolsWindow.window.close();
  }
}

function startRecording() {
  log.info('Start recording');
  application.isRecording = true;
  toolsWindow.show();
  toolsWindow.window.webContents.send('START_RECORDING');
}

function stopRecording() {
  log.info('Stop recording');
  const STOP_RECORDING = 'STOP_RECORDING';
  mainWindow.window.webContents.send(STOP_RECORDING);
  toolsWindow.window.webContents.send(STOP_RECORDING);
  toolsWindow.window.hide();
  application.isRecording = false;
}

function displayCamera(_ : Electron.Event, data: { deviceId: string }) {
  closeCamera();
  log.info('Display camera');
  cameraWindow = new CameraWindow(data);
  cameraWindow.window.on('close', () => cameraWindow = null);
}

function displayPreview(_ : Electron.Event, data: { filePath: string }) {
  if(previewWindow) {
    previewWindow.close();
    previewWindow = null;
  }

  previewWindow = new PreviewWindow();
  previewWindow.window.on('close', () => previewWindow = null);
  previewWindow.window.once('ready-to-show', () => {
    previewWindow.show();
    previewWindow.window.setTitle('Preview');
    previewWindow.window.webContents.send('DID_MOUNT', data);
  });
}
