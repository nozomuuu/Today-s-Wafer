import React, { useState } from 'react';
import './App.css';
import waferClosed from './images/stickers/wafer1.webp';
import waferOpened from './images/stickers/wafer2.webp';
import stickersData from './stickersData'; // すべてのステッカー情報を含む
import CollectionBook from './CollectionBook';
import stickerRevealSound from './sounds/sticker-reveal.mp3';

function App() {
    const [isOpened, setIsOpened] = useState(false);
    const [remaining, setRemaining] = useState(3);
    const [collectedStickers, setCollectedStickers] = useState([]);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [page, setPage] = useState("main");

    const openWafer = () => {
        if (remaining > 0) {
            setIsOpened(true);
            setRemaining(remaining - 1);
            const newSticker = stickersData[Math.floor(Math.random() * stickersData.length)];

            // collectedStickersが定義されているかを確認し、追加する
            if (!collectedStickers || !collectedStickers.some(sticker => sticker.id === newSticker.id)) {
                setCollectedStickers([...collectedStickers, newSticker]);
            }

            setTimeout(() => {
                setIsOpened(false);
                setSelectedSticker(newSticker); // ポップアップ表示
                new Audio(stickerRevealSound).play(); // SEを再生
            }, 1500);
        }
    };

    const closeStickerDetail = () => setSelectedSticker(null);

    return (
        <div className="app">
            {page === "main" && (
                <div className="main-container">
                    <h1 className="title">Today's Wafer</h1>
                    <img
                        src={isOpened ? waferOpened : waferClosed}
                        alt="Wafer"
                        className="wafer-image"
                    />
                    <p>Remaining: {remaining}</p>
                    <button onClick={openWafer} className="button">
                        {remaining > 0 ? 'Open a Wafer' : 'No More Wafers'}
                    </button>
                    <button onClick={() => setPage("collection")} className="button">
                        CollectionBook
                    </button>
                    <div className="collected-stickers">
                        {/* collectedStickersが配列かを確認してmapを使用 */}
                        {Array.isArray(collectedStickers) && collectedStickers.map((sticker, index) => (
                            <img
                                key={index}
                                src={sticker.image}
                                alt={`Sticker ${index + 1}`}
                                className="sticker-small"
                                onClick={() => setSelectedSticker(sticker)}
                            />
                        ))}
                    </div>
                </div>
            )}
            {page === "collection" && (
                <CollectionBook 
                    collectedStickers={collectedStickers || []} // undefinedの場合に空配列を渡す
                    goBack={() => setPage("main")}
                />
            )}
            {selectedSticker && (
                <div className="sticker-popup" onClick={closeStickerDetail}>
                    <div className="popup-content">
                        <img src={selectedSticker.image} alt="Selected Sticker" className="sticker-large" />
                        <button onClick={closeStickerDetail} className="button">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
