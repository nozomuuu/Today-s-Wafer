// App.js - ウエハース開封画面の改善
import React, { useState, useEffect } from 'react';
import './App.css';
import waferClosed from './images/wafer1.webp';
import waferOpened from './images/wafer2.webp';
import stickersData from './stickersData';
import CollectionBook from './CollectionBook';
import openSound from './sounds/wafer-open.mp3';
import revealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return data || [];
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return [];
    }
}

function addUniqueSticker(newSticker, collectedStickers) {
    if (!collectedStickers.some(sticker => sticker.image === newSticker.image)) {
        collectedStickers.push({ ...newSticker, isNew: true });
    }
}

function playSound(audio) {
    if (audio && audio.paused) {
        audio.currentTime = 0;
        audio.play().catch(error => {
            console.error("Audio playback failed:", error);
        });
    }
}

function App() {
    const [isOpened, setIsOpened] = useState(false);
    const [remaining, setRemaining] = useState(Infinity);
    const [collectedStickers, setCollectedStickers] = useState(loadFromLocalStorage('collectedStickers'));
    const [todayStickers, setTodayStickers] = useState([]);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [page, setPage] = useState("main");

    const openAudio = new Audio(openSound);
    const revealAudio = new Audio(revealSound);
    const viewStickersAudio = new Audio(viewStickersSound);

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

        setTodayStickers(prev => [...prev, { ...newSticker, isNew: true }]); // isNewフラグを付加して todayStickers に追加
        setTimeout(() => {
            setIsOpened(false);
            setSelectedSticker({ ...newSticker, isNew: true });
            playSound(revealAudio);
        }, 1500);
    };

    const goToCollectionBook = () => {
        playSound(viewStickersAudio);
        setPage("collection");
    };

    return (
        <div className="app">
            {page === "main" && (
                <div className="main-container">
                    <h1 className="title">Today's Wafer</h1>
                    <img 
                        src={isOpened ? waferOpened : waferClosed} 
                        alt="Wafer" 
                        className="wafer-image" 
                        onClick={() => playSound(viewStickersAudio)} 
                    />
                    <p>Remaining: {remaining === Infinity ? "Unlimited" : remaining}</p>
                    <button onClick={openWafer} className="button open-wafer-button">
                        Open a Wafer
                    </button>
                    <button onClick={goToCollectionBook} className="button collection-book-button">
                        CollectionBook
                    </button>
                    <div className="collected-stickers">
                        {todayStickers.map((sticker, index) => (
                            <div key={index} className="sticker-item">
                                <img
                                    src={sticker.image}
                                    alt={`Sticker ${index + 1}`}
                                    className="sticker-small"
                                />
                                {sticker.isNew && <div className="new-badge">NEW</div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {page === "collection" && (
                <CollectionBook
                    allStickers={stickersData}
                    ownedStickers={collectedStickers}
                    goBack={() => setPage("main")}
                />
            )}
            {selectedSticker && (
                <div className="popup">
                    <div className="popup-content">
                        <img src={selectedSticker.image} alt="Selected Sticker" className="sticker-large" />
                        <button onClick={() => setSelectedSticker(null)} className="close-popup-button">Close</button>
                        {selectedSticker.isNew && <div className="popup-new-badge">NEW</div>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
