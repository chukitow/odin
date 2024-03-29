import path from 'path';
import { BrowserWindow, screen } from 'electron';
import querystring from 'querystring';

class Cropper {
  public window: BrowserWindow;
  constructor(params) {
    const cursor = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint({ x: cursor.x, y: cursor.y });
    const { bounds } = currentDisplay;
    const { x, y, width, height } = bounds;
    this.window = new BrowserWindow({
      x,
      y,
      width,
      height,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      frame: false,
      movable: false,
      show: false,
      enableLargerThanScreen: true,
      transparent: true,
      focusable: false,
      webPreferences: {
        nodeIntegration: true
      }
    });

    const query = querystring.stringify({ screen: 'cropper', ...params});
    this.window.loadURL(`file://${path.join(__dirname, 'index.html')}?${query}`);
    this.window.setVisibleOnAllWorkspaces(true);
    this.window.setAlwaysOnTop(true, 'screen-saver', 1);
    this.show();
  }

  show() {
    this.window.show();
  }
}

export default Cropper;
