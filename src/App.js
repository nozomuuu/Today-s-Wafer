import React, { useState, useEffect, createContext } from 'react';
import './App.css';
import waferClosed from './images/wafer1.webp';
import waferOpened from './images/wafer2.webp';
import stickersData from './stickersData';
import CollectionBook from './CollectionBook';
import openSound from './sounds/wafer-open.mp3';
import revealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';

// Contextを作成してデータを共有
export const StickerContext = createContext();

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
    const existingSticker = collectedStickers.find(sticker => sticker.image === newSticker.image);
    if (!existingSticker) {
        collectedStickers.push({ ...newSticker, isNew: true });
        return { ...newSticker, isNew: true };
    }
    return { ...existingSticker, isNew: false };
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
        document.addEventListener('touchstart', handleFirstTap);
        return () => document.removeEventListener('touchstart', handleFirstTap);
    }, []);

    const handleFirstTap = () => {
        openAudio.play().catch(() => {});
        revealAudio.play().catch(() => {});
        viewStickersAudio.play().catch(() => {});
        resetAudio([openAudio, revealAudio, viewStickersAudio]);
        document.removeEventListener('touchstart', handleFirstTap);
    };

    const resetAudio = (audioList) => {
        audioList.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    };

    useEffect(() => {
        saveToLocalStorage('collectedStickers', collectedStickers);
    }, [collectedStickers]);

    const openWafer = () => {
        playSound(openAudio);
        setIsOpened(true);
        const newSticker = stickersData[Math.floor(Math.random() * stickersData.length)];

        const updatedStickers = [...collectedStickers];
        const stickerWithNewFlag = addUniqueSticker(newSticker, updatedStickers);

        setCollectedStickers(updatedStickers);

        setTodayStickers(prev => [...prev, stickerWithNewFlag]);
        setTimeout(() => {
            setIsOpened(false);
            setSelectedSticker(stickerWithNewFlag);
            playSound(revealAudio);
        }, 1500);
    };

    return (
        <StickerContext.Provider value={{ collectedStickers, setCollectedStickers }}>
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
                        <button 
                            onClick={() => {
                                playSound(viewStickersAudio); // SE 再生
                                setPage("collection");
                            }} 
                            className="button collection-book-button"
                        >
                            CollectionBook
                        </button>
                        <div className="collected-stickers">
                            {todayStickers.map((sticker, index) => (
                                <div key={index} className="sticker-item" onClick={() => {setSelectedSticker(sticker); playSound(revealAudio);}}>
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
                    <CollectionBook goBack={() => setPage("main")} />
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
        </StickerContext.Provider>
    );
}

export default App;
