import React, { useState } from 'react';
import { ipcRenderer } from 'electron';
import Intro from './steps/intro';
import Features from './steps/features';
import Microphone from './steps/microphone';
import Camera from './steps/camera';
import Accesibility from './steps/accesibility';
import './styles.scss';

const INTRO = 'INTRO';
const FEATURES = 'FEATURES';
const MICRIPHONE = 'MICRIPHONE';
const CAMERA = 'CAMERA';
const ACCESSIBILITY = 'ACCESSIBILITY';

const QuickStart : React.FC = () => {
  const [step, setStep] = useState<string>(INTRO);

  const props = {
    [INTRO]: {
      next: () => setStep(FEATURES),
    },
    [FEATURES]: {
      next: () => setStep(MICRIPHONE),
    },
    [MICRIPHONE]: {
      next: () => setStep(CAMERA),
    },
    [CAMERA]: {
      next: () => setStep(ACCESSIBILITY),
    },
    [ACCESSIBILITY]: {
      next: () =>  {
        ipcRenderer.send('FINISH_QUICK_START');
      },
    },
  }
  const steps = {
    [INTRO]: () => <Intro {...props[step]}/>,
    [FEATURES]: () => <Features {...props[step]}/>,
    [MICRIPHONE]: () => <Microphone {...props[step]}/>,
    [CAMERA]: () => <Camera {...props[step]}/>,
    [ACCESSIBILITY]: () => <Accesibility {...props[step]}/>,
  };

  return (
    <div className="quick-start">
      {steps[step]()}
    </div>
  );
}

export default QuickStart;
