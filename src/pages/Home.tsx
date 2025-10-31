import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DistrictSelector from '../components/home/DistrictSelector';
import type { District } from '../types';
import './Home.css';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  const handleDistrictSelect = (district: District): void => {
    setSelectedDistrict(district);
  };

  const viewDashboard = (): void => {
    if (selectedDistrict) {
      navigate(`/dashboard/${selectedDistrict.id}`);
    }
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="hero-section">
          <h1 className="hero-title">{t('home.welcome')}</h1>
          <p className="hero-subtitle">{t('app.tagline')}</p>
          <p className="hero-description">{t('home.helpText')}</p>
        </div>

        <div className="selector-card">
          <div className="selector-header">
            <h2>{t('home.selectDistrict')}</h2>
            <p className="selector-hint">👇 {t('home.helpText')}</p>
          </div>
          
          <DistrictSelector onSelect={handleDistrictSelect} />
        </div>

        {selectedDistrict && (
          <div className="selection-result">
            <div className="result-card">
              <div className="result-icon">✅</div>
              <div className="result-content">
                <p className="result-label">Selected District:</p>
                <p className="result-value">
                  {selectedDistrict.district}, {selectedDistrict.state}
                </p>
              </div>
              <button onClick={viewDashboard} className="primary-button">
                {t('home.viewDashboard')} →
              </button>
            </div>
          </div>
        )}

        <div className="features-section">
          <h3>{t('about.features')}</h3>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <h4>Real-Time Data</h4>
              <p>Latest employment metrics for your district</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🗣️</span>
              <h4>Text-to-Speech</h4>
              <p>Listen to data in your preferred language</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌍</span>
              <h4>Multilingual</h4>
              <p>Available in English, Hindi, and Marathi</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <h4>Mobile-First</h4>
              <p>Works smoothly on all devices</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
