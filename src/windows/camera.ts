import path from 'path';
import { BrowserWindow, screen } from 'electron';
import querystring from 'querystring';

interface Params {
  deviceId: string,
}

class Camera {
  public window: BrowserWindow;
  constructor(params: Params) {
    const cursor = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint({ x: cursor.x, y: cursor.y });
    const { width, height, x, y } = currentDisplay.bounds;
    this.window = new BrowserWindow({
      width,
      height,
      x,
      y,
      resizable: false,
      skipTaskbar: true,
      maximizable: false,
      fullscreenable: false,
      frame: false,
      movable: true,
      show: false,
      transparent: true,
      alwaysOnTop: true,
      focusable: false,
      webPreferences: {
        nodeIntegration: true
      }
    });

    const query = querystring.stringify({ screen: 'camera', ...params});
    this.window.loadURL(`file://${path.join(__dirname, 'index.html')}?${query}`);
    this.window.setAlwaysOnTop(true, 'floating', 9);
    this.window.setVisibleOnAllWorkspaces(true);
    this.show();
  }

  close() {
    this.window.close();
  }

  show() {
    this.window.setIgnoreMouseEvents(false);
    this.window.showInactive();
  }
}

export default Camera;
