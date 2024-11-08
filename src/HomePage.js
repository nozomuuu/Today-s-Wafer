import React from 'react';
import { Link } from 'react-router-dom';

function HomePage({ setPage }) {
  return (
    <div className="home-page">
      <h1>Welcome to the Card Pack App</h1>
      <button onClick={() => setPage('wafer')}>
        <Link to="/wafer">Open a Wafer</Link>
      </button>
      <button onClick={() => setPage('collection')}>
        <Link to="/collection">Collection Book</Link>
      </button>
    </div>
  );
}

export default HomePage;
