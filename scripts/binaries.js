const fs = require('fs');
const path = require('path')

fs.copyFile(
  path.join(__dirname, '../node_modules/screenshot-desktop/lib/win32/screenCapture_1.3.2.bat'),
  path.join(__dirname, '../build/screenCapture_1.3.2.bat'),
(err) => {
  if(err) {
    console.log(err);
  }
});

fs.copyFile(
  path.join(__dirname, '../node_modules/screenshot-desktop/lib/win32/app.manifest'),
  path.join(__dirname, '../build/app.manifest'),
(err) => {
  if(err) {
    console.log(err);
  }
});
