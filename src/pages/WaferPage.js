import React, { useState } from 'react';
import './WaferPage.css';
import waferOpenSound from './sounds/wafer-open.mp3';

const WaferPage = ({ onCollectionBookOpen, stickers }) => {
    const [selectedSticker, setSelectedSticker] = useState(null);

    const handleWaferOpen = () => {
        // 音声の再生
        new Audio(waferOpenSound).play();
        // シールの選択
        const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
        setSelectedSticker(randomSticker);
    };

    return (
        <div className="wafer-page">
            <h1>Today's Wafer</h1>
            <button onClick={handleWaferOpen}>Open a Wafer</button>
            <button onClick={onCollectionBookOpen}>CollectionBook</button>

            {selectedSticker && (
                <div className="sticker-modal">
                    <div className="modal-content">
                        <img src={selectedSticker.image} alt="Sticker" className="modal-sticker-image" />
                        <button className="close-button" onClick={() => setSelectedSticker(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WaferPage;
