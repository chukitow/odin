import { app, Tray, Menu, ipcMain } from 'electron';
import log from 'electron-log';
import MainWindow from '@app/modules/main_window';
import CameraWindow from '@app/modules/camera_window';
import application from '@app/modules/application';
import * as path from 'path';
let tray: Tray;
let mainWindow : MainWindow;
let cameraWindow : CameraWindow;

app.on('ready', createWindow);

if(process.platform === 'darwin') {
  app.dock.hide();
}

function createWindow() : void {
  log.info('Create Tray Window');
  tray = new Tray(path.join(__dirname, './assets/icons/tray.png'));
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
})

function closeCamera() {
  log.info('Closing camera');
  if(cameraWindow) {
    cameraWindow.close();
    cameraWindow = null;
  }
}
