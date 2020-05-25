import path from 'path';
import { BrowserWindow } from 'electron';

class QuickStart {
  public window: BrowserWindow;
  constructor() {
    this.window = new BrowserWindow({
      skipTaskbar: true,
      resizable: false,
      fullscreen: false,
      maximizable: false,
      titleBarStyle: 'hiddenInset',
      movable: true,
      show: false,
      minWidth: 900,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: true
      }
    });

    this.window.loadURL(`file://${path.join(__dirname, 'index.html')}?screen=quick_start`);
  }

  show() {
    this.window.show();
  }

  close() {
    this.window.close();
  }
}

export default QuickStart;
