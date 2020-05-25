import React from 'react';
import logo from '@app/assets/images/logo.svg';

interface Props {
  next: () => void,
};

const Intro : React.FC<Props> = ({
  next
}) => {
  return (
    <div className="intro-step">
      <img className="logo" src={logo} alt="logo" width="200"/>
      <h2 className="title">Odin</h2>
      <h3 className="subtitle">An open-source screen recorder</h3>

      <button
        onClick={next}
        className="button is-danger is-medium action-button">
        Next
        </button>
    </div>
  );
}

export default Intro;
