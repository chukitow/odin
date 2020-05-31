import React, { useState, useEffect, useRef } from 'react';
import { remote, ipcRenderer } from 'electron';
import { isEqual } from 'lodash';
import cx from 'classnames';
import querystring from 'querystring';
import './styles.scss';

interface Rect {
  startX?: number,
  startY?: number,
  width?: number,
  height?: number,
};

const CAMERA_HEIGHT = 200;

const Cropper: React.FC = () => {
  let dragging = false;
  const DEFAULT_RECT = {
    startX: 0,
    startY: 0,
    width: 0,
    height: 0
  };
  const canvas = useRef(null);
  const [frame, setFrame] = useState<Rect>({...DEFAULT_RECT});
  const [ready, setReady] = useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const params = querystring.parse(window.location.search.slice(1));

  const bounds = remote.getCurrentWindow().getBounds();

  useEffect(() => {
    let rect : Rect = {};

    const startPainting = (e: MouseEvent) => {
      e.preventDefault();
      rect = { width: 0, height: 0};
      rect.startX = e.pageX - canvas.current.offsetLeft;
      rect.startY = e.pageY - canvas.current.offsetTop;
      dragging  = true;
      setReady(false);
      ipcRenderer.send('CLOSE_CAMERA');
      ipcRenderer.send('CLOSE_TOOLS');
      setFrame(DEFAULT_RECT);
    };

    const getRectPoints = (rect: Rect) => {
      return {
        x: rect.width >= 0 ? rect.startX : rect.startX - Math.abs(rect.width),
        y: rect.height >= 0 ? rect.startY : rect.startY - Math.abs(rect.height),
      }
    }

    const finishPainting = () => {
      dragging  = false;
      if(Math.abs(rect.width) < CAMERA_HEIGHT || Math.abs(rect.height) < CAMERA_HEIGHT) {
        setFrame(DEFAULT_RECT);
      }
      else {
        setReady(true);
        const { x, y } = getRectPoints(rect);
        ipcRenderer.send('DISPLAY_TOOLS', {
          x,
          y,
        });
        ipcRenderer.send('DISPLAY_CAMERA', {
          deviceId: params.deviceId,
          x,
          y: y + (Math.abs(rect.height) - CAMERA_HEIGHT),
        });
        removeListeners();
      }
    };

    const draw = (event : MouseEvent) => {
      if(!dragging ) return;

      rect.width = (event.pageX - canvas.current.offsetLeft) - rect.startX;
      rect.height = (event.pageY - canvas.current.offsetTop) - rect.startY ;
      const { x, y } = getRectPoints(rect);
      setFrame({
        startX: x,
        startY: y,
        width: Math.abs(rect.width),
        height: Math.abs(rect.height)
      });
    }

    function removeListeners() {
      canvas.current.removeEventListener('mousedown', startPainting);
      canvas.current.removeEventListener('mouseup', finishPainting);
      canvas.current.removeEventListener('mousemove', draw);
    }

    canvas.current.addEventListener('mousedown', startPainting);
    canvas.current.addEventListener('mouseup', finishPainting);
    canvas.current.addEventListener('mousemove', draw);

    return () => {
      removeListeners();
    }
  }, []);

  const firstDrag = isEqual(DEFAULT_RECT, frame);

  const startRecording = () => {
    ipcRenderer.send('START_COUNTER', {
      x: frame.startX,
      y: frame.startY,
      width: frame.width,
      height: frame.height
    });
    setRecording(true);
  }

  return (
    <div className={cx('cropper', { 'first-drag': firstDrag })} ref={canvas}>
      {
        firstDrag &&
        <div className="drag-instructions">
          <strong>Drag</strong>&nbsp;to make a selection
        </div>
      }
      {
        !firstDrag &&
        <>
          <div
            style={{
              width: '100%',
              height: `${frame.startY}px`,
            }}
            className="top" />
          <div className="middle">
            <div
              style={{
                width: frame.startX,
              }}
              className="left" />
            <div
              style={{
                left: frame.startX,
                top: frame.startY,
                width: frame.width,
                height: frame.height
              }}
              className={cx('frame', { ready })}>
                {
                  ready && !recording &&
                  <button
                    onClick={startRecording}
                    className="button is-danger is-large">
                    Start Recording
                  </button>
                }
              </div>
            <div
              style={{
                width: `${bounds.width - frame.width - frame.startX}px`,
              }}
              className="right" />
          </div>
          <div
            style={{
              width: '100%',
              height: `${bounds.height - frame.height - frame.startY}px`,
            }}
            className="bottom" />
        </>
      }
    </div>
  );
}

export default Cropper;
