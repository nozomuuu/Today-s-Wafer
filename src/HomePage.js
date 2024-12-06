import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => (
  <div className="home-page">
    <h1>Welcome to the Card Pack App</h1>
    <div className="button-container">
      <Link to="/wafer" className="link">
        <button className="home-button" type="button" aria-label="Open a Wafer">
          Open a Wafer
        </button>
      </Link>
      <Link to="/collection" className="link">
        <button className="home-button" type="button" aria-label="Open Collection Book">
          Collection Book
        </button>
      </Link>
    </div>
  </div>
);

export default HomePage;
