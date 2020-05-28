import React, { useState, useEffect, useRef } from 'react';
import { remote, ipcRenderer } from 'electron';
import { isEqual, isEmpty } from 'lodash';
import cx from 'classnames';
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

  const bounds = remote.getCurrentWindow().getBounds();

  useEffect(() => {
    let rect : Rect = {};

    const startPainting = (e: MouseEvent) => {
      rect = { width: 0, height: 0};
      rect.startX = e.pageX - canvas.current.offsetLeft;
      rect.startY = e.pageY - canvas.current.offsetTop;
      dragging  = true;
      setReady(false);
      ipcRenderer.send('CLOSE_CAMERA');
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
        ipcRenderer.send('DISPLAY_CAMERA', {
          positions: {
            x,
            y: y + (Math.abs(rect.height) - CAMERA_HEIGHT),
          },
        });
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

    canvas.current.addEventListener('mousedown', startPainting);
    canvas.current.addEventListener('mouseup', finishPainting);
    canvas.current.addEventListener('mousemove', draw);

    return () => {
    canvas.current.removeEventListener('mousedown', startPainting);
    canvas.current.removeEventListener('mouseup', finishPainting);
    canvas.current.removeEventListener('mousemove', draw);
    }
  }, []);

  const firstDrag = isEqual(DEFAULT_RECT, frame);

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
                  ready &&
                  <button className="button is-danger is-large">Start Recording</button>
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
