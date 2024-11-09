import React, { useState, useEffect } from 'react';
import './CollectionBook.css';
import stickerRevealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';

const waferImage = `${process.env.PUBLIC_URL}/images/stickers/wafer3.webp`;

function CollectionBook({ allStickers, ownedStickers, goBack }) {
    const [cardIndexes, setCardIndexes] = useState([0, 1, 2]);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [stickerSlots, setStickerSlots] = useState([]);

    useEffect(() => {
        const slots = Array(72).fill(null);
        ownedStickers.forEach((sticker) => {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * 72);
            } while (slots[randomIndex] !== null);
            slots[randomIndex] = sticker;
        });
        setStickerSlots(slots);
    }, [ownedStickers]);

    const cycleCards = (index) => {
        new Audio(viewStickersSound).play();
        setCardIndexes((prev) => {
            if (index === 0) return [prev[1], prev[2], prev[0]];
            if (index === 1) return [prev[2], prev[0], prev[1]];
            return [prev[0], prev[1], prev[2]];
        });
    };

    const handleStickerClick = (sticker) => {
        if (sticker) {
            setSelectedSticker(sticker);
            new Audio(stickerRevealSound).play();
        }
    };

    return (
        <div className="collection-container">
            {cardIndexes.map((cardIndex, i) => (
                <div
                    key={i}
                    className={`collection-book ${i === 0 ? "top-card" : ""}`}
                    style={{
                        zIndex: 3 - i,
                        transform: `translateX(${i * 40}px) translateY(${i * 5}px) scale(${1 - i * 0.05})`,
                    }}
                    onClick={() => cycleCards(i)}
                >
                    <h2 className="collection-title">Touch and Change Card</h2>
                    <div className="sticker-grid">
                        {Array.from({ length: 24 }).map((_, j) => (
                            <div
                                key={j}
                                className="sticker-item"
                                onClick={() => handleStickerClick(stickerSlots[j + cardIndex * 24])}
                            >
                                <img
                                    src={stickerSlots[j + cardIndex * 24]?.image || waferImage}
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
                        <button onClick={() => setSelectedSticker(null)} className="close-popup-button">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CollectionBook;
