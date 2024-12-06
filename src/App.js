import React, { useState, useEffect, useMemo, useContext } from 'react';
import './App.css';
import waferClosed from './images/wafer1.webp';
import waferOpened from './images/wafer2.webp';
import stickersData from './stickersData';
import CollectionBook from './CollectionBook';
import openSound from './sounds/wafer-open.mp3';
import revealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';
import { StickerProvider, StickerContext } from './StickerContext';

function playSound(audio) {
  if (audio && audio.paused) {
    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.error('Audio playback failed:', error);
    });
  }
}

const AppContent = () => {
  const [isOpened, setIsOpened] = useState(false);
  const [todayStickers, setTodayStickers] = useState([]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [page, setPage] = useState('main');
  const [currentWaferImage, setCurrentWaferImage] = useState(waferClosed);

  const { addSticker } = useContext(StickerContext);

  const openAudio = useMemo(() => new Audio(openSound), []);
  const revealAudio = useMemo(() => new Audio(revealSound), []);
  const viewStickersAudio = useMemo(() => new Audio(viewStickersSound), []);

  useEffect(() => {
    const handleFirstTap = () => {
      [openAudio, revealAudio, viewStickersAudio].forEach((audio) => {
        audio.play().catch(() => {});
        audio.pause();
        audio.currentTime = 0;
      });
      document.removeEventListener('touchstart', handleFirstTap);
    };
    document.addEventListener('touchstart', handleFirstTap);
    return () => document.removeEventListener('touchstart', handleFirstTap);
  }, [openAudio, revealAudio, viewStickersAudio]);

  const openWafer = () => {
    if (isOpened) return;
    playSound(openAudio);
    setIsOpened(true);
    setCurrentWaferImage(waferOpened);

    const newSticker = stickersData[Math.floor(Math.random() * stickersData.length)];

    addSticker(newSticker);
    setTodayStickers((prev) => [...prev, newSticker]);

    setTimeout(() => {
      setIsOpened(false);
      setSelectedSticker(newSticker);
      playSound(revealAudio);
      setTimeout(() => setCurrentWaferImage(waferClosed), 1000);
    }, 1500);
  };

  return (
    <div className="app">
      {page === 'main' && (
        <div className="main-container">
          <h1 className="title">Today&apos;s Wafer</h1>
          <button
            className="wafer-button"
            onClick={openWafer}
            type="button"
            aria-label="Open Wafer"
          >
            <img src={currentWaferImage} alt="Wafer" className="wafer-image" />
          </button>
          <button
            onClick={() => {
              playSound(viewStickersAudio);
              setPage('collection');
            }}
            className="button collection-book-button"
            type="button"
          >
            CollectionBook
          </button>
          <div className="collected-stickers">
            {todayStickers.map((sticker) => (
              <button
                key={sticker.image}
                className="sticker-item"
                onClick={() => {
                  setSelectedSticker(sticker);
                  playSound(revealAudio);
                }}
                type="button"
              >
                <img src={sticker.image} alt="Sticker" className="sticker-small" />
                {sticker.isNew && <div className="new-badge">NEW</div>}
              </button>
            ))}
          </div>
        </div>
      )}
      {page === 'collection' && <CollectionBook goBack={() => setPage('main')} />}
      {selectedSticker && (
        <div className="popup">
          <div className="popup-content">
            <img src={selectedSticker.image} alt="Selected Sticker" className="sticker-large" />
            <button
              onClick={() => setSelectedSticker(null)}
              className="close-popup-button"
              type="button"
            >
              Close
            </button>
            {selectedSticker.isNew && <div className="popup-new-badge">NEW</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => (
  <StickerProvider>
    <AppContent />
  </StickerProvider>
);

export default App;
