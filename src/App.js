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
    const [collectedStickers, setCollectedStickers] = useState(() => {
        // 初期化時にlocalStorageからデータを取得
        const savedStickers = JSON.parse(localStorage.getItem('collectedStickers')) || [];
        return savedStickers;
    });
    const [todayStickers, setTodayStickers] = useState([]);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [page, setPage] = useState("main");

    const openAudio = new Audio(openSound);
    const revealAudio = new Audio(revealSound);
    const viewStickersAudio = new Audio(viewStickersSound);

    // 初回タップでオーディオを有効化
    useEffect(() => {
        const handleFirstTap = () => {
            openAudio.play().catch(() => {});
            revealAudio.play().catch(() => {});
            viewStickersAudio.play().catch(() => {});

            openAudio.pause();
            revealAudio.pause();
            viewStickersAudio.pause();
            openAudio.currentTime = 0;
            revealAudio.currentTime = 0;
            viewStickersAudio.currentTime = 0;

            document.removeEventListener('touchstart', handleFirstTap);
        };

        document.addEventListener('touchstart', handleFirstTap);

        return () => {
            document.removeEventListener('touchstart', handleFirstTap);
        };
    }, []);

    // collectedStickersの変更をlocalStorageに確実に保存
    useEffect(() => {
        localStorage.setItem('collectedStickers', JSON.stringify(collectedStickers));
    }, [collectedStickers]);

    const playSound = (audio) => {
        if (audio && audio.paused) {
            audio.currentTime = 0;
            audio.play().catch(error => {
                console.error("Audio playback failed:", error);
                setTimeout(() => {
                    audio.play().catch(err => console.error("Retrying audio playback failed:", err));
                }, 500);
            });
        }
    };

    const openWafer = () => {
        if (remaining > 0) {
            playSound(openAudio);
            setIsOpened(true);
            setRemaining(remaining - 1);

            const newSticker = stickersData[Math.floor(Math.random() * stickersData.length)];

            // すでに取得していない場合のみ追加
            if (!collectedStickers.some(sticker => sticker.id === newSticker.id)) {
                setCollectedStickers(prev => [...prev, newSticker]);
            }

            setTodayStickers(prev => [...prev, newSticker]);
            
            setTimeout(() => {
                setIsOpened(false);
                setSelectedSticker(newSticker);
                playSound(revealAudio);
            }, 1500);
        }
    };

    const handleCardClick = (event) => {
        if (event.target.classList.contains("wafer-image")) {
            playSound(viewStickersAudio);
            setIsOpened(!isOpened);
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
                        onClick={handleCardClick} 
                    />
                    <p>Remaining: {remaining}</p>
                    <button onClick={openWafer} className="button">
                        {remaining > 0 ? 'Open a Wafer' : 'No More Wafers'}
                    </button>
                    <button onClick={() => {
                        playSound(viewStickersAudio);
                        setPage("collection");
                    }} className="button">
                        CollectionBook
                    </button>
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
            )}
            {page === "collection" && (
                <CollectionBook
                    allStickers={stickersData}
                    ownedStickers={collectedStickers}
                    goBack={() => {
                        playSound(viewStickersAudio);
                        setPage("main");
                    }}
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
