import { app, Tray, Menu } from 'electron';
import * as path from 'path';
let tray: Tray;

app.on('ready', createWindow);

function createWindow() : void {
  tray = new Tray(path.join(__dirname, './assets/icons/tray.png'));

  tray.on('right-click', () => {
    const menu = [
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          app.quit();
        }
      }
    ];

    tray.popUpContextMenu(Menu.buildFromTemplate(menu));
  });
}
