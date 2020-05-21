import path from 'path'
import { BrowserWindow } from 'electron';

class PreviewWindow {
  public window: BrowserWindow;
  constructor() {
    this.window = new BrowserWindow({
      skipTaskbar: true,
      resizable: true,
      show: false,
      minWidth: 900,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: true
      }
    });

    this.window.loadURL(`file://${path.join(__dirname, 'index.html')}?screen=preview`);
  }

  show() {
    this.window.show();
  }

  close() {
    this.window.close();
  }

  isVisible() : boolean {
    return this.window.isVisible();
  }
}

export default PreviewWindow;
