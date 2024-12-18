import React, { useState } from 'react';
import './WaferPage.css';
import waferOpenSound from '../sounds/wafer-open.mp3';

const WaferPage = ({ onCollectionBookOpen, stickers }) => {
  const [selectedSticker, setSelectedSticker] = useState(null);

  const handleWaferOpen = () => {
    // 音声の再生
    const audio = new Audio(waferOpenSound);
    audio.play().catch((err) => console.error('Audio playback failed:', err));

    // シールの選択
    const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
    setSelectedSticker(randomSticker);
  };

  return (
    <div className="wafer-page">
      <h1>Today&apos;s Wafer</h1>
      <div className="button-container">
        <button onClick={handleWaferOpen} type="button" className="wafer-button">
          Open a Wafer
        </button>
        <button onClick={onCollectionBookOpen} type="button" className="wafer-button">
          Collection Book
        </button>
      </div>

      {selectedSticker && (
        <div className="sticker-modal" role="dialog">
          <div className="modal-content">
            <img src={selectedSticker.image} alt="Sticker" className="modal-sticker-image" />
            <button className="close-button" onClick={() => setSelectedSticker(null)} type="button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaferPage;
