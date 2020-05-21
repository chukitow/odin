import { app, Tray, Menu, ipcMain, nativeImage } from 'electron';
import log from 'electron-log';
import MainWindow from '@app/modules/main_window';
import CameraWindow from '@app/modules/camera_window';
import PreviewWindow from '@app/modules/preview_window';
import application from '@app/modules/application';
import { convert } from '@app/utils/converter';
import path from 'path';
let tray: Tray;
let mainWindow : MainWindow;
let cameraWindow : CameraWindow;
let previewWindow : PreviewWindow;

app.on('ready', createWindow);

if(process.platform === 'darwin') {
  app.dock.hide();
}

function createWindow() : void {
  log.info('Create Tray Window');
  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'assets', 'icons', 'tray.png')));
  mainWindow = new MainWindow(tray);
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
      application.isRecording = false;
    }
    else {
      log.info('Display window');
      mainWindow.window.webContents.send('DISPLAY_WINDOW');
      mainWindow.show();
    }
  });

  mainWindow.window.on('blur', () => {
    log.info('Blur main window');
    mainWindow.window.hide();
    if(!application.isRecording) {
      closeCamera();
    }
  });
}

ipcMain.on('DISPLAY_CAMERA', (_, data) => {
  log.info('Display camera');
  if(cameraWindow) {
    closeCamera();
  }

  cameraWindow = new CameraWindow(data);
});

ipcMain.on('CLOSE_CAMERA', () => {
  closeCamera();
});

ipcMain.on('START_RECORDING', () => {
  log.info('Start recording');
  application.isRecording = true;
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
    cameraWindow = null;
  }
}
