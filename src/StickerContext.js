import React, { createContext, useState, useEffect, useMemo } from 'react';

export const StickerContext = createContext();

export const StickerProvider = ({ children }) => {
  const [collectedStickers, setCollectedStickers] = useState(() => {
    const savedStickers = JSON.parse(localStorage.getItem('collectedStickers')) || [];
    return savedStickers;
  });

  useEffect(() => {
    localStorage.setItem('collectedStickers', JSON.stringify(collectedStickers));
  }, [collectedStickers]);

  const addSticker = (newSticker) => {
    setCollectedStickers((prevStickers) => {
      const updatedStickers = [...prevStickers];
      if (!updatedStickers.some((sticker) => sticker.image === newSticker.image)) {
        updatedStickers.push({ ...newSticker, isNew: true });
      }
      return updatedStickers;
    });
  };

  const clearNewFlags = () => {
    setCollectedStickers((prevStickers) =>
      prevStickers.map((sticker) => ({ ...sticker, isNew: false }))
    );
  };

  const contextValue = useMemo(
    () => ({ collectedStickers, addSticker, clearNewFlags }),
    [collectedStickers]
  );

  return <StickerContext.Provider value={contextValue}>{children}</StickerContext.Provider>;
};
