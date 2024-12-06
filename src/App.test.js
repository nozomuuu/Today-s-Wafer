import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import App from './App';
import stickersData from './stickersData';

jest.mock('./stickersData', () => [
  { image: 'sticker1.png', id: 1 },
  { image: 'sticker2.png', id: 2 }
]);

jest.mock('./sounds/sticker-reveal.mp3', () => 'sticker-reveal-sound.mp3');

describe('App Component', () => {
  it('renders the main page and displays the title', () => {
    const { getByText } = render(<App />);
    expect(getByText("Today's Wafer")).toBeInTheDocument();
  });

  it('allows the user to open a wafer and reveal a sticker', () => {
    const { getByText, getByAltText } = render(<App />);
    const openButton = getByText('Open a Wafer');
    fireEvent.click(openButton);

    const sticker = stickersData[0];
    setTimeout(() => {
      expect(getByAltText('Selected Sticker')).toHaveAttribute('src', sticker.image);
    }, 1500);
  });

  it('disables opening more wafers when remaining is 0', () => {
    const { getByText } = render(<App />);
    const openButton = getByText('Open a Wafer');

    for (let i = 0; i < 3; i += 1) {
      fireEvent.click(openButton);
    }

    expect(getByText('No More Wafers')).toBeInTheDocument();
    expect(openButton).toBeDisabled();
  });

  it('navigates to the CollectionBook page', () => {
    const { getByText } = render(<App />);
    const collectionButton = getByText('CollectionBook');
    fireEvent.click(collectionButton);

    expect(getByText('Back to Main')).toBeInTheDocument();
  });

  it('closes the sticker detail popup when the close button is clicked', () => {
    const { getByAltText, getByRole, queryByRole } = render(<App />);
    const openButton = getByAltText('Wafer');
    fireEvent.click(openButton);

    setTimeout(() => {
      const stickerPopup = getByRole('dialog');
      expect(stickerPopup).toBeInTheDocument();

      const closeButton = getByRole('button', { name: 'Close' });
      fireEvent.click(closeButton);

      expect(queryByRole('dialog')).not.toBeInTheDocument();
    }, 1500);
  });
});
