import React, { useEffect, useState } from 'react';
import { ipcRenderer, remote } from 'electron';
import log from 'electron-log';
import './styles.scss';

const PreviewWindow : React.FC = () => {
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
    const { filePath } = await remote.dialog.showSaveDialog({
      buttonLabel: 'Save Screen Recording',
      defaultPath: `Screen-Recording-${Date.now()}.${format}`
    });

    const data = {
      filePath,
      src,
      format,
    };

    setConverting(true);
    ipcRenderer.send('EXPORT', data);
  };

  return (
    <div className="preview-window">
      {
        src &&
        <video src={src} controls autoPlay/>
      }
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

export default PreviewWindow;
