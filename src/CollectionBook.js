import React, { useState, useEffect } from 'react';
import './CollectionBook.css';
import waferImage from './images/wafer3.webp'; // Ensure wafer image is in WebP format
import stickerRevealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';

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
        const audio = new Audio(viewStickersSound);
        audio.play();

        if (index === 0) {
            setCardIndexes([cardIndexes[1], cardIndexes[2], cardIndexes[0]]);
        } else if (index === 1) {
            setCardIndexes([cardIndexes[2], cardIndexes[0], cardIndexes[1]]);
        } else {
            setCardIndexes([cardIndexes[0], cardIndexes[1], cardIndexes[2]]);
        }
    };

    const handleStickerClick = (sticker, event) => {
        if (event.target.className === 'sticker-image' && sticker) {
            setSelectedSticker(sticker);
            const revealAudio = new Audio(stickerRevealSound);
            revealAudio.play();
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
                                onClick={(e) => handleStickerClick(stickerSlots[j + cardIndex * 24], e)}
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
                        <button onClick={closePopup} className="close-popup-button">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CollectionBook;
