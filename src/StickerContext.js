import React, { createContext, useState, useEffect } from 'react';

export const StickerContext = createContext();

export const StickerProvider = ({ children }) => {
    const [collectedStickers, setCollectedStickers] = useState([]);

    // LocalStorageからデータをロード
    useEffect(() => {
        const savedStickers = JSON.parse(localStorage.getItem('collectedStickers')) || [];
        setCollectedStickers(savedStickers);
    }, []);

    // ステッカー情報をLocalStorageに保存
    useEffect(() => {
        localStorage.setItem('collectedStickers', JSON.stringify(collectedStickers));
    }, [collectedStickers]);

    const addSticker = (newSticker) => {
        setCollectedStickers((prevStickers) => {
            const updatedStickers = [...prevStickers];
            if (!updatedStickers.some(sticker => sticker.image === newSticker.image)) {
                updatedStickers.push({ ...newSticker, isNew: true });
            }
            return updatedStickers;
        });
    };

    const clearNewFlags = () => {
        setCollectedStickers((prevStickers) =>
            prevStickers.map(sticker => ({ ...sticker, isNew: false }))
        );
    };

    return (
        <StickerContext.Provider value={{ collectedStickers, addSticker, clearNewFlags }}>
            {children}
        </StickerContext.Provider>
    );
};
