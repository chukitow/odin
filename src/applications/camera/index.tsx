import React, { useRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import querystring from 'querystring';
import './styles.scss';

const Camera : React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
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

  return (
    <div className="camera-window">
      {
        loading &&
        <FontAwesomeIcon icon="spinner" size="3x" spin/>
      }
      {
        !loading &&
        <video ref={video}></video>
      }
    </div>
  );
}

export default Camera;
