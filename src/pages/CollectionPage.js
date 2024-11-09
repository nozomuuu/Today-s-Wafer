import React from 'react';
import './CollectionPage.css';
import stickerRevealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';

// Wafer image path using PUBLIC_URL
const waferImage = process.env.PUBLIC_URL + '/images/wafer3.webp';

function CollectionPage({ allStickers, ownedStickers, goBack }) {
    const [cardIndexes, setCardIndexes] = useState([0, 1, 2]);
    const [selectedSticker, setSelectedSticker] = useState(null);

    const cycleCards = (index) => {
        new Audio(viewStickersSound).play();
        if (index === 0) {
            setCardIndexes([cardIndexes[1], cardIndexes[2], cardIndexes[0]]);
        } else if (index === 1) {
            setCardIndexes([cardIndexes[2], cardIndexes[0], cardIndexes[1]]);
        } else {
            setCardIndexes([cardIndexes[0], cardIndexes[1], cardIndexes[2]]);
        }
    };

    const handleStickerClick = (sticker) => {
        if (ownedStickers.includes(sticker)) {
            setSelectedSticker(sticker);
            new Audio(stickerRevealSound).play();
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
                                onClick={() => handleStickerClick(allStickers[j + cardIndex * 24])}
                            >
                                <img
                                    src={ownedStickers.includes(allStickers[j + cardIndex * 24]) ? allStickers[j + cardIndex * 24].image : waferImage}
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

export default CollectionPage;
