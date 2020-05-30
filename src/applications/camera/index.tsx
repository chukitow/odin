import React, { useRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import querystring from 'querystring';
import { ipcRenderer } from 'electron';
import Draggable from 'react-draggable';
import './styles.scss';

const Camera : React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const camera = useRef(null);
  const params = querystring.parse(window.location.search.slice(1));
  const video = useRef(null);

  useEffect(() => {
    const constraints = {
      audio: false,
      video: {
        width: 200,
        height: 200,
        deviceId: params.deviceId ? { exact: params.deviceId } : undefined
      }
    }

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      setLoading(false);
      video.current.srcObject = stream;
      video.current.play();
    });

  }, [
    setLoading
  ]);

  useEffect(() => {
    window.document.addEventListener('click', (event: any) => {
      if(!event.target.id) {
        ipcRenderer.send('BLUR');
      }
    });
  }, []);

  return (
    <Draggable>
      <div
        ref={camera}
        className="camera-window"
        id="camera">
        {
          loading &&
          <FontAwesomeIcon icon="spinner" size="3x" id="spinner" spin/>
        }
        {
          !loading &&
          <video ref={video} id="video"></video>
        }
      </div>
    </Draggable>
  );
}

export default Camera;
