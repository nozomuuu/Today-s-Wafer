import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import './App.css';
import openSound from './sounds/wafer-open.mp3';
import revealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';
import { saveStickerToIndexedDB, getCollectedStickers } from './indexedDBHelper';
import stickersData from './stickersData';

const CollectionBook = lazy(() => import('./CollectionBook'));

const waferClosed = `${process.env.PUBLIC_URL}/images/stickers/wafer1.webp`;
const waferOpened = `${process.env.PUBLIC_URL}/images/stickers/wafer2.webp`;

function App() {
    const [isOpened, setIsOpened] = useState(false);
    const [remaining, setRemaining] = useState(() => {
        const savedRemaining = localStorage.getItem('remaining');
        return savedRemaining ? parseInt(savedRemaining, 10) : 3;
    });
    const [collectedStickers, setCollectedStickers] = useState([]);
    const [todayStickers, setTodayStickers] = useState([]);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [page, setPage] = useState("main");
    const [showTomorrowMessage, setShowTomorrowMessage] = useState(false);
    const [isOpening, setIsOpening] = useState(false);

    // useMemoで一度だけオーディオオブジェクトを生成
    const openAudio = useMemo(() => new Audio(openSound), []);
    const revealAudio = useMemo(() => new Audio(revealSound), []);
    const viewStickersAudio = useMemo(() => new Audio(viewStickersSound), []);

    useEffect(() => {
        const loadStickers = async () => {
            const stickers = await getCollectedStickers();
            if (stickers) {
                setCollectedStickers(stickers);
            }
        };
        loadStickers();
    }, []);

    useEffect(() => {
        localStorage.setItem('remaining', remaining.toString());
    }, [remaining]);

    const openWafer = useCallback(async () => {
        if (remaining > 0 && !isOpening) {
            setIsOpening(true);
            playSound(openAudio);
            setIsOpened(true);
            setRemaining(prev => prev - 1);

            const newSticker = stickersData[Math.floor(Math.random() * stickersData.length)];
            
            // 重複確認を追加
            if (!collectedStickers.some(sticker => sticker.image === newSticker.image)) {
                await saveStickerToIndexedDB(newSticker);
                setCollectedStickers(prev => [...prev, newSticker]);
                setTodayStickers(prev => [...prev, newSticker]);
            }

            setTimeout(() => {
                setIsOpened(false);
                setSelectedSticker(newSticker);
                playSound(revealAudio);
                setIsOpening(false);
            }, 1500);
        } else if (remaining === 0) {
            setShowTomorrowMessage(true);
            setTimeout(() => setShowTomorrowMessage(false), 3000);
        }
    }, [remaining, isOpening, openAudio, revealAudio, collectedStickers]);

    const handleCardClick = useCallback(() => {
        playSound(viewStickersAudio);
        setIsOpened(!isOpened);
    }, [isOpened, viewStickersAudio]);

    const playSound = (audio) => {
        audio.currentTime = 0;
        if (audio.paused) {
            audio.play().catch(error => {
                console.error("Audio playback failed:", error);
            });
        }
    };

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
                <Suspense fallback={<div>Loading...</div>}>
                    <CollectionBook
                        allStickers={stickersData}
                        ownedStickers={collectedStickers}
                        goBack={() => {
                            playSound(viewStickersAudio);
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
