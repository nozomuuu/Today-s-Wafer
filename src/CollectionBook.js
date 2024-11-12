import React, { useState, useEffect } from 'react';
import Sticker from './Sticker';
import './CollectionBook.css';
import stickerRevealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';

const CollectionBook = ({ allStickers, ownedStickers, goBack }) => {
  const [cardIndexes, setCardIndexes] = useState([0, 1, 2]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [stickerSlots, setStickerSlots] = useState([]);

  // 音声ファイルの初期ロードと再利用のためのオーディオオブジェクト
  const viewStickersAudio = new Audio(viewStickersSound);
  const revealAudio = new Audio(stickerRevealSound);

  useEffect(() => {
    viewStickersAudio.load();
    revealAudio.load();
  }, []);

  useEffect(() => {
    // ownedStickersを特定の位置に確実に配置する初期化
    const initializeStickers = () => {
      const slots = Array(72).fill({ image: `${process.env.PUBLIC_URL}/images/stickers/wafer3.webp` });
      ownedStickers.forEach((sticker, index) => {
        if (index < slots.length) {
          slots[index] = sticker;
        }
      });
      setStickerSlots(slots);
    };

    if (ownedStickers.length > 0) {
      initializeStickers();
    }
  }, [ownedStickers]);

  const cycleCards = (index) => {
    viewStickersAudio.currentTime = 0;
    viewStickersAudio.play().catch(error => console.error("Audio playback failed:", error));
    if (index === 0) {
      setCardIndexes([cardIndexes[1], cardIndexes[2], cardIndexes[0]]);
    } else if (index === 1) {
      setCardIndexes([cardIndexes[2], cardIndexes[0], cardIndexes[1]]);
    } else {
      setCardIndexes([cardIndexes[0], cardIndexes[1], cardIndexes[2]]);
    }
  };

  const handleStickerClick = (sticker) => {
    if (sticker && revealAudio) {
      setSelectedSticker(sticker);
      revealAudio.currentTime = 0;
      revealAudio.play().catch(error => console.error("Audio playback failed:", error));
    }
  };

  const closePopup = () => setSelectedSticker(null);

  return (
    <div className="collection-container">
      {cardIndexes.map((cardIndex, i) => (
        <div
          key={cardIndex}
          className={`collection-book ${i === 0 ? "top-card" : ""}`}
          style={{
            zIndex: 3 - i,
            transform: `translateX(${i * 40}px) translateY(${i * 5}px) scale(${1 - i * 0.05})`,
          }}
          onClick={(e) => {
            if (e.target.className !== 'sticker-image') {
              cycleCards(i);
            }
          }}
        >
          <h2 className="collection-title">Touch and Change Card</h2>
          <div className="sticker-grid">
            {Array.from({ length: 24 }).map((_, j) => (
              <div
                key={j}
                className="sticker-item"
                onClick={() => handleStickerClick(stickerSlots[j + cardIndex * 24])}
              >
                <Sticker
                  src={stickerSlots[j + cardIndex * 24]?.image || `${process.env.PUBLIC_URL}/images/stickers/wafer3.webp`}
                  alt={`Sticker ${j + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={goBack} className="back-button">Back to Main</button>

      {selectedSticker && (
        <div className="popup">
          <div className="popup-content">
            <img src={selectedSticker.image} alt="Selected Sticker" className="popup-image" />
            <button onClick={closePopup} className="close-popup-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionBook;
