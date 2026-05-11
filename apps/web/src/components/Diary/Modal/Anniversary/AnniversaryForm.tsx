import React from 'react';
import AnniversaryFormLeft from './AnniversaryFormLeft';
import AnniversaryFormRight from './AnniversaryFormRight';
import { type EntryItem } from '@project/shared/src/store/diaryStore';

interface AnniversaryFormProps {
  // Common
  date: string;
  onDateChange: (date: string) => void;
  viewMonth: Date;
  onMonthChange: (date: Date) => void;
  
  // Left
  isRecurring: boolean;
  onRecurringChange: (value: boolean) => void;
  selectedColor: string;
  onColorSelect: (color: string) => void;
  selectedIcon: string;
  onIconSelect: (name: string) => void;
  
  // Right
  title: string;
  onTitleChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  showMap: boolean;
  onShowMapToggle: () => void;
  selectedLocation?: EntryItem['location'];
  onLocationSelect: (location: EntryItem['location']) => void;
}

const AnniversaryForm: React.FC<AnniversaryFormProps> = (props) => {
  return (
    <div className="anni-form-grid">
      <AnniversaryFormLeft 
        date={props.date}
        onDateChange={props.onDateChange}
        viewMonth={props.viewMonth}
        onMonthChange={props.onMonthChange}
        isRecurring={props.isRecurring}
        onRecurringChange={props.onRecurringChange}
        selectedColor={props.selectedColor}
        onColorSelect={props.onColorSelect}
        selectedIcon={props.selectedIcon}
        onIconSelect={props.onIconSelect}
      />
      <AnniversaryFormRight 
        title={props.title}
        onTitleChange={props.onTitleChange}
        content={props.content}
        onContentChange={props.onContentChange}
        showMap={props.showMap}
        onShowMapToggle={props.onShowMapToggle}
        selectedLocation={props.selectedLocation}
        onLocationSelect={props.onLocationSelect}
      />
    </div>
  );
};

export default AnniversaryForm;
