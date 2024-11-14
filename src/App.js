import React, { useState, useEffect } from 'react';
import './App.css';
import waferClosed from './images/wafer1.webp';
import waferOpened from './images/wafer2.webp';
import stickersData from './stickersData';
import CollectionBook from './CollectionBook';
import openSound from './sounds/wafer-open.mp3';
import revealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';

function App() {
    const [isOpened, setIsOpened] = useState(false);
    const [remaining, setRemaining] = useState(3);
    const [collectedStickers, setCollectedStickers] = useState([]);
    const [todayStickers, setTodayStickers] = useState([]);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [page, setPage] = useState("main");

    const openAudio = new Audio(openSound);
    const revealAudio = new Audio(revealSound);
    const viewStickersAudio = new Audio(viewStickersSound);

    // 初回ロード時のオーディオ設定（スマホで初回のタッチでオーディオが有効になるように）
    useEffect(() => {
        openAudio.load();
        revealAudio.load();
        viewStickersAudio.load();

        const handleFirstTap = () => {
            [openAudio, revealAudio, viewStickersAudio].forEach(audio => {
                audio.play().catch(() => {});
                audio.pause();
                audio.currentTime = 0;
            });
            document.removeEventListener('touchstart', handleFirstTap);
        };

        document.addEventListener('touchstart', handleFirstTap);
        return () => document.removeEventListener('touchstart', handleFirstTap);
    }, []);

    // 音声再生の共通関数
    const playSound = (audio) => {
        audio.currentTime = 0;
        audio.play().catch(error => console.error("Audio playback failed:", error));
    };

    const openWafer = () => {
        if (remaining > 0) {
            playSound(openAudio);
            setIsOpened(true);
            setRemaining(remaining - 1);

            const newSticker = stickersData[Math.floor(Math.random() * stickersData.length)];
            setCollectedStickers(prev => {
                const updated = [...prev, newSticker];
                setTodayStickers(updated);  // todayStickersも更新して反映
                return updated;
            });

            setTimeout(() => {
                setIsOpened(false);
                setSelectedSticker(newSticker);
                playSound(revealAudio); // ポップアップ表示と同時に再生
            }, 1500); // 1.5秒後にポップアップとともに再生
        }
    };

    const closeStickerDetail = () => setSelectedSticker(null);

    return (
        <div className="app">
            {page === "main" ? (
                <div className="main-container">
                    <h1 className="title">Today's Wafer</h1>
                    <img 
                        src={isOpened ? waferOpened : waferClosed} 
                        alt="Wafer" 
                        className="wafer-image" 
                        onClick={() => setIsOpened(!isOpened)} 
                    />
                    <p>Remaining: {remaining}</p>
                    <button onClick={openWafer} className="button">
                        {remaining > 0 ? 'Open a Wafer' : 'No More Wafers'}
                    </button>
                    <button onClick={() => setPage("collection")} className="button">CollectionBook</button>
                    <div className="collected-stickers">
                        {todayStickers.map((sticker, index) => (
                            <img
                                key={index}
                                src={sticker.image}
                                alt={`Sticker ${index + 1}`}
                                className="sticker-small"
                                onClick={() => {
                                    setSelectedSticker(sticker);
                                    playSound(revealAudio);
                                }}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <CollectionBook
                    allStickers={stickersData}
                    ownedStickers={collectedStickers}
                    goBack={() => setPage("main")}
                />
            )}
            {selectedSticker && (
                <div className="sticker-popup" onClick={closeStickerDetail}>
                    <div className="sticker-popup-content">
                        <img src={selectedSticker.image} alt="Selected Sticker" className="sticker-large" />
                        <button onClick={closeStickerDetail} className="button">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
