import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import './Header.css';

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">🗺️</span>
          <span className="logo-text">{t('app.name')}</span>
        </Link>
        
        <nav className="nav-links">
          <Link to="/">{t('common.home')}</Link>
          <Link to="/comparison">{t('dashboard.comparison')}</Link>
          <Link to="/about">{t('about.title')}</Link>
        </nav>

        <LanguageSelector />
      </div>
    </header>
  );
}
