import React, { useEffect, useRef, useState } from 'react';
import { ipcRenderer, remote, shell } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import jimp from 'jimp';
import { writeFile } from 'fs';
import { uniqueId } from 'lodash';
import path from 'path';
import log from 'electron-log';
import UIImageEditor from 'tui-image-editor';
import 'tui-image-editor/dist/tui-image-editor.min.css';
import './styles.scss';

const ImageEditor : React.FC = () => {
  const canvas = useRef(null);
  const editor = useRef(null);
  const [loading, setLoading] = useState(true);

  const save = async () => {
    const { filePath } = await remote.dialog.showSaveDialog({
      buttonLabel: 'Save',
      defaultPath: `Screenshot-${Date.now()}.png`,
    });

    if(!filePath) {
      return;
    }

    const srcBase64 = canvas.current.toDataURL().replace(/^data:image\/png;base64,/, "");

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

  const replaceUIElements = () => {
    document.querySelector('.tui-image-editor-header-logo').remove()
    const buttons = document.querySelector('.tui-image-editor-header-buttons');
    buttons.children[0].remove();
    buttons.children[0].remove();

    const downloadButton = document.createElement('button');
    downloadButton.classList.add('tui-image-editor-download-btn');
    downloadButton.textContent = 'Download';
    downloadButton.onclick = () => {
     save();
    }

    buttons.appendChild(downloadButton);
  };

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
        const base64 : string = await new Promise((resolve, reject) => {
          image.getBase64('image/png', (err, base64) => {
            if(err) {
              reject(err);
            }
            else {
              resolve(base64);
            }
          });
        });

        setLoading(false);
        canvas.current = new UIImageEditor(editor.current, {
          includeUI: {
            loadImage: {
              path: base64,
              name: 'SampleImage'
            },
            menu: ['shape', 'crop', 'draw', 'text'],
            menuBarPosition: 'bottom'
          },
          cssMaxWidth: 900,
          cssMaxHeight: 700,
         selectionStyle: {
           cornerSize: 20,
           rotatingPointOffset: 70
         }
       });

       replaceUIElements();
      } catch(err) {
        log.warn(err.message);
      }
    });
  }, [
    setLoading
  ]);

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
          <div ref={editor} />
        </div>
      </div>
    </div>
  );
}

export default ImageEditor;
