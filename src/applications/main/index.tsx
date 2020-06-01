import React, { useState, useEffect } from 'react';
import { ipcRenderer, remote } from 'electron';
import useMediaDevices from '@app/hooks/useMediaDevices';
import useRecorder from '@app/hooks/useRecorder';
import { isEmpty, head } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import cx from 'classnames';
import './styles.scss';

export const SCREEN_CAM = 'SCREEN_CAM';
export const SCREEN = 'SCREEN';
export const CAM = 'CAM';

const Main : React.FC = () => {
  const [mode, setMode] = useState<string>(SCREEN_CAM);
  const [camera, setCamera] = useState<string>('');
  const [microphone, setMicrophone] = useState<string>('');
  const [devices] = useMediaDevices();
  const [startRecording, stopRecording, takeScreenshot] = useRecorder({ microphone, camera, mode });
  const cameras = devices.filter(device => device.kind === 'videoinput');
  const microphones = devices.filter(device => device.kind === 'audioinput');

  const setScreenCam = () => {
    if(!isEmpty(cameras)) {
      setCamera(head(cameras).deviceId);
      setMode(SCREEN_CAM);
    }
  }

  const setScreenOnly = () => {
    setCamera('none');
    setMode(SCREEN);
  }

  const setCam = () => {
    if(!isEmpty(cameras)) {
      setCamera(head(cameras).deviceId);
      setMode(CAM);
    }
  }

  const openCropper = () => {
    ipcRenderer.send('OPEN_CROPPER', { screenshot: true });
  };

  useEffect(() => {
    if(!isEmpty(cameras) && camera == '') {
      setCamera(head(cameras).deviceId);
    }
    else if(camera === 'none' && [SCREEN_CAM, CAM].includes(mode)) {
      setMode(SCREEN);
    }
    else if(camera !== 'none' && mode === SCREEN) {
      setMode(SCREEN_CAM);
    }
  }, [
    cameras,
    camera,
    setCamera,
    mode
  ]);

  useEffect(() => {
    if(microphone == '' && !isEmpty(microphones)) {
      setMicrophone(head(microphones).deviceId)
    }
  }, [
    microphones,
    microphone,
    setMode
  ])

  useEffect(() => {
    const cameraIsNotEmpty = !isEmpty(camera) && camera !== 'none';
    ipcRenderer.on('DISPLAY_WINDOW', () => {
      if(cameraIsNotEmpty) {
        ipcRenderer.send('DISPLAY_CAMERA', { deviceId: camera });
      }
    });

    if(cameraIsNotEmpty && remote.getCurrentWindow().isVisible()) {
      ipcRenderer.send('DISPLAY_CAMERA', { deviceId: camera });
    }
    else {
      ipcRenderer.send('CLOSE_CAMERA');
    }

    return () => {
      ipcRenderer.removeAllListeners('DISPLAY_WINDOW');
    }
  }, [
    camera
  ]);

  useEffect(() => {
    ipcRenderer.on('STOP_RECORDING', () => {
      stopRecording();
      ipcRenderer.send('CLOSE_CAMERA');
    });

    ipcRenderer.on('START_RECORDING', () => {
      startRecording();
      ipcRenderer.send('START_RECORDING');
    });

    ipcRenderer.on('TAKE_SCREENSHOT', (_, data) => {
      takeScreenshot(data);
    });

    return () => {
      ipcRenderer.removeAllListeners('STOP_RECORDING');
      ipcRenderer.removeAllListeners('START_RECORDING');
      ipcRenderer.removeAllListeners('TAKE_SCREENSHOT');
    }
  }, [
    microphone,
    camera
  ]);

  return (
    <div className="main-window">
      <div className="mode-selector">
        <div
          onClick={setScreenCam}
          className={cx('mode', { active: mode == SCREEN_CAM })}>
          <div>
            <FontAwesomeIcon icon="desktop" />
            <FontAwesomeIcon icon="user-circle" />
          </div>
          Screen + Cam
        </div>
        <div
          onClick={setScreenOnly}
          className={cx('mode', { active: mode == SCREEN })}>
          <div>
            <FontAwesomeIcon icon="desktop" />
          </div>
          Screen Only
        </div>
        <div
          onClick={setCam}
          className={cx('mode', { active: mode == CAM })}>
          <div>
            <FontAwesomeIcon icon="user-circle" />
          </div>
          Cam Only
        </div>
        <div
          onClick={openCropper}
          className="mode beta">
          <div>
            <FontAwesomeIcon icon="image" />
          </div>
          Screenshot
        </div>
      </div>

      <div className="input-sources">
        <div className="field has-addons">
          <p className="control">
            <a className="button">
              <FontAwesomeIcon icon="camera" />
            </a>
          </p>
          <div className="control is-expanded">
            <div className="select is-fullwidth">
              <select
                value={camera}
                onChange={(event:  React.ChangeEvent<HTMLSelectElement> ) => setCamera(event.target.value )}
                name="camera-input">
                <option value="none">None</option>
                {
                  cameras.map(camera => (
                    <option key={camera.deviceId}  value={camera.deviceId}>{camera.label}</option>
                  ))
                }
              </select>
            </div>
          </div>
        </div>
        <div className="field has-addons">
          <p className="control">
            <a className="button">
              <FontAwesomeIcon icon="microphone" />
            </a>
          </p>
          <div className="control is-expanded">
            <div className="select is-fullwidth">
              <select
                value={microphone}
                onChange={(event:  React.ChangeEvent<HTMLSelectElement> ) => setMicrophone(event.target.value )}
                name="camera-input">
                <option value="none">None</option>
                {
                  microphones.map(microphone=> (
                    <option key={microphone.deviceId} value={microphone.deviceId}>{microphone.label}</option>
                  ))
                }
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="recording-actions">
        <button
          onClick={() => {
            ipcRenderer.send('START_COUNTER');
          }}
          className="button is-large is-fullwidth is-danger">
          Start Recording
        </button>
      </div>
    </div>
  )
}

export default Main;
