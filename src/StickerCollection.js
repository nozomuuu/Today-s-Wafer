import React, { useState, useEffect } from 'react';
import Sticker from './Sticker';
import './CollectionBook.css';
import stickerRevealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';

const StickerCollection = ({ ownedStickers, goBack }) => {
  const [cardIndexes, setCardIndexes] = useState([0, 1, 2]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [stickerSlots, setStickerSlots] = useState([]);

  const viewStickersAudio = new Audio(viewStickersSound);
  const revealAudio = new Audio(stickerRevealSound);

  const playSound = (audio) => {
    if (audio && audio.paused) {
      audio.currentTime = 0;
      audio.play().catch((error) => console.error('Audio playback failed:', error));
    }
  };

  useEffect(() => {
    const initializeStickers = () => {
      const slots = Array(72).fill({
        image: `${process.env.PUBLIC_URL}/images/stickers/wafer3.webp`
      });
      ownedStickers.forEach((sticker, idx) => {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * 72);
        } while (slots[randomIndex]?.id);
        slots[randomIndex] = { ...sticker, id: idx }; // Add unique ID
      });
      setStickerSlots(slots);
    };

    if (ownedStickers.length > 0) initializeStickers();
  }, [ownedStickers]);

  const cycleCards = (index) => {
    playSound(viewStickersAudio);
    const newIndexes = [...cardIndexes];
    [newIndexes[index], newIndexes[(index + 1) % 3]] = [
      newIndexes[(index + 1) % 3],
      newIndexes[index]
    ];
    setCardIndexes(newIndexes);
  };

  const handleStickerClick = (sticker) => {
    if (sticker) {
      setSelectedSticker(sticker);
      playSound(revealAudio);
    }
  };

  const closePopup = () => setSelectedSticker(null);

  return (
    <div className="collection-container">
      {cardIndexes.map((cardIndex, i) => (
        <div
          key={`card-${cardIndex}`}
          className={`collection-book ${i === 0 ? 'top-card' : ''}`}
          style={{
            zIndex: 3 - i,
            transform: `translateX(${i * 40}px) translateY(${i * 5}px) scale(${1 - i * 0.05})`
          }}
          onClick={(e) => e.target.className !== 'sticker-image' && cycleCards(i)}
          role="button"
          tabIndex={0}
          aria-label={`Cycle to card ${i + 1}`}
          onKeyDown={(e) => e.key === 'Enter' && cycleCards(i)}
        >
          <h2 className="collection-title">Touch and Change Card</h2>
          <div className="sticker-grid">
            {stickerSlots.slice(cardIndex * 24, (cardIndex + 1) * 24).map((sticker, idx) => (
              <div
                key={`sticker-${sticker.id || idx}`}
                className="sticker-item"
                onClick={() => handleStickerClick(sticker)}
                role="button"
                tabIndex={0}
                aria-label={`Sticker ${idx + 1}`}
                onKeyDown={(e) => e.key === 'Enter' && handleStickerClick(sticker)}
              >
                <Sticker
                  src={sticker?.image || `${process.env.PUBLIC_URL}/images/stickers/wafer3.webp`}
                  alt={`Sticker ${idx + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={goBack} className="back-button" type="button">
        Back to Main
      </button>

      {selectedSticker && (
        <div className="popup">
          <div className="popup-content">
            <img src={selectedSticker.image} alt="Selected Sticker" className="popup-image" />
            <button onClick={closePopup} className="close-popup-button" type="button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StickerCollection;
