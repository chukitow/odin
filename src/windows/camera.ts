import path from 'path';
import { BrowserWindow, screen } from 'electron';
import querystring from 'querystring';

interface Params {
  deviceId: string,
}

class Camera {
  public window: BrowserWindow;
  constructor(params: Params) {
    this.window = new BrowserWindow({
      resizable: false,
      skipTaskbar: true,
      maximizable: false,
      fullscreenable: false,
      frame: false,
      movable: true,
      show: false,
      width: 200,
      height: 200,
      transparent: true,
      alwaysOnTop: true,
      focusable: false,
      webPreferences: {
        nodeIntegration: true
      }
    });

    const query = querystring.stringify({ screen: 'camera', ...params});
    this.window.loadURL(`file://${path.join(__dirname, 'index.html')}?${query}`);
    this.window.setVisibleOnAllWorkspaces(true);
    this.show(params);
  }

  close() {
    this.window.close();
  }

  show(params) {
    const {x, y} = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint({ x, y });
    const DEFAULT_X = currentDisplay.workArea.x;
    const DEFAULT_Y = currentDisplay.workArea.y + currentDisplay.workArea.height - 240;
    this.window.setPosition(
      params.x || DEFAULT_X,
      params.y || DEFAULT_Y,
      false
    );
    this.window.showInactive();
  }
}

export default Camera;
