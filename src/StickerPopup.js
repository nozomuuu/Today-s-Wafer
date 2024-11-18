import React from 'react';
import './CollectionBook.css';

function StickerPopup({ sticker, closePopup }) {
    return (
        <div className="popup">
            <div className="popup-content">
                <img src={sticker.image} alt="Selected Sticker" className="popup-image" />
                {sticker.isNew && <div className="popup-new-badge">NEW</div>}
                <button onClick={closePopup} className="close-popup-button">Close</button>
            </div>
        </div>
    );
}

export default StickerPopup;
