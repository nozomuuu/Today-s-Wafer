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
        const data = JSON.parse(localStorage.getItem(key));
        return data || [];
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

function App() {
    const [isOpened, setIsOpened] = useState(false);
    const [remaining, setRemaining] = useState(Infinity); // 無制限の設定
    const [collectedStickers, setCollectedStickers] = useState(loadFromLocalStorage('collectedStickers'));
    const [todayStickers, setTodayStickers] = useState([]);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [page, setPage] = useState("main");

    // 音声オブジェクトの作成
    const openAudio = new Audio(openSound);
    const revealAudio = new Audio(revealSound);
    const viewStickersAudio = new Audio(viewStickersSound);

    useEffect(() => {
        // 初期化時にローカルストレージから読み込み
        setCollectedStickers(loadFromLocalStorage('collectedStickers'));
    }, []);

    // collectedStickersが更新されたらローカルストレージに保存
    useEffect(() => {
        saveToLocalStorage('collectedStickers', collectedStickers);
    }, [collectedStickers]);

    // ウエハースを開ける処理
    const openWafer = () => {
        playSound(openAudio);
        setIsOpened(true);
        const newSticker = stickersData[Math.floor(Math.random() * stickersData.length)];

        // 重複をチェックしてステッカーを追加
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

    // カードのクリックイベントを処理
    const handleCardClick = (event) => {
        if (event.target.classList.contains("wafer-image")) {
            playSound(viewStickersAudio);
            setIsOpened(!isOpened);
        }
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
                        onClick={handleCardClick} 
                    />
                    <p>Remaining: {remaining}</p>
                    <button onClick={openWafer} className="button">
                        Open a Wafer
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
                <CollectionBook
                    allStickers={stickersData}
                    ownedStickers={collectedStickers}
                    goBack={() => setPage("main")}
                />
            )}
            {selectedSticker && (
                <div className="sticker-popup" onClick={() => setSelectedSticker(null)}>
                    <div className="sticker-popup-content">
                        <img src={selectedSticker.image} alt="Selected Sticker" className="sticker-large" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
