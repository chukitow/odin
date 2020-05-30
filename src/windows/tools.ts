import path from 'path';
import { BrowserWindow, screen } from 'electron';

class Tools {
  public window: BrowserWindow;
  constructor() {
    this.window = new BrowserWindow({
      resizable: false,
      skipTaskbar: true,
      maximizable: false,
      fullscreenable: false,
      frame: false,
      movable: false,
      show: false,
      width: 40,
      height: 200,
      transparent: true,
      alwaysOnTop: true,
      focusable: false,
      webPreferences: {
        nodeIntegration: true
      }
    });

    this.window.loadURL(`file://${path.join(__dirname, 'index.html')}?screen=tools`);
    this.window.setVisibleOnAllWorkspaces(true);
  }

  show() {
    const {x, y} = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint({ x, y });
    this.window.setPosition(
      currentDisplay.workArea.x,
      currentDisplay.workArea.y + Math.round(currentDisplay.workArea.height / 2),
      false
    );
    this.window.setAlwaysOnTop(true, 'screen-saver', 10);
    this.window.showInactive();
  }
}

export default Tools;
