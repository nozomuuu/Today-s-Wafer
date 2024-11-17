import React, { useState, useEffect } from 'react';
import './App.css';
import waferClosed from './images/wafer1.webp';
import waferOpened from './images/wafer2.webp';
import stickersData from './stickersData';
import CollectionBook from './CollectionBook';
import openSound from './sounds/wafer-open.mp3';
import revealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';

// ローカルストレージにデータを保存する関数
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// ローカルストレージからデータを読み込む関数
function loadFromLocalStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return [];
    }
}

// ステッカーを重複なく追加する関数
function addUniqueSticker(newSticker, collectedStickers) {
    if (!collectedStickers.some(sticker => sticker.image === newSticker.image)) {
        collectedStickers.push(newSticker);
    }
}

function playSound(audio) {
    audio.currentTime = 0;
    audio.play().catch(error => console.error("Audio playback failed:", error));
}

function App() {
    const [isOpened, setIsOpened] = useState(false);
    const [collectedStickers, setCollectedStickers] = useState(loadFromLocalStorage('collectedStickers'));
    const [todayStickers, setTodayStickers] = useState([]);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [page, setPage] = useState("main");

    const openAudio = new Audio(openSound);
    const revealAudio = new Audio(revealSound);
    const viewStickersAudio = new Audio(viewStickersSound);

    // 初回タップ時の音声準備
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
        return () => document.removeEventListener('touchstart', handleFirstTap);
    }, []);

    useEffect(() => {
        saveToLocalStorage('collectedStickers', collectedStickers);
    }, [collectedStickers]);

    const openWafer = () => {
        playSound(openAudio);
        setIsOpened(true);
        const newSticker = stickersData[Math.floor(Math.random() * stickersData.length)];

        setCollectedStickers(prev => {
            const updatedStickers = [...prev];
            addUniqueSticker(newSticker, updatedStickers);
            return updatedStickers;
        });

        setTodayStickers(prev => [...prev, newSticker]);
        setTimeout(() => {
            setIsOpened(false);
            setSelectedSticker(newSticker);
            playSound(revealAudio);
        }, 1500);
    };

    const handleCardClick = () => {
        playSound(viewStickersAudio);
        setIsOpened(!isOpened);
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
                    <button onClick={openWafer} className="button">
                        Open a Wafer
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
