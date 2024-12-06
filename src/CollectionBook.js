import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import './CollectionBook.css';
import StickerPopup from './StickerPopup';
import stickerRevealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';
import { StickerContext } from './StickerContext';

const CollectionBook = ({ goBack }) => {
  const { collectedStickers } = useContext(StickerContext);
  const [cardIndexes, setCardIndexes] = useState([0, 1, 2]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [stickerSlots, setStickerSlots] = useState([]);
  const viewStickersAudio = useMemo(() => new Audio(viewStickersSound), []);
  const revealAudio = useMemo(() => new Audio(stickerRevealSound), []);

  const playSound = (audio) => {
    if (audio && audio.paused) {
      audio.currentTime = 0;
      audio.play().catch((err) => console.error('Audio playback error:', err));
    }
  };

  const loadStickerSlots = () => {
    try {
      return JSON.parse(localStorage.getItem('stickerSlots')) || [];
    } catch (error) {
      console.error('Error loading stickerSlots:', error);
      return [];
    }
  };

  const saveStickerSlots = (slots) => {
    try {
      localStorage.setItem('stickerSlots', JSON.stringify(slots));
    } catch (error) {
      console.error('Error saving stickerSlots:', error);
    }
  };

  const updateStickerSlots = useCallback(() => {
    const savedSlots = loadStickerSlots();
    const newOwnedStickers = collectedStickers
      .filter((sticker) => !savedSlots.some((slot) => slot.image === sticker.image))
      .map((sticker) => ({ ...sticker, isNew: true }));

    const updatedSlots = [...savedSlots];
    newOwnedStickers.forEach((sticker) => {
      const index = updatedSlots.findIndex((slot) => slot.image.includes('wafer3.webp'));
      if (index !== -1) {
        updatedSlots[index] = sticker;
      } else {
        updatedSlots.push(sticker);
      }
    });

    while (updatedSlots.length < 72) {
      updatedSlots.push({
        image: `${process.env.PUBLIC_URL}/images/stickers/wafer3.webp`,
        isNew: false
      });
    }

    setStickerSlots(updatedSlots.slice(0, 72));
    saveStickerSlots(updatedSlots.slice(0, 72));
  }, [collectedStickers]);

  useEffect(() => {
    const savedSlots = loadStickerSlots();
    if (savedSlots.length === 0) {
      updateStickerSlots();
    } else {
      setStickerSlots(savedSlots);
    }
  }, [updateStickerSlots]);

  useEffect(() => {
    updateStickerSlots();
  }, [collectedStickers, updateStickerSlots]);

  const cycleCards = (index) => {
    playSound(viewStickersAudio);
    setCardIndexes((prev) => {
      const newIndexes = [...prev];
      const temp = newIndexes[index];
      newIndexes[index] = newIndexes[(index + 1) % 3];
      newIndexes[(index + 1) % 3] = temp;
      return newIndexes;
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
      saveStickerSlots(updatedSlots);
    }
  };

  const closePopup = () => setSelectedSticker(null);

  return (
    <div className="collection-container">
      {cardIndexes.map((cardIndex, i) => (
        <div
          key={`card-${cardIndexes.join('-')}`} // 修正: ユニークなキーに修正
          className={`collection-book ${i === 0 ? 'top-card' : ''}`}
          style={{
            zIndex: 3 - i,
            transform: `translateX(${i * 40}px) translateY(${i * 5}px) scale(${1 - i * 0.05})`
          }}
          onClick={(e) => {
            if (e.target.className !== 'sticker-image') cycleCards(i);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && cycleCards(i)}
          aria-label={`Cycle Card ${cardIndex + 1}`}
        >
          <h2 className="collection-title">Touch and Change Card</h2>
          <div className="sticker-grid">
            {stickerSlots.slice(cardIndex * 24, (cardIndex + 1) * 24).map((sticker) => (
              <button
                key={sticker.image} // 修正: インデックスではなく画像URLをキーに
                className="sticker-item"
                onClick={() => handleStickerClick(sticker)}
                type="button"
                aria-label={`Sticker ${sticker.image}`}
              >
                <img src={sticker.image} alt="Sticker" className="sticker-image" />
                {sticker.isNew && <div className="new-badge">NEW</div>}
              </button>
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

export default CollectionBook;
