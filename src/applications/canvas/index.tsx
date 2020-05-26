import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ipcRenderer, remote } from 'electron';
import cx from 'classnames';
import './styles.scss';

const PALETTE = [
  '#29292B',
  '#FFFFFF',
  '#516BF0',
  '#17AEFF',
  '#29E484',
  '#FEC350',
  '#FD5E5F'
]

const Canvas : React.FC = () => {
  const canvas = useRef(null)
  const [color, setColor] = useState<string>('#FD5E5F');

  const closeCanvas = () => {
    ipcRenderer.send('CLOSE_CANVAS');
  }

  useEffect(() => {
    let painting = false;
    const ctx : CanvasRenderingContext2D = canvas.current.getContext('2d');
    const { width, height } = remote.screen.getPrimaryDisplay().workAreaSize;
    canvas.current.width = width
    canvas.current.height = height;

    const startPainting = (e: MouseEvent) => {
      painting = true;
      draw(e);
    };

    const finishPainting = () => {
      painting = false;
      ctx.beginPath();
    };

    const draw = (event : MouseEvent) => {
      if(!painting) return;

      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.strokeStyle = color;
      ctx.lineTo(event.clientX, event.clientY);
      ctx.stroke();
    }

    canvas.current.addEventListener('mousedown', startPainting);
    canvas.current.addEventListener('mouseup', finishPainting);
    canvas.current.addEventListener('mousemove', draw);

    return () => {
      canvas.current.removeEventListener('mousedown', startPainting);
      canvas.current.removeEventListener('mouseup', finishPainting);
      canvas.current.removeEventListener('mousemove', draw);
    }
  }, [
    color,
    canvas
  ]);

  return (
    <div className="canvas">
      <canvas id="canvas" ref={canvas} width="100%" height="100%"/>
      <div className="palette">
        <FontAwesomeIcon icon="paint-brush" />
        {PALETTE.map(palette => (
          <div
            key={palette}
            onClick={() => setColor(palette)}
            className={cx('color', { selected: palette === color})}
            style={{ backgroundColor: palette }} />
        ))}
        <div
          onClick={closeCanvas}
          className="done">
          Done
        </div>
      </div>
    </div>
  );
}

export default Canvas;
