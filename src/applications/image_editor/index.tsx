import React, { useEffect, useRef, useState } from 'react';
import { ipcRenderer, remote, shell } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import jimp from 'jimp';
import { writeFile } from 'fs';
import { uniqueId } from 'lodash';
import path from 'path';
import log from 'electron-log';
import './styles.scss';

const ImageEditor : React.FC = () => {
  const imgPreview = useRef(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    ipcRenderer.on('DID_MOUNT', async (_, data) => {
      try {
        const image = await jimp.read(data.path);
        const { x, y } = remote.getCurrentWindow().getBounds();
        const activeDisplay = remote.screen.getDisplayNearestPoint({ x, y });
        const { width, height } = activeDisplay.bounds;
        image
        .resize(width, height)
        .crop(data.x, data.y, data.width, data.height);
        const base64 = await new Promise((resolve, reject) => {
          image.getBase64('image/png', (err, base64) => {
            if(err) {
              reject(err);
            }
            else {
              resolve(base64);
            }
          });
        });
        imgPreview.current.src = base64;
        setLoading(false);
      } catch(err) {
        log.warn(err.message);
      }
    });
  }, [
    setLoading
  ]);

  const save = async () => {
    const { filePath } = await remote.dialog.showSaveDialog({
      buttonLabel: 'Save',
      defaultPath: `Screenshot-${Date.now()}.png`,
    });

    if(!filePath) {
      return;
    }

    const srcBase64 = imgPreview.current.src.replace(/^data:image\/png;base64,/, "");

    writeFile(filePath, srcBase64, 'base64', (err) => {
      if(err) {
        return;
      }

      const id = uniqueId()
      const notification = {
        id,
        title: 'Screenshot saved',
        body: 'Click here to open',
      }

      ipcRenderer.send('NOTIFICATION', notification);
      ipcRenderer.on(`NOTIFICATION:click:${id}`, () => {
        shell.openItem(path.dirname(filePath));
      });
    });
  }

  return (
    <div className="image-editor-window">
      <div className="editor">
        <div className="panes">
        </div>
        <div className="preview">
          {
            loading &&
            <FontAwesomeIcon icon="spinner" size="3x" id="spinner" spin/>
          }
          <img ref={imgPreview} style={{ display: loading ? 'none' : 'block' }}/>
        </div>
      </div>
      <div className="toolbar">
        <button
          onClick={save}
          className="button">Save</button>
      </div>
    </div>
  );
}

export default ImageEditor;
