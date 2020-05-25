import { useEffect, useState } from 'react';
import log from 'electron-log';

interface Device {
  deviceId: string,
  groupId: string,
  kind: string,
  label: string,
}

const useMediaDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);

  const refreshDevices = () => {
    navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
      setDevices(devices.map(device => ({
        deviceId: device.deviceId,
        groupId: device.groupId,
        kind: device.kind,
        label: device.label,
      })))
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
