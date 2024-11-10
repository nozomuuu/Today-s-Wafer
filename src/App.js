import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import './App.css';
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
        async function loadData() {
            try {
                await openDatabase();
                setDbReady(true);
                const stickers = await getStickers();
                console.log("Stickers loaded from IndexedDB:", stickers);
                setCollectedStickers(stickers);
            } catch (error) {
                console.error("Failed to load stickers. Retrying...", error);
                setTimeout(loadData, 1000); // 1秒後に再試行
            }
        }

        loadData();
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

    const openWafer = useCallback(() => {
        if (remaining > 0 && !isOpening && dbReady) {
            setIsOpening(true);
            // playSound(openSound); // 音声再生を一時的にコメントアウト
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
                // playSound(revealSound); // 音声再生を一時的にコメントアウト
                setIsOpening(false);
            }, 1500);
        } else if (remaining === 0) {
            setShowTomorrowMessage(true);
            setTimeout(() => setShowTomorrowMessage(false), 3000);
        }
    }, [remaining, isOpening, dbReady]);

    const handleCardClick = useCallback(() => {
        setIsOpened(!isOpened);
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
                    <button onClick={() => setPage("collection")} className="button">
                        CollectionBook
                    </button>
                    <div className="collected-stickers">
                        {todayStickers.map((sticker, index) => (
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
                <Suspense fallback={<div>Loading...</div>}>
                    <CollectionBook
                        allStickers={stickersData}
                        ownedStickers={collectedStickers}
                        goBack={() => setPage("main")}
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
