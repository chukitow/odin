import { app, Tray, Menu, ipcMain } from 'electron';
import MainWindow from '@app/modules/main_window';
import CameraWindow from '@app/modules/camera_window';
import application from '@app/modules/application';
import * as path from 'path';
let tray: Tray;
let mainWindow : MainWindow;
let cameraWindow : CameraWindow;

app.on('ready', createWindow);

function createWindow() : void {
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
    if(application.isRecording) {
      mainWindow.window.webContents.send('STOP_RECORDING');
      application.isRecording = false;
    }
    else {
      mainWindow.window.webContents.send('DISPLAY_WINDOW');
      mainWindow.show();
    }
  });

  mainWindow.window.on('blur', () => {
    mainWindow.window.hide();
    if(!application.isRecording) {
      cameraWindow.close();
      cameraWindow = null;
    }
  });
}

ipcMain.on('DISPLAY_CAMERA', (_, data) => {
  if(cameraWindow) {
    closeCamera();
  }

  cameraWindow = new CameraWindow(data);
});

ipcMain.on('CLOSE_CAMERA', () => {
  closeCamera();
});

ipcMain.on('START_RECORDING', () => {
  application.isRecording = true;
})

function closeCamera() {
  if(cameraWindow) {
    cameraWindow.close();
    cameraWindow = null;
  }
}
