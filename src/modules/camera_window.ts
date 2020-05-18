import { BrowserWindow, app, screen } from 'electron';
import querystring from 'querystring';

interface Params {
  deviceId: string,
}

class CameraWindow {
  public window: BrowserWindow;
  constructor(params: Params) {
    this.window = new BrowserWindow({
      resizable: false,
      skipTaskbar: true,
      maximizable: false,
      fullscreenable: false,
      frame: false,
      movable: false,
      show: false,
      width: 200,
      height: 200,
      transparent: true,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: true
      }
    });

    const query = querystring.stringify({ screen: 'camera', ...params});
    this.window.loadURL(`file://${app.getAppPath()}/index.html?${query}`);
    this.show();
  }

  close() {
    this.window.close();
  }

  show() {
    let display = screen.getPrimaryDisplay();
    let height = display.bounds.height;
    this.window.setPosition(0, height - 200, false);
    this.window.showInactive();
  }
}

export default CameraWindow;
