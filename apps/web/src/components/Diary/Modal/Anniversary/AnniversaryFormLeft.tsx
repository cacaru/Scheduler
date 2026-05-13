import React from 'react';
import MiniCalendar from '../../../common/MiniCalendar/MiniCalendar';
import { ICONS } from '../../../../icons/anniversary';
import { ANNI_COLORS as COLORS } from '@project/shared/src/constants/colors';

interface AnniversaryFormLeftProps {
  date: string;
  onDateChange: (date: string) => void;
  viewMonth: Date;
  onMonthChange: (date: Date) => void;
  isRecurring: boolean;
  onRecurringChange: (value: boolean) => void;
  selectedColor: string;
  onColorSelect: (color: string) => void;
  selectedIcon: string;
  onIconSelect: (name: string) => void;
}

const AnniversaryFormLeft: React.FC<AnniversaryFormLeftProps> = ({
  date, onDateChange, viewMonth, onMonthChange,
  isRecurring, onRecurringChange,
  selectedColor, onColorSelect,
  selectedIcon, onIconSelect
}) => {
  return (
    <div className="anni-form-left">
      <div className="form-section">
        <label>날짜 선택</label>
        <MiniCalendar 
          selectedDate={date} 
          onDateSelect={onDateChange} 
          viewMonth={viewMonth} 
          onMonthChange={onMonthChange}
          activeColor={selectedColor}
        />
      </div>

      <div className="form-section">
        <div className="switch-row">
          <label>매년 반복</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={e => onRecurringChange(e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      <div className="form-section">
        <label>색상 선택</label>
        <div className="color-options">
          {COLORS.map(color => (
            <button
              key={color}
              type="button"
              className={`color-dot ${selectedColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => onColorSelect(color)}
            />
          ))}
        </div>
      </div>

      <div className="form-section">
        <label>아이콘 선택</label>
        <div className="icon-options">
          {ICONS.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              className={`icon-item ${selectedIcon === name ? 'active' : ''}`}
              onClick={() => onIconSelect(name)}
            >
              <Icon size={20} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnniversaryFormLeft;
