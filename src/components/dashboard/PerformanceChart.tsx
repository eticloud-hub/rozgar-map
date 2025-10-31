import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlyTrendData } from '../../types';
import './PerformanceChart.css';

interface PerformanceChartProps {
  data: MonthlyTrendData[];
  type?: 'line' | 'bar';
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  type = 'line',
}) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <p className="no-data-message">{t('dashboard.noData')}</p>
      </div>
    );
  }

  const commonProps = {
    data,
    margin: { top: 5, right: 30, left: 0, bottom: 5 },
  };

  const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '10px',
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">{t('dashboard.monthlyTrend')}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' ? (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => value?.toLocaleString?.() || value}
            />
            <Legend />
            {data[0]?.workforce && (
              <Line
                type="monotone"
                dataKey="workforce"
                stroke="#667eea"
                strokeWidth={2}
                dot={{ fill: '#667eea', r: 4 }}
                activeDot={{ r: 6 }}
                name={t('comparison.workforce')}
              />
            )}
            {data[0]?.budget && (
              <Line
                type="monotone"
                dataKey="budget"
                stroke="#764ba2"
                strokeWidth={2}
                dot={{ fill: '#764ba2', r: 4 }}
                activeDot={{ r: 6 }}
                name={t('common.noResults')}
              />
            )}
          </LineChart>
        ) : (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            {data[0]?.workforce && (
              <Bar dataKey="workforce" fill="#667eea" name={t('comparison.workforce')} />
            )}
            {data[0]?.budget && (
              <Bar dataKey="budget" fill="#764ba2" name={t('common.noResults')} />
            )}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
