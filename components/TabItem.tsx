
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
      className={`group flex items-center gap-3 p-2 border-l-2 transition-all cursor-pointer relative overflow-hidden ${
        isSelected 
          ? 'bg-cyan-900/20 border-cyan-400 text-cyan-100' 
          : 'bg-black/40 border-gray-800 text-gray-500 hover:bg-gray-900 hover:border-gray-600 hover:text-gray-300'
      }`}
      onClick={() => onToggle(tab.id)}
    >
      {/* Selection Indicator (Checkbox style) */}
      <div className={`w-4 h-4 flex items-center justify-center border transition-all ${
        isSelected ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'border-gray-700'
      }`}>
        {isSelected && <div className="w-2 h-2 bg-cyan-400"></div>}
      </div>
      
      {/* Favicon Container */}
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
        {tab.favIconUrl ? (
          <img src={tab.favIconUrl} alt="" className="w-4 h-4 object-contain" />
        ) : (
          <span className="text-[10px] text-gray-600">NULL</span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <span className={`text-xs font-medium truncate tracking-wide ${isSelected ? 'text-cyan-200' : ''}`}>
          {tab.title}
        </span>
        <span className="text-[10px] text-gray-600 truncate font-mono opacity-60">
          {tab.url}
        </span>
      </div>

      {/* Hover Decoration */}
      <div className={`absolute right-0 top-0 bottom-0 w-1 transition-all ${
        isSelected ? 'bg-cyan-500' : 'bg-transparent group-hover:bg-gray-700'
      }`}></div>
    </div>
  );
};

export default TabItem;
