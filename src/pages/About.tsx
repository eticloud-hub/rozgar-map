import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './About.css';

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="about-page">
      <div className="about-container">
        <div className="about-header">
          <Link to="/" className="back-link">
            ← {t('common.back')}
          </Link>
          <h1>{t('about.title')}</h1>
        </div>

        <div className="about-content">
          <section className="about-section">
            <h2>{t('about.mission')}</h2>
            <p>{t('about.missionText')}</p>
          </section>

          <section className="about-section">
            <h2>{t('about.description')}</h2>
            <p>{t('about.purposeText')}</p>
          </section>

          <section className="about-section">
            <h2>{t('about.features')}</h2>
            <ul className="features-list">
              <li>📊 Real-time MGNREGA data visualization</li>
              <li>🗺️ District-level performance metrics</li>
              <li>📈 Historical trend analysis</li>
              <li>🔄 District comparison tools</li>
              <li>🗣️ Text-to-speech for accessibility</li>
              <li>🌍 Multilingual support (English, Hindi, Marathi)</li>
              <li>📱 Mobile-first responsive design</li>
              <li>⚡ Fast, cached data retrieval</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Data Source</h2>
            <p>
              All data is sourced from the official Government of India Open API (
              <a
                href="https://data.gov.in"
                target="_blank"
                rel="noopener noreferrer"
              >
                data.gov.in
              </a>
              ) under the Ministry of Rural Development. We update our database
              regularly to ensure you have the latest information.
            </p>
          </section>

          <section className="about-section">
            <h2>{t('about.ministry')}</h2>
            <p>
              MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) is
              India's largest social security and public works program. It guarantees
              100 days of wage employment per financial year to every rural household.
            </p>
            <p>
              Rozgar Map aims to make this crucial employment data accessible to every
              citizen, especially in rural areas.
            </p>
          </section>

          <section className="about-section about-contact">
            <h2>{t('about.contact')}</h2>
            <div className="contact-info">
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:team@rozgarmap.com">team@rozgarmap.com</a>
              </p>
              <p>
                <strong>Website:</strong>{' '}
                <a href="https://rozgarmap.com" target="_blank" rel="noopener noreferrer">
                  rozgarmap.com
                </a>
              </p>
              <p>
                <strong>Version:</strong> 1.0.0
              </p>
            </div>
          </section>

          <section className="about-section about-footer-text">
            <p className="disclaimer">
              Rozgar Map is an independent initiative to visualize and democratize
              government employment data. It is not affiliated with any political party
              or organization.
            </p>
            <p className="copyright">
              © 2025 Rozgar Map. Built with ❤️ for rural India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
