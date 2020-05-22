import path from 'path';
import { BrowserWindow, screen } from 'electron';

class ToolsWindow {
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
      height: 40,
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
    let display = screen.getPrimaryDisplay();
    let height = display.bounds.height;
    this.window.setPosition(0, height / 2, false);
    this.window.showInactive();
  }
}

export default ToolsWindow;
