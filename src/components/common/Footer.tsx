import { useTranslation } from 'react-i18next';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>{t('app.name')}</h3>
          <p>{t('app.description')}</p>
        </div>

        <div className="footer-section">
          <h4>{t('about.ministry')}</h4>
          <p>{t('about.dataSource')}: data.gov.in</p>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: team@rozgarmap.com</p>
          <p>Website: rozgarmap.com</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Rozgar Map. {t('common.noResults')}.</p>
      </div>
    </footer>
  );
}
