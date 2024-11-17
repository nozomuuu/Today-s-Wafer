import React, { useState, useEffect } from 'react';
import './CollectionBook.css';
import stickerRevealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';

function CollectionBook({ allStickers, ownedStickers, goBack }) {
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

    useEffect(() => {
        const savedSlots = JSON.parse(localStorage.getItem('stickerSlots')) || [];
        const newStickerIds = new Set(ownedStickers.map(sticker => sticker.id));

        // 保存されたスロットがある場合は、更新を反映する
        let updatedSlots = [];
        if (savedSlots.length >= ownedStickers.length) {
            updatedSlots = savedSlots.map((slot, index) => ({
                ...slot,
                isNew: newStickerIds.has(slot.id), // NEWフラグを現在の所持リストに基づき設定
            }));
        } else {
            // 初回またはスロットが不足している場合にスロットを再生成
            updatedSlots = Array(72).fill(null).map((_, i) => ({
                ...(ownedStickers[i] || {}),
                isNew: newStickerIds.has(ownedStickers[i]?.id),
                image: ownedStickers[i]?.image || `${process.env.PUBLIC_URL}/images/stickers/wafer3.webp`,
            }));
        }

        setStickerSlots(updatedSlots);
        localStorage.setItem('stickerSlots', JSON.stringify(updatedSlots));
    }, [ownedStickers]); // ownedStickersが変わるたびにリロード

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
        if (sticker) {
            setSelectedSticker(sticker);
            playSound(revealAudio);

            const updatedSlots = stickerSlots.map(slot =>
                slot.id === sticker.id ? { ...slot, isNew: false } : slot
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
                        {stickerSlots.slice(cardIndex * 24, (cardIndex + 1) * 24).map((sticker, j) => (
                            <div
                                key={j}
                                className="sticker-item"
                                onClick={() => handleStickerClick(sticker)}
                            >
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
                <div className="popup">
                    <div className="popup-content">
                        <img src={selectedSticker.image} alt="Selected Sticker" className="popup-image" />
                        {selectedSticker.isNew && <div className="popup-new-badge">NEW</div>}
                        <button onClick={closePopup} className="close-popup-button">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CollectionBook;
