import { useEffect, useState } from 'react';

interface Device {
  deviceId: string,
  groupId: string,
  kind: string,
  label: string,
}

const useMediaDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
      setDevices(devices.map(device => ({
        deviceId: device.deviceId,
        groupId: device.groupId,
        kind: device.kind,
        label: device.label,
      })))
    })
    .catch(function() {
    })
  }, [])

  return [devices];
}

export default useMediaDevices;
