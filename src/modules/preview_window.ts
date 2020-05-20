import { BrowserWindow, app } from 'electron';

class PreviewWindow {
  public window: BrowserWindow;
  constructor() {
    this.window = new BrowserWindow({
      skipTaskbar: true,
      resizable: false,
      show: false,
      width: 900,
      height: 600,
      webPreferences: {
        nodeIntegration: true
      }
    });

    this.window.loadURL(`file://${app.getAppPath()}/index.html?screen=preview`);
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
