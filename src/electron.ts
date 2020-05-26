import { app, Tray, Menu, ipcMain, nativeImage, Notification, BrowserWindow} from 'electron';
import { autoUpdater } from'electron-updater';
import log from 'electron-log';
import application from '@app/windows/application';
import { convert } from '@app/utils/converter';
import { displayQuickStart, store } from '@app/utils/store';
import path from 'path';

import MainWindow from '@app/windows/main';
import CameraWindow from '@app/windows/camera';
import PreviewWindow from '@app/windows/preview';
import ToolsWindow from '@app/windows/tools';
import QuickStartWindow from '@app/windows/quick_start';

autoUpdater.logger = log;

let tray : Tray;
let mainWindow : MainWindow;
let cameraWindow : CameraWindow;
let previewWindow : PreviewWindow;
let toolsWindow : ToolsWindow;
let quickStart : QuickStartWindow;
const lockSingleInstance = app.requestSingleInstanceLock();

autoUpdater.checkForUpdates().catch((err) => log.warn(err.message));

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
});

autoUpdater.on('update-available', (_info) => {
  application.isDownloading = true;
  log.info('Update available.');
});

autoUpdater.on('update-not-available', (_info) => {
  log.info('Update not available.');
});

autoUpdater.on('error', (err) => {
  application.isDownloading = false;
  log.info('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
  log.info(log_message);
});

autoUpdater.on('update-downloaded', (_info) => {
  application.isDownloading = false;
  log.info('Update downloaded');
  const notification = new Notification({
    title: '',
    body: 'New version available',
    actions: [
      { type: 'button', text: 'Update' },
    ]
  });

  notification.on('action', (_, index) => {
    log.info('action clicked', index);
    setImmediate(() => {
      log.info('quit and install update');
      application.isDownloading = true;
      app.removeAllListeners('window-all-closed');
      const browserWindows = BrowserWindow.getAllWindows();
      browserWindows.forEach(function(browserWindow : any) {
        browserWindow.removeAllListeners('close');
      });
      autoUpdater.quitAndInstall();
    });
  });

  notification.show();
});


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
ipcMain.on('ERROR_RECORDING', errorRecording);
ipcMain.on('DISPLAY_PREVIEW', displayPreview);
ipcMain.on('EXPORT', (_, data) => {
  convert(data, previewWindow);
});
ipcMain.on('FINISH_QUICK_START', () => {
  store.set('quick_start', true);
  app.relaunch();
  app.exit();
});

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
  if(displayQuickStart()) {
    createQuickStart();
  }
  else {
    createTray();
    createMainWindow();
    createToolsWindow();
  }
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

function createQuickStart() {
  quickStart = new QuickStartWindow();
  quickStart.window.on('close', () => {
    quickStart = null;
    application.isQuiting = true;
    app.quit();
  });

  quickStart.show();
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

const STOP_RECORDING = 'STOP_RECORDING';

function stopRecording() {
  log.info('Stop recording');
  mainWindow.window.webContents.send(STOP_RECORDING);
  toolsWindow.window.webContents.send(STOP_RECORDING);
  toolsWindow.window.hide();
  application.isRecording = false;
}

function errorRecording() {
  log.info('Error recording');
  application.isRecording = false;
  toolsWindow.window.webContents.send('STOP_RECORDING');
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
