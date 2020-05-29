import path from 'path';
import { BrowserWindow, screen } from 'electron';

class Preview {
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
    const {x, y} = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint({ x, y });
    this.window.setPosition(
      currentDisplay.workArea.x,
      currentDisplay.workArea.y,
      false
    );
    this.window.center();
    this.window.show();
  }

  close() {
    this.window.close();
  }

  isVisible() : boolean {
    return this.window.isVisible();
  }
}

export default Preview;
