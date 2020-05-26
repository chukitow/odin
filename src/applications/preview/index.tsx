import React, { useEffect, useState } from 'react';
import { ipcRenderer, remote } from 'electron';
import log from 'electron-log';
import './styles.scss';

const Preview : React.FC = () => {
  const [src, setSrc] = useState<string>();
  const [format, setFormat] = useState<string>('mp4');
  const [converting, setConverting] = useState<boolean>(false);

  useEffect(() => {
    ipcRenderer.on('DID_MOUNT', (_, data) => {
      log.info('DID_MOUNT', data);
      setSrc(data.filePath);
    });

    ipcRenderer.on('conversion:end', () => {
      setConverting(false);
    })

    return () => {
      ipcRenderer.removeAllListeners('DID_MOUNT');
    }
  }, [
    setSrc,
    setConverting
  ]);

  const exportFile = async () => {
    try {
      const { filePath } = await remote.dialog.showSaveDialog({
        buttonLabel: 'Save',
        defaultPath: `Screen-Recording-${Date.now()}.${format}`,
      });


      if(!filePath) {
        return;
      }

      const data = {
        filePath,
        src,
        format,
      };

      setConverting(true);
      ipcRenderer.send('EXPORT', data);
    } catch(err) {
    }
  };

  return (
    <div className="preview-window">
      <div className="video-container">
        {
          src &&
          <video src={src} controls autoPlay/>
        }
      </div>
      <div className="tool-bar">
        {
          converting &&
          <progress className="progress is-small is-primary" max="100" />
        }
        {
          !converting &&
          <>
            <div className="select">
              <select
                onChange={(e) => setFormat(e.target.value) }
                defaultValue={format}>
                <option value="mp4">MP4</option>
                <option value="webm">WEBM</option>
                <option value="gif">GIF</option>
              </select>
            </div>
            <button
              onClick={exportFile}
              className="button export-button">
              Export
            </button>
          </>
        }
      </div>
    </div>
  )
}

export default Preview;
