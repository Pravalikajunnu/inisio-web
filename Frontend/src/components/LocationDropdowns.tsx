import React, { useState, useEffect } from 'react';
import { INDIA_STATES_AND_UTS, OTHER_OPTION } from '../data/indiaLocations';
import { MapPin } from 'lucide-react';

interface LocationDropdownsProps {
  value: string;
  onChange: (location: string) => void;
  required?: boolean;
  className?: string;
  labelClass?: string;
}

export const LocationDropdowns: React.FC<LocationDropdownsProps> = ({
  value,
  onChange,
  required = true,
  className = '',
  labelClass = 'block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2'
}) => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [customLocation, setCustomLocation] = useState<string>('');

  // Sync state whenever value changes
  useEffect(() => {
    if (!value || !value.trim()) {
      setSelectedState('');
      setSelectedDistrict('');
      setCustomLocation('');
      return;
    }

    const trimmed = value.trim();

    // Case 1: Format "District, State" (e.g. "Hyderabad, Telangana", "Ahmedabad, Gujarat")
    const commaParts = trimmed.split(',').map(s => s.trim());
    if (commaParts.length >= 2) {
      const statePart = commaParts[commaParts.length - 1];
      const distPart = commaParts.slice(0, commaParts.length - 1).join(', ');

      const matchState = INDIA_STATES_AND_UTS.find(
        s => s.name.toLowerCase() === statePart.toLowerCase()
      );

      if (matchState) {
        setSelectedState(matchState.name);
        const matchDistrict = matchState.districts.find(
          d => d.toLowerCase() === distPart.toLowerCase()
        );
        if (matchDistrict) {
          setSelectedDistrict(matchDistrict);
          setCustomLocation('');
        } else {
          setSelectedDistrict(OTHER_OPTION);
          setCustomLocation(distPart);
        }
        return;
      }
    }

    // Case 2: Format "State (City/Zone)" (e.g. "Gujarat (Dholera SIR)", "Telangana (Genome Valley)")
    const parenMatch = trimmed.match(/^([^(]+)\s*\(([^)]+)\)$/);
    if (parenMatch) {
      const possibleState = parenMatch[1].trim();
      const possibleSub = parenMatch[2].trim();
      const matchState = INDIA_STATES_AND_UTS.find(
        s => s.name.toLowerCase() === possibleState.toLowerCase()
      );
      if (matchState) {
        setSelectedState(matchState.name);
        const matchDistrict = matchState.districts.find(
          d => d.toLowerCase() === possibleSub.toLowerCase()
        );
        if (matchDistrict) {
          setSelectedDistrict(matchDistrict);
          setCustomLocation('');
        } else {
          setSelectedDistrict(OTHER_OPTION);
          setCustomLocation(possibleSub);
        }
        return;
      }
    }

    // Case 3: Just State name
    const matchStateDirect = INDIA_STATES_AND_UTS.find(
      s => s.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (matchStateDirect) {
      setSelectedState(matchStateDirect.name);
      setSelectedDistrict('');
      setCustomLocation('');
      return;
    }

    // Case 4: Search all districts across all states
    let foundStateForDistrict: string | null = null;
    let foundDistrictName: string | null = null;
    for (const st of INDIA_STATES_AND_UTS) {
      const dMatch = st.districts.find(d => d.toLowerCase() === trimmed.toLowerCase());
      if (dMatch) {
        foundStateForDistrict = st.name;
        foundDistrictName = dMatch;
        break;
      }
    }
    if (foundStateForDistrict && foundDistrictName) {
      setSelectedState(foundStateForDistrict);
      setSelectedDistrict(foundDistrictName);
      setCustomLocation('');
      return;
    }

    // Case 5: Custom location not in list
    setSelectedState(OTHER_OPTION);
    setSelectedDistrict(OTHER_OPTION);
    setCustomLocation(trimmed);
  }, [value]);

  const currentStateObj = INDIA_STATES_AND_UTS.find(s => s.name === selectedState);
  const districtList = currentStateObj ? currentStateObj.districts : [];

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateVal = e.target.value;
    setSelectedState(stateVal);
    setSelectedDistrict('');
    setCustomLocation('');

    if (stateVal === OTHER_OPTION) {
      onChange('');
    } else {
      onChange(stateVal);
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distVal = e.target.value;
    setSelectedDistrict(distVal);

    if (distVal === OTHER_OPTION) {
      if (customLocation) {
        onChange(`${customLocation}, ${selectedState}`);
      } else {
        onChange(selectedState);
      }
    } else if (distVal && selectedState) {
      onChange(`${distVal}, ${selectedState}`);
    } else {
      onChange(selectedState);
    }
  };

  const handleCustomLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomLocation(val);
    if (selectedState === OTHER_OPTION) {
      onChange(val);
    } else if (selectedDistrict === OTHER_OPTION) {
      onChange(val ? `${val}, ${selectedState}` : selectedState);
    }
  };

  const isCustomState = selectedState === OTHER_OPTION;
  const isCustomDistrict = selectedDistrict === OTHER_OPTION;
  const showCustomInput = isCustomState || isCustomDistrict;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Select State / UT */}
        <div>
          <label className={labelClass}>
            Select State / UT {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <select
              value={selectedState}
              onChange={handleStateChange}
              required={required}
              className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-base sm:text-sm font-medium cursor-pointer ${
                selectedState ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              <option value="" disabled hidden>
                -- Select State / UT --
              </option>
              <optgroup label="── 28 States of India ──">
                {INDIA_STATES_AND_UTS.filter(s => s.type === 'State').map(s => (
                  <option key={s.name} value={s.name} className="text-gray-900">
                    {s.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="── 8 Union Territories ──">
                {INDIA_STATES_AND_UTS.filter(s => s.type === 'UT').map(s => (
                  <option key={s.name} value={s.name} className="text-gray-900">
                    {s.name} (UT)
                  </option>
                ))}
              </optgroup>
              <optgroup label="── Other Option ──">
                <option value={OTHER_OPTION} className="text-gray-900 font-semibold">
                  {OTHER_OPTION}
                </option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Select District / City */}
        <div>
          <label className={labelClass}>
            Select District / City {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              disabled={!selectedState || isCustomState}
              required={required && !isCustomState}
              className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-base sm:text-sm font-medium ${
                !selectedState || isCustomState
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : selectedDistrict
                  ? 'text-gray-900 cursor-pointer'
                  : 'text-gray-400 cursor-pointer'
              }`}
            >
              <option value="" disabled hidden>
                {selectedState ? '-- Select District / City --' : 'Select State First'}
              </option>
              {districtList.map(dist => (
                <option key={dist} value={dist} className="text-gray-900">
                  {dist}
                </option>
              ))}
              {selectedState && !isCustomState && (
                <option value={OTHER_OPTION} className="text-gray-900 font-semibold border-t border-gray-200">
                  {OTHER_OPTION}
                </option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Custom Location Input when "Other / Custom Location" is chosen */}
      {showCustomInput && (
        <div className="animate-in fade-in duration-200">
          <label className="block text-xs font-semibold text-blue-700 mb-1.5">
            Specify Custom Location Details:
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-blue-600 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={customLocation}
              onChange={handleCustomLocationChange}
              placeholder={isCustomState ? 'Enter full State / City details' : 'Enter District / City / Industrial Zone'}
              required={required}
              className="w-full pl-10 pr-4 py-2.5 bg-blue-50/50 border border-blue-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-base sm:text-sm font-medium text-gray-900"
            />
          </div>
        </div>
      )}
    </div>
  );
};
