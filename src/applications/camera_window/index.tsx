import React, { useRef, useEffect } from 'react';
import './styles.scss';
import querystring from 'querystring';

const CameraWindow : React.FC = () => {
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
      video.current.srcObject = stream;
      video.current.play();
    });

  }, []);

  return (
    <div className="camera-window">
      <video ref={video}></video>
    </div>
  );
}

export default CameraWindow;
