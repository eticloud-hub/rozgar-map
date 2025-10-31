import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import DistrictSelector from '../components/home/DistrictSelector';
import type { District } from '../types';
import './ComparisonView.css';

const ComparisonView: React.FC = () => {
  const { t } = useTranslation();
  const [first, setFirst] = useState<District | null>(null);
  const [second, setSecond] = useState<District | null>(null);

  // Mock comparison data
  const barData = [
    { district: 'Pune', workforce: 125000, projects: 1200, efficiency: 92 },
    { district: 'Nashik', workforce: 85000, projects: 850, efficiency: 78 },
    { district: 'Nagpur', workforce: 105000, projects: 950, efficiency: 85 },
  ];

  const radarData = [
    { category: t('comparison.workforce'), value: 80 },
    { category: t('comparison.projects'), value: 75 },
    { category: t('comparison.budget'), value: 85 },
    { category: 'Completion', value: 70 },
    { category: t('comparison.efficiency'), value: 88 },
  ];

  const swapDistricts = () => {
    const temp = first;
    setFirst(second);
    setSecond(temp);
  };

  const resetComparison = () => {
    setFirst(null);
    setSecond(null);
  };

  return (
    <div className="comparison-page">
      <div className="comparison-container">
        <div className="comparison-header">
          <Link to="/" className="back-link">
            ← {t('common.back')}
          </Link>
          <h1>{t('comparison.title')}</h1>
        </div>

        <div className="selector-row">
          <div className="selector-column">
            <label>{t('comparison.selectFirst')}</label>
            <DistrictSelector onSelect={setFirst} />
            {first && <p className="selected-text">✓ {first.district}</p>}
          </div>

          <button className="swap-button" onClick={swapDistricts} title="Swap districts">
            ⇄
          </button>

          <div className="selector-column">
            <label>{t('comparison.selectSecond')}</label>
            <DistrictSelector onSelect={setSecond} />
            {second && <p className="selected-text">✓ {second.district}</p>}
          </div>
        </div>

        {(first || second) && (
          <button className="reset-button" onClick={resetComparison}>
            🔄 {t('comparison.reset')}
          </button>
        )}

        {first && second && (
          <div className="charts-section">
            <div className="chart-wrapper">
              <h3>Workforce & Projects Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="district" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="workforce" fill="#667eea" name={t('comparison.workforce')} />
                  <Bar dataKey="projects" fill="#764ba2" name={t('comparison.projects')} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-wrapper">
              <h3>Performance Metrics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#667eea"
                    fill="#667eea"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="comparison-table">
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>{first.district}</th>
                    <th>{second.district}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{t('comparison.workforce')}</td>
                    <td>125,000</td>
                    <td>85,000</td>
                  </tr>
                  <tr>
                    <td>{t('comparison.projects')}</td>
                    <td>1,200</td>
                    <td>850</td>
                  </tr>
                  <tr>
                    <td>{t('comparison.budget')}</td>
                    <td>₹450 Cr</td>
                    <td>₹280 Cr</td>
                  </tr>
                  <tr>
                    <td>{t('comparison.efficiency')}</td>
                    <td>92%</td>
                    <td>78%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!first && !second && (
          <div className="empty-state">
            <p>👉 {t('comparison.noData')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonView;
