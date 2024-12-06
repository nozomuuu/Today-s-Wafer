import React from 'react';
import PropTypes from 'prop-types';

const StickerPopup = ({ sticker, closePopup }) => {
  if (!sticker) return null;

  return (
    <div
      role="dialog"
      aria-label="Sticker Popup"
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
    >
      <button
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'default'
        }}
        onClick={closePopup}
        aria-label="Close popup background"
        type="button"
      />
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
          maxWidth: '300px',
          zIndex: 1001
        }}
        role="document"
      >
        <img
          src={sticker.image}
          alt={sticker.name}
          style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }}
        />
        <p>{sticker.name}</p>
        <button
          type="button"
          style={{
            marginTop: '8px',
            padding: '8px 16px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={closePopup}
          aria-label="Close popup"
        >
          Close
        </button>
      </div>
    </div>
  );
};

StickerPopup.defaultProps = {
  sticker: null
};

StickerPopup.propTypes = {
  sticker: PropTypes.shape({
    image: PropTypes.string,
    name: PropTypes.string
  }),
  closePopup: PropTypes.func.isRequired
};

export default StickerPopup;
