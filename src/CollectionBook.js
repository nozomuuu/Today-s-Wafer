import React, { useState, useEffect } from 'react';
import './CollectionBook.css';
import StickerPopup from './StickerPopup'; // StickerPopupコンポーネントの読み込み
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
        const newOwnedStickers = ownedStickers.filter(sticker => !savedSlots.some(slot => slot.image === sticker.image));
        
        // スロットの更新と新しいステッカーの反映
        const updatedSlots = [...savedSlots, ...newOwnedStickers];
        while (updatedSlots.length < 72) {
            updatedSlots.push({ image: `${process.env.PUBLIC_URL}/images/stickers/wafer3.webp`, isNew: false });
        }

        // 各スロットのisNewフラグを更新
        const updatedSlotsWithNewFlag = updatedSlots.map(slot => ({
            ...slot,
            isNew: ownedStickers.some(sticker => sticker.id === slot.id),
        }));

        setStickerSlots(updatedSlotsWithNewFlag);
        localStorage.setItem('stickerSlots', JSON.stringify(updatedSlotsWithNewFlag));
    }, [ownedStickers]);

    const cycleCards = (index) => {
        playSound(viewStickersAudio);
        setCardIndexes(prevIndexes => {
            const newIndexes = [...prevIndexes];
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

            // ステッカーのisNewフラグをfalseに更新して保存
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
