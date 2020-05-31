import path from 'path';
import { BrowserWindow, screen } from 'electron';
import querystring from 'querystring';

class Tools {
  public window: BrowserWindow;
  constructor(params) {
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

    const query = querystring.stringify({...params, screen: 'tools'});
    this.window.loadURL(`file://${path.join(__dirname, 'index.html')}?${query}`);
    this.window.setVisibleOnAllWorkspaces(true);
    this.window.setAlwaysOnTop(true, 'screen-saver', 2);
  }

  show(params = { x: null, y: null }) {
    const {x, y} = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint({ x, y });
    const DEFAULT_X = currentDisplay.workArea.x;
    const DEFAULT_Y = currentDisplay.workArea.y + Math.round(currentDisplay.workArea.height / 2)
    this.window.setPosition(
      params.x || DEFAULT_X,
      params.y || DEFAULT_Y,
      false
    );
    this.window.showInactive();
  }
}

export default Tools;
