import React, { useState, useEffect } from 'react';
import Sticker from './Sticker';
import './CollectionBook.css';
import stickerRevealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';

const CollectionBook = ({ allStickers, ownedStickers, goBack }) => {
  const [cardIndexes, setCardIndexes] = useState([0, 1, 2]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [stickerSlots, setStickerSlots] = useState([]);

  const viewStickersAudio = new Audio(viewStickersSound);
  const revealAudio = new Audio(stickerRevealSound);

  // 音声を再生する共通関数
  const playSound = (audio) => {
    if (audio && audio.paused) {
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error("Audio playback failed:", error);
        setTimeout(() => {
          audio.play().catch(err => console.error("Retrying audio playback failed:", err));
        }, 500);
      });
    }
  };

  useEffect(() => {
    viewStickersAudio.load();
    revealAudio.load();
  }, []);

  // ステッカーをランダムに配置するロジック
  useEffect(() => {
    const initializeStickers = () => {
      const slots = Array(72).fill({ image: `${process.env.PUBLIC_URL}/images/stickers/wafer3.webp` });
      ownedStickers.forEach(sticker => {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * 72);
        } while (slots[randomIndex] && slots[randomIndex].id);  // 空スロットが見つかるまでランダムインデックスを選択
        slots[randomIndex] = sticker;
      });
      setStickerSlots(slots);
    };

    if (ownedStickers.length > 0) {
      initializeStickers();
    }
  }, [ownedStickers]);

  const cycleCards = (index) => {
    playSound(viewStickersAudio);
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
      playSound(revealAudio);
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
