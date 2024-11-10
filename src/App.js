import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import './App.css';
import openSound from './sounds/wafer-open.mp3';
import revealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';
import stickersData from './stickersData';
import { openDatabase, saveSticker, getStickers } from './indexedDBHelper';

const CollectionBook = lazy(() => import('./CollectionBook'));

const waferClosed = `${process.env.PUBLIC_URL}/images/stickers/wafer1.webp`;
const waferOpened = `${process.env.PUBLIC_URL}/images/stickers/wafer2.webp`;

function App() {
    const [dbReady, setDbReady] = useState(false);
    const [isOpened, setIsOpened] = useState(false);
    const [remaining, setRemaining] = useState(3);
    const [collectedStickers, setCollectedStickers] = useState([]);
    const [todayStickers, setTodayStickers] = useState([]);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [page, setPage] = useState("main");
    const [showTomorrowMessage, setShowTomorrowMessage] = useState(false);
    const [isOpening, setIsOpening] = useState(false);

    useEffect(() => {
        openDatabase().then(() => {
            setDbReady(true);
            getStickers().then((stickers) => setCollectedStickers(stickers));
        }).catch(console.error);
    }, []);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const lastAccessDate = localStorage.getItem('lastAccessDate') || today;

        if (today !== lastAccessDate) {
            setRemaining(3);
            setTodayStickers([]);
            localStorage.setItem('lastAccessDate', today);
            localStorage.setItem('remaining', '3');
        }
    }, []);

    const playSound = (sound) => {
        const audio = new Audio(sound);
        audio.play().catch(error => {
            console.warn("Audio playback failed: ", error);
        });
    };

    const openWafer = useCallback(() => {
        if (remaining > 0 && !isOpening && dbReady) {
            setIsOpening(true);
            playSound(openSound);
            setIsOpened(true);
            setRemaining(prev => prev - 1);

            const newSticker = stickersData[Math.floor(Math.random() * stickersData.length)];
            saveSticker(newSticker).then(() => {
                setCollectedStickers(prev => [...prev, newSticker]);
                setTodayStickers(prev => [...prev, newSticker]);
            }).catch(console.error);

            setTimeout(() => {
                setIsOpened(false);
                setSelectedSticker(newSticker);
                playSound(revealSound);
                setIsOpening(false);
            }, 1500);
        } else if (remaining === 0) {
            setShowTomorrowMessage(true);
            setTimeout(() => setShowTomorrowMessage(false), 3000);
        }
    }, [remaining, isOpening, dbReady]);

    const handleCardClick = useCallback((event) => {
        if (event.target.classList.contains("wafer-image")) {
            playSound(viewStickersSound);
            setIsOpened(!isOpened);
        }
    }, [isOpened]);

    const closeStickerDetail = useCallback(() => setSelectedSticker(null), []);

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
                    <button onClick={openWafer} className="button" disabled={isOpening}>
                        {remaining > 0 ? 'Open a Wafer' : 'No More Wafers'}
                    </button>
                    <button onClick={() => {
                        playSound(viewStickersSound);
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
                                    playSound(revealSound);
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
            {page === "collection" && (
                <Suspense fallback={<div>Loading...</div>}>
                    <CollectionBook
                        allStickers={stickersData}
                        ownedStickers={collectedStickers}
                        goBack={() => {
                            playSound(viewStickersSound);
                            setPage("main");
                        }}
                    />
                </Suspense>
            )}
            {selectedSticker && (
                <div className="sticker-popup" onClick={closeStickerDetail}>
                    <div className="sticker-popup-content">
                        <img src={selectedSticker.image} alt="Selected Sticker" className="sticker-large" />
                        <button onClick={closeStickerDetail} className="button">Close</button>
                    </div>
                </div>
            )}
            {showTomorrowMessage && (
                <div className="popup">
                    <div className="popup-content">See you tomorrow!</div>
                </div>
            )}
        </div>
    );
}

export default App;
