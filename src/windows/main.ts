import path from 'path';
import { BrowserWindow, Tray } from 'electron';
import application from './application';

class Main {
  public window: BrowserWindow;
  public tray: Tray;
  constructor(tray: Tray) {
    this.tray = tray;
    this.window = new BrowserWindow({
      resizable: false,
      skipTaskbar: true,
      maximizable: false,
      fullscreenable: false,
      frame: process.platform != 'darwin',
      movable: process.platform != 'darwin',
      show: false,
      width: 450,
      height: process.platform == 'darwin' ? 250 : 280,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: true
      }
    });
    this.window.loadURL(`file://${path.join(__dirname, 'index.html')}`);
    this.window.on('close', this.onClose.bind(this));
    this.window.setVisibleOnAllWorkspaces(true);
    this.window.setAlwaysOnTop(true, 'floating', 10);
  }

  onClose(event: Electron.Event) {
    if(!application.isQuiting) {
      event.preventDefault();
      this.window.hide();
    }
  }

  show() {
    if(process.platform == 'darwin') {
      const windowBounds = this.window.getBounds();
      const trayBounds = this.tray.getBounds();
      const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
      const y = Math.round(trayBounds.y + trayBounds.height);
      this.window.setPosition(x, y, false);
    }
    else {
      this.window.setMenu(null);
    }
    this.window.show();
  }

  isVisible() : boolean {
    return this.window.isVisible();
  }
}

export default Main;
