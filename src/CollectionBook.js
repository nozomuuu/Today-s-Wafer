import React, { useContext, useEffect, useState } from 'react';
import './CollectionBook.css';
import StickerPopup from './StickerPopup';
import stickerRevealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';
import { StickerContext } from './App';

function CollectionBook({ goBack }) {
    const { collectedStickers } = useContext(StickerContext); // Contextから最新のステッカー情報を取得
    const [cardIndexes, setCardIndexes] = useState([0, 1, 2]);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [stickerSlots, setStickerSlots] = useState([]);
    const viewStickersAudio = new Audio(viewStickersSound);
    const revealAudio = new Audio(stickerRevealSound);

    const playSound = (audio) => {
        if (audio && audio.paused) {
            audio.currentTime = 0;
            audio.play().catch(err => console.error("Audio playback error:", err));
        }
    };

    const loadStickerSlots = () => {
        try {
            const savedSlots = JSON.parse(localStorage.getItem('stickerSlots')) || [];
            console.log('Loaded stickerSlots from localStorage:', savedSlots);
            return savedSlots;
        } catch (error) {
            console.error('Error loading stickerSlots:', error);
            return [];
        }
    };

    const saveStickerSlots = (slots) => {
        try {
            console.log('Saving stickerSlots to localStorage:', slots);
            localStorage.setItem('stickerSlots', JSON.stringify(slots));
        } catch (error) {
            console.error('Error saving stickerSlots:', error);
        }
    };

    const updateStickerSlots = () => {
        console.log('Updating stickerSlots...');
        const savedSlots = loadStickerSlots();

        // 新規ステッカーを確認
        const newOwnedStickers = collectedStickers.filter(sticker =>
            !savedSlots.some(slot => slot.image === sticker.image)
        ).map(sticker => ({ ...sticker, isNew: true }));

        // 既存スロットに追加
        const updatedSlots = [...savedSlots];
        newOwnedStickers.forEach(sticker => {
            const index = updatedSlots.findIndex(slot => slot.image === `${process.env.PUBLIC_URL}/images/stickers/wafer3.webp`);
            if (index !== -1) {
                updatedSlots[index] = sticker;
            } else {
                updatedSlots.push(sticker);
            }
        });

        // スロットを埋める
        while (updatedSlots.length < 72) {
            updatedSlots.push({
                image: `${process.env.PUBLIC_URL}/images/stickers/wafer3.webp`,
                isNew: false,
            });
        }

        setStickerSlots(updatedSlots.slice(0, 72));
        saveStickerSlots(updatedSlots.slice(0, 72));
        console.log('Updated stickerSlots:', updatedSlots);
    };

    useEffect(() => {
        const savedSlots = loadStickerSlots();
        if (savedSlots.length === 0) {
            updateStickerSlots();
        } else {
            setStickerSlots(savedSlots);
        }
    }, []);

    useEffect(() => {
        updateStickerSlots();
    }, [collectedStickers]);

    const cycleCards = (index) => {
        playSound(viewStickersAudio);
        setCardIndexes(prev => {
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

            const updatedSlots = stickerSlots.map(slot =>
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
                    key={cardIndex}
                    className={`collection-book ${i === 0 ? "top-card" : ""}`}
                    style={{
                        zIndex: 3 - i,
                        transform: `translateX(${i * 40}px) translateY(${i * 5}px) scale(${1 - i * 0.05})`,
                    }}
                    onClick={(e) => {
                        if (e.target.className !== 'sticker-image') cycleCards(i);
                    }}
                >
                    <h2 className="collection-title">Touch and Change Card</h2>
                    <div className="sticker-grid">
                        {stickerSlots.slice(cardIndex * 24, (cardIndex + 1) * 24).map((sticker, j) => (
                            <div key={j} className="sticker-item" onClick={() => handleStickerClick(sticker)}>
                                <img
                                    src={sticker.image}
                                    alt={`Sticker ${j + 1}`}
                                    className="sticker-image"
                                />
                                {sticker.isNew && <div className="new-badge">NEW</div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <button onClick={goBack} className="back-button">Back to Main</button>
            {selectedSticker && (
                <StickerPopup sticker={selectedSticker} closePopup={closePopup} />
            )}
        </div>
    );
}

export default CollectionBook;
