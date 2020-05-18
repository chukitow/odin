import React, { useState, useEffect } from 'react';
import { ipcRenderer, remote } from 'electron';
import useMediaDevices from '@app/hooks/useMediaDevices';
import useRecorder from '@app/hooks/useRecorder';
import { isEmpty, head } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import cx from 'classnames';
import './styles.scss';

const SCREEN_CAM = 'SCREEN_CAM';
const SCREEN = 'SCREEN';

const MainWindow : React.FC = () => {
  const [mode, setMode] = useState<string>(SCREEN_CAM);
  const [camera, setCamera] = useState<string>('');
  const [microphone, setMicrophone] = useState<string>('');
  const [devices] = useMediaDevices();
  const [startRecording, stopRecording] = useRecorder(microphone);
  const cameras = devices.filter(device => device.kind === 'videoinput');
  const microphones = devices.filter(device => device.kind === 'audioinput');

  useEffect(() => {
    if(isEmpty(cameras) || camera === 'none') {
      setMode(SCREEN);
    }
    else if(camera === ''){
      setCamera(head(cameras).deviceId);
      setMode(SCREEN_CAM);
    }
    else if(camera == 'none' || camera == '') {
      setMode(SCREEN);
    }
    else {
      setMode(SCREEN_CAM);
    }
  }, [
    cameras,
    camera,
    setMode
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
  }, []);

  return (
    <div className="main-window">
      <div className="mode-selector">
        <div
          onClick={() => {
            if(!isEmpty(cameras)) {
              setCamera(head(cameras).deviceId);
            }
          }}
          className={cx('mode', { active: mode == SCREEN_CAM })}>
          <div>
            <FontAwesomeIcon icon="desktop" />
            <FontAwesomeIcon icon="user-circle" />
          </div>
          Screen + Cam
        </div>
        <div
          onClick={() => {
            setCamera('none');
          }}
          className={cx('mode', { active: mode == SCREEN })}>
          <div>
            <FontAwesomeIcon icon="desktop" />
          </div>
          Screen Only
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
            ipcRenderer.send('START_RECORDING');
            remote.getCurrentWindow().hide();
            startRecording();
          }}
          className="button is-large is-fullwidth is-danger">
          Start Recording
        </button>
      </div>
    </div>
  )
}

export default MainWindow;
