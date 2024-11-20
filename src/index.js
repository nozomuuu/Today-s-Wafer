import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { StickerProvider } from './StickerContext';

ReactDOM.render(
    <StickerProvider>
        <App />
    </StickerProvider>,
    document.getElementById('root')
);
