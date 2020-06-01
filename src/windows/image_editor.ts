import path from 'path';
import { BrowserWindow, screen } from 'electron';
import querystring from 'querystring';

class ImageEditor {
  public window: BrowserWindow;
  constructor(params) {
    this.window = new BrowserWindow({
      show: false,
      minWidth: 900,
      minHeight: 900,
      movable: true,
      webPreferences: {
        nodeIntegration: true
      }
    });

    const query = querystring.stringify({ screen: 'image_editor', ...params});
    this.window.loadURL(`file://${path.join(__dirname, 'index.html')}?${query}`);
    this.window.setMenu(null);
  }

  show() {
    const {x, y} = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint({ x, y });
    this.window.setPosition(
      currentDisplay.workArea.x,
      currentDisplay.workArea.y,
      false
    );
    this.window.center();
    this.window.show();
    this.window.setTitle('Screenshot Editor');
    this.window.webContents.openDevTools();
  }

  close() {
    this.window.close();
  }
}

export default ImageEditor;
