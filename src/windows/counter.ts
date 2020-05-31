import path from 'path';
import { BrowserWindow, screen } from 'electron';

class Counter {
  public window: BrowserWindow;
  constructor(params) {
    const cursor = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint({ x: cursor.x, y: cursor.y });
    const { x, y, width, height } = currentDisplay.bounds
    this.window = new BrowserWindow({
      x: params.x || x,
      y: params.y || y,
      width: params.width || width,
      height: params.height || height,
      resizable: false,
      skipTaskbar: true,
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

    this.window.loadURL(`file://${path.join(__dirname, 'index.html')}?screen=counter`);
    this.window.setVisibleOnAllWorkspaces(true);
    this.window.setAlwaysOnTop(true, 'screen-saver',  1);
    this.show();
  }

  show() {
    this.window.show();
  }
}

export default Counter;
