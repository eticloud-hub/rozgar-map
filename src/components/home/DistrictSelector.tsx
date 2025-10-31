import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { District } from '../../types';
import './DistrictSelector.css';

interface DistrictSelectorProps {
  onSelect: (district: District) => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Maharashtra', 'Madhya Pradesh', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Tripura', 'Telangana', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar', 'Chandigarh',
  'Dadra and Nagar Haveli', 'Daman and Diu', 'Jammu and Kashmir',
  'Lakshadweep', 'Ladakh', 'Puducherry',
];

const MAHARASHTRA_DISTRICTS = [
  'Ahilyanagar', 'Akola', 'Amravati', 'Beed', 'Bhandara', 'Buldhana',
  'Chandrapur', 'Chhatrapati Sambhajinagar', 'Dharashiv', 'Dhule',
  'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur',
  'Latur', 'Mumbai', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar',
  'Nashik', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli',
  'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal',
];

const DistrictSelector = ({ onSelect }: DistrictSelectorProps) => {
  const { t } = useTranslation();
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const getDistrictsForState = (state: string): string[] => {
    if (state === 'Maharashtra') {
      return MAHARASHTRA_DISTRICTS;
    }
    return [];
  };

  const filteredDistricts = useMemo(
    () => (selectedState ? getDistrictsForState(selectedState) : []),
    [selectedState]
  );

  useEffect(() => {
    if (selectedState && selectedDistrict) {
      onSelect({
        state: selectedState,
        district: selectedDistrict,
        id: `${selectedState.replace(/\s/g, '-')}-${selectedDistrict.replace(/\s/g, '-')}`,
      });
    }
  }, [selectedState, selectedDistrict, onSelect]);

  return (
    <div className="district-selector">
      <div className="selector-group">
        <label htmlFor="state">{t('home.selectState')}</label>
        <select
          id="state"
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            setSelectedDistrict('');
          }}
          className="selector-input"
        >
          <option value="">{t('home.selectState')}</option>
          {INDIAN_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {selectedState && (
        <div className="selector-group">
          <label htmlFor="district">{t('home.selectDistrictDropdown')}</label>
          <select
            id="district"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="selector-input"
          >
            <option value="">{t('home.selectDistrictDropdown')}</option>
            {filteredDistricts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default DistrictSelector;
