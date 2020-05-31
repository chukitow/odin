import { useEffect, useState } from 'react';
import log from 'electron-log';
import apreture from 'aperture';

interface Device {
  deviceId: string,
  kind: string,
  label: string,
}

const useMediaDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const recorder = apreture();

  const refreshDevices = () => {
    navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
      const mediaDevices = devices.map(device => ({
        deviceId: device.deviceId,
        kind: device.kind,
        label: device.label,
      }))

      if(process.platform == 'darwin') {
        apreture.audioDevices().then((devices) => {
          const microphones = devices.map(device => ({
            deviceId: device.id,
            kind: 'audioinput',
            label: device.name,
          }))

          setDevices(
            mediaDevices
              .filter(device => device.kind !== 'audioinput')
              .concat(microphones)
          );
        });
      }
      else {
        setDevices(mediaDevices);
      }
    })
    .catch(err => {
      log.warn(err.message);
    })
  }

  useEffect(() => {
    refreshDevices();
  }, [])

  useEffect(() => {
    navigator.mediaDevices.addEventListener('devicechange', refreshDevices);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', refreshDevices);
    }
  }, [])

  return [devices];
}

export default useMediaDevices;
