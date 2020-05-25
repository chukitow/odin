import React from 'react';
import featuresImage from '@app/assets/images/features.gif';

interface Props {
  next: () => void,
};

const Features : React.FC<Props> = ({
  next
}) => {
  return (
    <div className="features-step">
      <img src={featuresImage} alt="features" />
      <h3 className="content">Capture the content that matters most with three different recording options</h3>
      <button
        onClick={next}
        className="button is-danger is-medium action-button">
        Next
        </button>
    </div>
  );
}

export default Features;
