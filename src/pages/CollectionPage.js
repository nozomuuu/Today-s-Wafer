import React, { useState, useEffect } from 'react';
import './CollectionBook.css';
import { getStickerUrl } from './stickerImages';
import StickerPopup from '../StickerPopup';
import stickerRevealSound from '../sounds/sticker-reveal.mp3';
import viewStickersSound from '../sounds/view-stickers.mp3';

const CollectionPage = ({ ownedStickers, goBack }) => {
  const [cardIndexes, setCardIndexes] = useState([0, 1, 2]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [stickerSlots, setStickerSlots] = useState([]);
  const viewStickersAudio = new Audio(viewStickersSound);
  const revealAudio = new Audio(stickerRevealSound);

  const playSound = (audio) => {
    if (audio && audio.paused) {
      audio.currentTime = 0;
      audio.play().catch((err) => console.error('Audio playback error:', err));
    }
  };

  useEffect(() => {
    const loadStickerSlots = () => {
      try {
        const savedSlots = JSON.parse(localStorage.getItem('stickerSlots')) || [];
        const newOwnedStickers = ownedStickers.map((sticker) => ({
          ...sticker,
          image: getStickerUrl(sticker.name), // Google DriveからURLを取得
          id: `${sticker.name}-${Date.now()}`
        }));

        const updatedSlots = [...savedSlots, ...newOwnedStickers];
        while (updatedSlots.length < 72) {
          updatedSlots.push({
            image: getStickerUrl('wafer1.webp') || '', // デフォルト画像
            isNew: false,
            id: `empty-${updatedSlots.length}`
          });
        }

        setStickerSlots(updatedSlots);
        localStorage.setItem('stickerSlots', JSON.stringify(updatedSlots));
      } catch (error) {
        console.error('Error loading or saving sticker slots:', error);
      }
    };

    loadStickerSlots();
  }, [ownedStickers]);

  const cycleCards = (index) => {
    playSound(viewStickersAudio);
    setCardIndexes((prevIndexes) => {
      const newOrder = [...prevIndexes];
      const [removed] = newOrder.splice(index, 1);
      newOrder.push(removed);
      return newOrder;
    });
  };

  const handleStickerClick = (sticker) => {
    if (sticker) {
      setSelectedSticker(sticker);
      playSound(revealAudio);

      const updatedSlots = stickerSlots.map((slot) =>
        slot.image === sticker.image ? { ...slot, isNew: false } : slot
      );
      setStickerSlots(updatedSlots);
      localStorage.setItem('stickerSlots', JSON.stringify(updatedSlots));
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
          onClick={(e) => {
            if (e.target.className !== 'sticker-image') {
              cycleCards(i);
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && cycleCards(i)}
        >
          <h2 className="collection-title">Touch and Change Card</h2>
          <div className="sticker-grid">
            {stickerSlots.slice(cardIndex * 24, (cardIndex + 1) * 24).map((sticker) => (
              <div
                key={sticker.id}
                className="sticker-item"
                onClick={() => handleStickerClick(sticker)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleStickerClick(sticker)}
              >
                <img src={sticker.image} alt="Sticker" className="sticker-image" />
                {sticker.isNew && <div className="new-badge">NEW</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={goBack} className="back-button" type="button">
        Back to Main
      </button>

      {selectedSticker && <StickerPopup sticker={selectedSticker} closePopup={closePopup} />}
    </div>
  );
};

export default CollectionPage;
