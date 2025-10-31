import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useVoiceNarration } from '../../hooks/useVoiceNarration';
import type { MGNREGAMetrics } from '../../types';
import './MetricCard.css';

interface MetricCardProps {
  icon: string;
  label: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  previousValue?: number;
  description?: string;
  showTrend?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  unit = '',
  trend,
  previousValue,
  description,
  showTrend = true,
}) => {
  const { t, i18n } = useTranslation();
  const { narrate, isSpeaking } = useVoiceNarration();
  const [isExpanded, setIsExpanded] = useState(false);

  const percentageChange = useMemo(() => {
    if (!previousValue || previousValue === 0) return null;
    return ((value - previousValue) / previousValue) * 100;
  }, [value, previousValue]);

  const getTrendDirection = useMemo(() => {
    if (trend) return trend;
    if (percentageChange === null) return 'stable';
    if (percentageChange > 5) return 'up';
    if (percentageChange < -5) return 'down';
    return 'stable';
  }, [trend, percentageChange]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  const handleNarrate = () => {
    const text = `${label}, ${formatNumber(value)} ${unit}${percentageChange ? `, ${percentageChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(percentageChange).toFixed(1)} percent` : ''}`;
    narrate(text);
  };

  return (
    <div className={`metric-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="metric-header">
        <div className="metric-icon-section">
          <span className="metric-icon">{icon}</span>
        </div>

        <div className="metric-top-right">
          <button
            className={`narrate-button ${isSpeaking ? 'speaking' : ''}`}
            onClick={handleNarrate}
            title={t('audio.readThis')}
          >
            {isSpeaking ? '⏹️' : '🔊'}
          </button>
          <button
            className="expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '✕' : '⋯'}
          </button>
        </div>
      </div>

      <div className="metric-body">
        <h3 className="metric-label">{label}</h3>
        <p className="metric-value">
          {formatNumber(value)}
          <span className="metric-unit">{unit}</span>
        </p>

        {showTrend && percentageChange !== null && (
          <div className={`metric-trend trend-${getTrendDirection}`}>
            <span className="trend-icon">
              {getTrendDirection === 'up' ? '📈' : getTrendDirection === 'down' ? '📉' : '➡️'}
            </span>
            <span className="trend-text">
              {Math.abs(percentageChange).toFixed(1)}% {getTrendDirection === 'up' ? t('metrics.improvement') : getTrendDirection === 'down' ? t('metrics.decline') : t('metrics.stable')}
            </span>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="metric-expanded">
          {description && <p className="metric-description">{description}</p>}
          {previousValue && (
            <p className="metric-comparison">
              {t('metrics.lastMonth')}: {formatNumber(previousValue)} {unit}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
