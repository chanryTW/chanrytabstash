
import React, { useState } from 'react';
import { SavedSession } from '../types';
import { ExternalLinkIcon, TrashIcon, LayersIcon, GROUP_COLOR_MAP } from '../constants';

interface SessionCardProps {
  session: SavedSession;
  onRestore: (session: SavedSession) => void;
  onDelete: (id: string) => void;
  labels: {
    purge: string;
    more: string;
    init: string;
  };
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onRestore, onDelete, labels }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Resolve style class
  const colorClass = session.groupColor ? GROUP_COLOR_MAP[session.groupColor] : 'bg-white border-teal-200 text-teal-600';

  return (
    <div 
      className={`relative border-2 rounded-2xl p-4 transition-all group overflow-hidden shadow-sm hover:shadow-md ${colorClass.split(' ')[0]} ${colorClass.split(' ')[2] || 'bg-white'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full relative z-10">
        <div className="flex justify-between items-start mb-3 border-b border-black/5 pb-3">
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-bold tracking-wide truncate flex items-center gap-2 ${colorClass.split(' ')[1] || 'text-gray-700'}`}>
              <LayersIcon className="w-5 h-5" />
              {session.name}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1">
              {new Date(session.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <button 
            onClick={() => onDelete(session.id)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
            title={labels.purge}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Preview (Data Lines) */}
        <div className="flex-1 space-y-1.5 mb-4">
          {session.tabs.slice(0, 3).map((tab, idx) => (
            <div key={`${session.id}-tab-${idx}`} className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
              <span className="text-gray-400 w-4 font-bold">{idx + 1}.</span>
              <span className="truncate">{tab.title}</span>
            </div>
          ))}
          {session.tabs.length > 3 && (
            <div className="text-[10px] text-gray-400 pl-6 font-bold bg-black/5 py-0.5 rounded inline-block mt-1">
              + {session.tabs.length - 3} {labels.more}
            </div>
          )}
        </div>

        <button
          onClick={() => onRestore(session)}
          className="w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 focus:ring-4 focus:ring-gray-100 text-xs font-bold transition-all rounded-xl shadow-sm flex items-center justify-center gap-2 mt-auto"
        >
          <ExternalLinkIcon className="w-4 h-4" />
          {labels.init}
        </button>
      </div>
    </div>
  );
};

export default SessionCard;
