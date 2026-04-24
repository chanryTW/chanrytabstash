
import React from 'react';
import { ChromeTab } from '../types';

interface TabItemProps {
  tab: ChromeTab;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

const TabItem: React.FC<TabItemProps> = ({ tab, isSelected, onToggle }) => {
  return (
    <div 
      className={`group flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${
        isSelected 
          ? 'bg-teal-50 border-teal-500 shadow-md transform scale-[1.01] z-10' 
          : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
      }`}
      onClick={() => onToggle(tab.id)}
    >
      {/* Selection Indicator (Checkbox style) */}
      <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg border-2 transition-all shadow-sm ${
        isSelected ? 'border-teal-500 bg-teal-500 text-white scale-110' : 'border-gray-300 bg-white group-hover:border-teal-300'
      }`}>
        {isSelected && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      
      {/* Favicon Container */}
      <div className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg p-1.5 transition-colors ${
        isSelected ? 'bg-white shadow-sm' : 'bg-gray-100'
      }`}>
        {tab.favIconUrl ? (
          <img src={tab.favIconUrl} alt="" className="w-full h-full object-contain" />
        ) : (
          <span className="text-[10px] text-gray-400 font-bold">TB</span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <span className={`text-sm font-bold truncate tracking-wide transition-colors ${isSelected ? 'text-teal-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
          {tab.title}
        </span>
        <span className={`text-[11px] truncate opacity-80 mt-0.5 transition-colors ${isSelected ? 'text-teal-700' : 'text-gray-500'}`}>
          {tab.url}
        </span>
      </div>
    </div>
  );
};

export default TabItem;
