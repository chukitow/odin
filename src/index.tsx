import '@app/config/icons';
import React from 'react';
import ReactDOM from 'react-dom';
import Main from '@app/applications/main';
import Camera  from '@app/applications/camera';
import Preview from '@app/applications/preview';
import Tools from '@app/applications/tools';
import QuickStart from '@app/applications/quick_start';
import Canvas from '@app/applications/canvas';
import Counter from '@app/applications/counter';
import 'bulma/css/bulma.css'
import '@app/assets/styles/main.scss';
import querystring from 'querystring';
let RootComponet: any;

const params = querystring.parse(window.location.search.slice(1));

switch(params.screen) {
  case 'camera':
    RootComponet = Camera;
    break;
  case 'preview':
    RootComponet = Preview;
    break;
  case 'tools':
    RootComponet = Tools;
    break;
  case 'quick_start':
    RootComponet = QuickStart;
    break;
  case 'canvas':
    RootComponet = Canvas;
    break;
  case 'counter':
    RootComponet = Counter;
    break;
  default:
    RootComponet = Main;
    break;
}

ReactDOM.render(<RootComponet/>, document.getElementById('app'));
