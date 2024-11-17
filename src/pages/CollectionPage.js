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
        // スロットが72以上あることを確認し、全ての所持ステッカーを反映させるロジック
        const savedSlots = JSON.parse(localStorage.getItem('stickerSlots')) || [];
        let slots = savedSlots.length >= 72 ? savedSlots : Array(72).fill({ image: `${process.env.PUBLIC_URL}/images/stickers/wafer3.webp` });

        let filledIndices = new Set(slots.map((slot, index) => slot.image !== `${process.env.PUBLIC_URL}/images/stickers/wafer3.webp` ? index : null).filter(index => index !== null));

        ownedStickers.forEach((sticker) => {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * slots.length);
            } while (filledIndices.has(randomIndex)); // 重複を防止
            slots[randomIndex] = sticker;
            filledIndices.add(randomIndex);
        });

        // 必要に応じて空のスロットを追加
        while (slots.length < 72) {
            slots.push({ image: `${process.env.PUBLIC_URL}/images/stickers/wafer3.webp` });
        }

        setStickerSlots(slots);
        localStorage.setItem('stickerSlots', JSON.stringify(slots));
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
        if (sticker && sticker.image !== `${process.env.PUBLIC_URL}/images/stickers/wafer3.webp`) {
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
                        {stickerSlots.slice(cardIndex * 24, (cardIndex + 1) * 24).map((sticker, j) => (
                            <div
                                key={j}
                                className="sticker-item"
                                onClick={() => handleStickerClick(sticker)}
                            >
                                <img
                                    src={sticker.image || `${process.env.PUBLIC_URL}/images/stickers/wafer3.webp`}
                                    alt={`Sticker ${j + 1}`}
                                    className="sticker-image"
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
}

export default CollectionBook;
