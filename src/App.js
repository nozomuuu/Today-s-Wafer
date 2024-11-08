import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import './App.css';
import waferClosed from './images/wafer1.webp';
import waferOpened from './images/wafer2.webp';
import stickersData from './stickersData';
import openSound from './sounds/wafer-open.mp3';
import revealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';

const CollectionBook = lazy(() => import('./CollectionBook'));

function App() {
    const [isOpened, setIsOpened] = useState(false);
    const [remaining, setRemaining] = useState(() => {
        const savedRemaining = localStorage.getItem('remaining');
        return savedRemaining ? parseInt(savedRemaining, 10) : 3;
    });
    const [collectedStickers, setCollectedStickers] = useState(() => {
        const savedStickers = localStorage.getItem('collectedStickers');
        return savedStickers ? JSON.parse(savedStickers) : [];
    });
    const [todayStickers, setTodayStickers] = useState([]);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [page, setPage] = useState("main");
    const [showTomorrowMessage, setShowTomorrowMessage] = useState(false);
    const [isOpening, setIsOpening] = useState(false);

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

    useEffect(() => {
        localStorage.setItem('collectedStickers', JSON.stringify(collectedStickers));
    }, [collectedStickers]);

    useEffect(() => {
        localStorage.setItem('remaining', remaining.toString());
    }, [remaining]);

    const openWafer = useCallback(() => {
        if (remaining > 0 && !isOpening) {
            setIsOpening(true);
            new Audio(openSound).play();
            setIsOpened(true);
            setRemaining(prev => prev - 1);

            const newSticker = stickersData[Math.floor(Math.random() * stickersData.length)];
            setCollectedStickers(prev => [...prev, newSticker]);
            setTodayStickers(prev => [...prev, newSticker]);

            setTimeout(() => {
                setIsOpened(false);
                setSelectedSticker(newSticker);
                new Audio(revealSound).play();
                setIsOpening(false);
            }, 1500);
        } else if (remaining === 0) {
            setShowTomorrowMessage(true);
            setTimeout(() => setShowTomorrowMessage(false), 3000);
        }
    }, [remaining, isOpening, collectedStickers]);

    const handleCardClick = useCallback((event) => {
        if (event.target.classList.contains("wafer-image")) {
            new Audio(viewStickersSound).play();
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
                        new Audio(viewStickersSound).play();
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
                                    new Audio(revealSound).play();
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
                            new Audio(viewStickersSound).play();
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
