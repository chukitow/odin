import path from 'path';
import { BrowserWindow, screen } from 'electron';

class Canvas {
  public window: BrowserWindow;
  constructor() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    this.window = new BrowserWindow({
      resizable: false,
      skipTaskbar: true,
      maximizable: false,
      fullscreenable: false,
      frame: false,
      movable: false,
      show: false,
      enableLargerThanScreen: true,
      width,
      height,
      transparent: true,
      focusable: false,
      webPreferences: {
        nodeIntegration: true
      }
    });

    this.window.loadURL(`file://${path.join(__dirname, 'index.html')}?screen=canvas`);
    this.window.setVisibleOnAllWorkspaces(true);
    this.window.setAlwaysOnTop(true, 'screen-saver');
    this.show();
  }

  show() {
    this.window.show();
  }
}

export default Canvas;
