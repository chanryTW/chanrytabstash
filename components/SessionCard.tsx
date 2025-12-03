
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
  const colorClass = session.groupColor ? GROUP_COLOR_MAP[session.groupColor] : 'border-cyan-500/50 text-cyan-400';

  return (
    <div 
      className="relative bg-black border border-gray-800 p-1 hover:border-cyan-500/50 transition-all group clip-corner"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative corner lines */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-600 group-hover:border-cyan-400 transition-colors"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gray-600 group-hover:border-cyan-400 transition-colors"></div>

      <div className="bg-gray-900/30 p-3 h-full flex flex-col">
        <div className="flex justify-between items-start mb-3 border-b border-gray-800 pb-2">
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-bold uppercase tracking-wider truncate flex items-center gap-2 ${colorClass.split(' ')[1]}`}>
              <LayersIcon className="w-3 h-3" />
              {session.name}
            </h3>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
              ID: {session.id.slice(-6)} // {new Date(session.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <button 
            onClick={() => onDelete(session.id)}
            className="text-gray-600 hover:text-red-500 transition-colors p-1"
            title={labels.purge}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Preview (Data Lines) */}
        <div className="flex-1 space-y-1 mb-4">
          {session.tabs.slice(0, 3).map((tab, idx) => (
            <div key={`${session.id}-tab-${idx}`} className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
              <span className="text-gray-700">0{idx + 1}</span>
              <span className="truncate">{tab.title}</span>
            </div>
          ))}
          {session.tabs.length > 3 && (
            <div className="text-[10px] text-gray-700 pl-4 font-mono">
              + {session.tabs.length - 3} {labels.more}
            </div>
          )}
        </div>

        <button
          onClick={() => onRestore(session)}
          className="w-full py-2 bg-gray-900 border border-gray-700 hover:bg-cyan-900/30 hover:border-cyan-500 hover:text-cyan-400 text-gray-400 text-xs font-bold uppercase tracking-widest transition-all clip-corner flex items-center justify-center gap-2"
        >
          <ExternalLinkIcon className="w-3 h-3" />
          {labels.init}
        </button>
      </div>
    </div>
  );
};

export default SessionCard;
