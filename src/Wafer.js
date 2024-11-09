import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import wafer2 from './images/stickers/wafer2.webp';

const Wafer = ({ addSticker }) => {
    const [waferOpened, setWaferOpened] = useState(false);
    const navigate = useNavigate();

    const handleOpenWafer = () => {
        setWaferOpened(true);
        const newSticker = { image: wafer2 };
        addSticker(newSticker);
    };

    return (
        <div className="wafer-screen">
            <h1>Today's Wafer</h1>
            {waferOpened ? (
                <img src={wafer2} alt="Opened Wafer" className="wafer-image" />
            ) : (
                <button onClick={handleOpenWafer}>Open a Wafer</button>
            )}
            <button onClick={() => navigate("/collectionbook")}>CollectionBook</button>
        </div>
    );
};

export default Wafer;
