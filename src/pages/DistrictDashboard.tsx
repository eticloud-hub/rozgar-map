import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MetricCard from '../components/dashboard/MetricCard';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import type { MonthlyTrendData } from '../types';
import './DistrictDashboard.css';

const DistrictDashboard: React.FC = () => {
  const { districtId } = useParams<{ districtId: string }>();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls later
  const districtData = {
    district: 'Pune',
    state: 'Maharashtra',
    familiesEmployed: 125000,
    previousFamilies: 120000,
    personDays: 2500000,
    previousPersonDays: 2400000,
    expenditure: 450000000,
    previousExpenditure: 440000000,
    wagesPaid: 380000000,
    previousWages: 370000000,
    assetsCreated: 850,
    previousAssets: 820,
  };

  const monthlyData: MonthlyTrendData[] = [
    { month: 'Jan', workforce: 100000, budget: 400000000 },
    { month: 'Feb', workforce: 105000, budget: 410000000 },
    { month: 'Mar', workforce: 110000, budget: 420000000 },
    { month: 'Apr', workforce: 115000, budget: 430000000 },
    { month: 'May', workforce: 120000, budget: 440000000 },
    { month: 'Jun', workforce: 125000, budget: 450000000 },
    { month: 'Jul', workforce: 128000, budget: 460000000 },
    { month: 'Aug', workforce: 130000, budget: 470000000 },
    { month: 'Sep', workforce: 132000, budget: 475000000 },
    { month: 'Oct', workforce: 135000, budget: 480000000 },
    { month: 'Nov', workforce: 133000, budget: 485000000 },
    { month: 'Dec', workforce: 125000, budget: 450000000 },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <Link to="/" className="back-link">
            ← {t('common.back')}
          </Link>
          <div className="header-title-section">
            <h1>{t('dashboard.title')}</h1>
            <p className="district-info">
              {districtData.district}, {districtData.state}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t('dashboard.loading')}</p>
          </div>
        ) : (
          <>
            <div className="metrics-grid">
              <MetricCard
                icon="👨‍👩‍👧‍👦"
                label={t('dashboard.familiesEmployed')}
                value={districtData.familiesEmployed}
                unit={t('units.families')}
                previousValue={districtData.previousFamilies}
              />
              <MetricCard
                icon="📅"
                label={t('dashboard.personDays')}
                value={districtData.personDays}
                unit={t('units.days')}
                previousValue={districtData.previousPersonDays}
              />
              <MetricCard
                icon="💰"
                label={t('dashboard.expenditure')}
                value={districtData.expenditure}
                unit={t('units.crores')}
                previousValue={districtData.previousExpenditure}
              />
              <MetricCard
                icon="💵"
                label={t('dashboard.wagesPaid')}
                value={districtData.wagesPaid}
                unit={t('units.crores')}
                previousValue={districtData.previousWages}
              />
              <MetricCard
                icon="🏗️"
                label={t('dashboard.assetsCreated')}
                value={districtData.assetsCreated}
                unit={t('units.works')}
                previousValue={districtData.previousAssets}
              />
            </div>

            <PerformanceChart data={monthlyData} type="line" />

            <div className="action-section">
              <Link to="/comparison" className="action-button">
                📊 {t('dashboard.comparison')}
              </Link>
              <Link to="/" className="action-button secondary">
                🏠 {t('common.home')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DistrictDashboard;
