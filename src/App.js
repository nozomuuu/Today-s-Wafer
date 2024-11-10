// import 文などの設定は現状のまま
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import './App.css';
import openSound from './sounds/wafer-open.mp3';
import revealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';
import stickersData from './stickersData';
import Cookies from 'js-cookie'; // 必要な場合には js-cookie ライブラリをインストール

const CollectionBook = lazy(() => import('./CollectionBook'));

const waferClosed = `${process.env.PUBLIC_URL}/images/stickers/wafer1.webp`;
const waferOpened = `${process.env.PUBLIC_URL}/images/stickers/wafer2.webp`;

function App() {
    const [isOpened, setIsOpened] = useState(false);
    const [remaining, setRemaining] = useState(() => {
        const savedRemaining = Cookies.get('remaining');
        return savedRemaining ? parseInt(savedRemaining, 10) : 3;
    });
    const [collectedStickers, setCollectedStickers] = useState(() => {
        const savedStickers = Cookies.get('collectedStickers');
        return savedStickers ? JSON.parse(savedStickers) : [];
    });
    const [todayStickers, setTodayStickers] = useState([]);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [page, setPage] = useState("main");
    const [showTomorrowMessage, setShowTomorrowMessage] = useState(false);
    const [isOpening, setIsOpening] = useState(false);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const lastAccessDate = Cookies.get('lastAccessDate') || today;

        if (today !== lastAccessDate) {
            setRemaining(3);
            setTodayStickers([]);
            Cookies.set('lastAccessDate', today, { expires: 365 });
            Cookies.set('remaining', '3', { expires: 365 });
        }
    }, []);

    useEffect(() => {
        Cookies.set('collectedStickers', JSON.stringify(collectedStickers), { expires: 365 });
    }, [collectedStickers]);

    useEffect(() => {
        Cookies.set('remaining', remaining.toString(), { expires: 365 });
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
    }, [remaining, isOpening]);

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
