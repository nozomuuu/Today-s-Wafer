import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import wafer2 from './images/stickers/wafer2.webp';

const Wafer = ({ addSticker }) => {
  const [waferOpened, setWaferOpened] = useState(false);
  const navigate = useNavigate();

  const handleOpenWafer = () => {
    if (!waferOpened) {
      setWaferOpened(true);
      const newSticker = { image: wafer2, isNew: true };
      addSticker(newSticker);
    }
  };

  return (
    <div className="wafer-screen">
      <h1>Today&apos;s Wafer</h1>
      <div className="wafer-container">
        {waferOpened ? (
          <img src={wafer2} alt="Opened Wafer" className="wafer-image" role="presentation" />
        ) : (
          <button
            onClick={handleOpenWafer}
            type="button"
            aria-label="Open the Wafer"
            className="wafer-open-button"
          >
            Open a Wafer
          </button>
        )}
      </div>
      <button
        onClick={() => navigate('/collectionbook')}
        type="button"
        className="wafer-navigation-button"
        aria-label="Go to Collection Book"
      >
        Collection Book
      </button>
    </div>
  );
};

export default Wafer;
