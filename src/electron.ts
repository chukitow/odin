import { app, Tray, Menu, ipcMain, nativeImage } from 'electron';
import log from 'electron-log';
import MainWindow from '@app/windows/main';
import CameraWindow from '@app/windows/camera';
import PreviewWindow from '@app/windows/preview';
import ToolsWindow from '@app/windows/tools';
import application from '@app/windows/application';
import { convert } from '@app/utils/converter';
import path from 'path';
let tray: Tray;
let mainWindow : MainWindow;
let cameraWindow : CameraWindow;
let previewWindow : PreviewWindow;
let toolsWindow : ToolsWindow;
const lockSingleInstance = app.requestSingleInstanceLock();

if (!lockSingleInstance) {
  app.quit();
}
else {
  app.on('second-instance', () => {
    log.info('Second Intance');
    if (mainWindow) {
      mainWindow.window.restore();
      mainWindow.window.focus();
      mainWindow.show();
      toolsWindow.show();
      mainWindow.window.webContents.send('DISPLAY_WINDOW');
    }
  });

  app.on('ready', createWindow);
  app.on('before-quit', function () {
    application.isQuiting = true;
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  if(process.platform === 'darwin') {
    app.dock.hide();
  }
}

function createWindow() : void {
  log.info('Create Tray Window');
  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'assets', 'icons', 'tray.png')));
  mainWindow = new MainWindow(tray);
  mainWindow.window.on('close', () => {
    closeCamera();
    closeTools();
  })
  mainWindow.show();
  toolsWindow = new ToolsWindow();
  toolsWindow.window.on('close', () => toolsWindow = null);
  toolsWindow.show();

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
    log.info('Tray clicked');
    if(application.isRecording) {
      log.info('Stop recording');
      mainWindow.window.webContents.send('STOP_RECORDING');
      toolsWindow.window.webContents.send('STOP_RECORDING');
      toolsWindow.window.hide();
      application.isRecording = false;
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
        toolsWindow = new ToolsWindow();
        toolsWindow.window.on('close', () => toolsWindow = null);
        toolsWindow.show();
      }
    }
  });

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
}

ipcMain.on('DISPLAY_CAMERA', (_, data) => {
  log.info('Display camera');
  if(cameraWindow) {
    closeCamera();
  }

  cameraWindow = new CameraWindow(data);
  cameraWindow.window.on('close', () => cameraWindow = null);
});

ipcMain.on('CLOSE_CAMERA', () => {
  closeCamera();
});

ipcMain.on('START_RECORDING', () => {
  log.info('Start recording');
  application.isRecording = true;
  toolsWindow.show();
  toolsWindow.window.webContents.send('START_RECORDING');
});

ipcMain.on('STOP_RECORDING', () => {
  log.info('Stop recording');
  mainWindow.window.webContents.send('STOP_RECORDING');
  toolsWindow.window.webContents.send('STOP_RECORDING');
  toolsWindow.window.hide();
  application.isRecording = false;
});

ipcMain.on('DISPLAY_PREVIEW', (_, data) => {
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
});

ipcMain.on('EXPORT', (_, data) => {
  convert(data, previewWindow);
})

function closeCamera() {
  log.info('Closing camera');
  if(cameraWindow) {
    cameraWindow.close();
  }
}

function closeTools() {
  if(toolsWindow) {
    toolsWindow.window.close();
  }
}
