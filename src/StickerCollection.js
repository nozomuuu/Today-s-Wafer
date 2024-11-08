// StickerCollection.js
import React from 'react';
import './StickerCollection.css';

function StickerCollection({ onBack }) {
    return (
        <div className="container">
            <h1 className="title">Sticker Collection</h1>
            <p>コレクション率: 95.8%</p>
            <button onClick={onBack} className="button">Back</button>
            <div className="sticker-collection">
                {/* コレクション表示のコンテンツをここに追加 */}
            </div>
        </div>
    );
}

export default StickerCollection;
