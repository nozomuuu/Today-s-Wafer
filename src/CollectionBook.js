import React, { useState, useEffect, useRef } from 'react';
import Sticker from './Sticker';
import './CollectionBook.css';
import stickerRevealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';

const CollectionBook = ({ allStickers, ownedStickers, goBack }) => {
  const [cardIndexes, setCardIndexes] = useState([0, 1, 2]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [stickerSlots, setStickerSlots] = useState(Array(72).fill(null));

  // useRefで音声オブジェクトを保持し、再生成を防ぐ
  const viewStickersAudio = useRef(new Audio(viewStickersSound));
  const revealAudio = useRef(new Audio(stickerRevealSound));

  // オーディオのロードは初回のみ実行
  useEffect(() => {
    viewStickersAudio.current.load();
    revealAudio.current.load();
  }, []);

  // 72スロットを持つ空の配列にステッカーをランダムに配置
  useEffect(() => {
    const slots = Array(72).fill(null);
    ownedStickers.forEach((sticker) => {
      let randomIndex;
      // 空きスロットを見つけるまでランダムに選ぶ
      do {
        randomIndex = Math.floor(Math.random() * 72);
      } while (slots[randomIndex] !== null);
      slots[randomIndex] = sticker;
    });
    setStickerSlots(slots);
  }, [ownedStickers]);

  const playSound = (audioRef) => {
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(error => {
      console.error("Audio playback failed:", error);
    });
  };

  const cycleCards = (index) => {
    playSound(viewStickersAudio);
    setCardIndexes((prevIndexes) => {
      if (index === 0) return [prevIndexes[1], prevIndexes[2], prevIndexes[0]];
      if (index === 1) return [prevIndexes[2], prevIndexes[0], prevIndexes[1]];
      return [prevIndexes[0], prevIndexes[1], prevIndexes[2]];
    });
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
