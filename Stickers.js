import React, { useState, useEffect } from 'react';

const Stickers = () => {
  const [stickers, setStickers] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5005/get-stickers')
      .then((response) => response.json())
      .then((data) => setStickers(data))
      .catch((error) => console.error('Error fetching stickers:', error));
  }, []);

  return (
    <div>
      <h1>Stickers</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {stickers.map((sticker) => (
          <div key={sticker.id} style={{ margin: '10px' }}>
            <p>{sticker.name}</p>
            <img
              src={sticker.webContentLink}
              alt={sticker.name}
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />
            <br />
            <a
              href={sticker.webContentLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stickers;
