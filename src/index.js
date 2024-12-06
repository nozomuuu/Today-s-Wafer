import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

// containerがnullかどうかをチェック
if (!container) {
  console.error('No root element found. Ensure your HTML file has an element with id "root".');
} else {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
