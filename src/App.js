import stickersData from './stickersData';
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import './App.css';
import openSound from './sounds/wafer-open.mp3';
import revealSound from './sounds/sticker-reveal.mp3';
import viewStickersSound from './sounds/view-stickers.mp3';

const CollectionBook = lazy(() => import('./CollectionBook'));

const waferClosed = `${process.env.PUBLIC_URL}/images/stickers/wafer1.webp`;
const waferOpened = `${process.env.PUBLIC_URL}/images/stickers/wafer2.webp`;

function App() {
    // 初期状態の設定
    const [isOpened, setIsOpened] = useState(false);
    const [remaining, setRemaining] = useState(() => {
        try {
            const savedRemaining = localStorage.getItem('remaining');
            return savedRemaining ? parseInt(savedRemaining, 10) : 3;
        } catch (error) {
            console.error('Failed to load remaining from localStorage:', error);
            return 3;
        }
    });
    const [collectedStickers, setCollectedStickers] = useState(() => {
        try {
            const savedStickers = localStorage.getItem('collectedStickers');
            return savedStickers ? JSON.parse(savedStickers) : [];
        } catch (error) {
            console.error('Failed to load collectedStickers from localStorage:', error);
            return [];
        }
    });
    const [todayStickers, setTodayStickers] = useState([]);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [page, setPage] = useState("main");
    const [showTomorrowMessage, setShowTomorrowMessage] = useState(false);
    const [isOpening, setIsOpening] = useState(false);

    // 日付チェックとリセット
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const lastAccessDate = localStorage.getItem('lastAccessDate') || today;

        if (today !== lastAccessDate) {
            setRemaining(3);
            setTodayStickers([]);
            try {
                localStorage.setItem('lastAccessDate', today);
                localStorage.setItem('remaining', '3');
            } catch (error) {
                console.error('Failed to set initial values in localStorage:', error);
            }
        }
    }, []);

    // collectedStickers の変更時にローカルストレージに保存し、ログを表示
    useEffect(() => {
        try {
            localStorage.setItem('collectedStickers', JSON.stringify(collectedStickers));
            console.log('Collected Stickers saved to localStorage:', localStorage.getItem('collectedStickers'));
        } catch (error) {
            console.error('Failed to save collectedStickers to localStorage:', error);
        }
    }, [collectedStickers]);

    // remaining の変更時にローカルストレージに保存
    useEffect(() => {
        try {
            localStorage.setItem('remaining', remaining.toString());
        } catch (error) {
            console.error('Failed to save remaining to localStorage:', error);
        }
    }, [remaining]);

    // ウェハーを開ける処理
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

    // ウェハーのクリック処理
    const handleCardClick = useCallback((event) => {
        if (event.target.classList.contains("wafer-image")) {
            new Audio(viewStickersSound).play();
            setIsOpened(!isOpened);
        }
    }, [isOpened]);

    // ステッカー詳細を閉じる処理
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
