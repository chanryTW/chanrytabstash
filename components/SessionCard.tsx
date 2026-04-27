
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

const PREVIEW_COUNT = 3;

const SessionCard: React.FC<SessionCardProps> = ({ session, onRestore, onDelete, labels }) => {
  const [expanded, setExpanded] = useState(false);

  // Resolve style class
  const colorClass = session.groupColor ? GROUP_COLOR_MAP[session.groupColor] : 'bg-white border-teal-200 text-teal-600';

  const visibleTabs = expanded ? session.tabs : session.tabs.slice(0, PREVIEW_COUNT);
  const hiddenCount = session.tabs.length - PREVIEW_COUNT;

  const openTab = (url?: string) => {
    if (!url) return;
    const globalChrome = typeof window !== 'undefined' ? (window as any).chrome : undefined;
    if (globalChrome?.tabs?.create) {
      globalChrome.tabs.create({ url, active: false });
    } else {
      window.open(url, '_blank', 'noopener');
    }
  };

  return (
    <div
      className={`relative border-2 rounded-2xl p-4 transition-all group overflow-hidden shadow-sm hover:shadow-md ${colorClass.split(' ')[0]} ${colorClass.split(' ')[2] || 'bg-white'}`}
    >
      <div className="flex flex-col h-full relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-3 border-b border-black/5 pb-3">
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-bold tracking-wide truncate flex items-center gap-2 ${colorClass.split(' ')[1] || 'text-gray-700'}`}>
              <LayersIcon className="w-5 h-5 shrink-0" />
              {session.name}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1">
              {new Date(session.createdAt).toLocaleDateString()} · {session.tabs.length} tabs
            </p>
          </div>

          <button
            onClick={() => onDelete(session.id)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg shrink-0"
            title={labels.purge}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Tab List */}
        <div className="flex-1 space-y-0.5 mb-3">
          {visibleTabs.map((tab, idx) => (
            <button
              key={`${session.id}-tab-${idx}`}
              onClick={() => openTab(tab.url)}
              title={tab.url}
              className="w-full flex items-center gap-2 text-[11px] text-gray-500 font-medium hover:bg-black/5 hover:text-gray-800 rounded-lg px-1.5 py-1 transition-all text-left group/tab"
            >
              {tab.favIconUrl ? (
                <img
                  src={tab.favIconUrl}
                  alt=""
                  className="w-3.5 h-3.5 rounded-sm shrink-0 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <span className="w-3.5 h-3.5 shrink-0 rounded-sm bg-gray-200 inline-block" />
              )}
              <span className="truncate flex-1">{tab.title}</span>
              <ExternalLinkIcon className="w-3 h-3 shrink-0 opacity-0 group-hover/tab:opacity-40 transition-opacity" />
            </button>
          ))}

          {/* Expand / Collapse toggle */}
          {session.tabs.length > PREVIEW_COUNT && (
            <button
              onClick={() => setExpanded(prev => !prev)}
              className="w-full text-left text-[10px] text-gray-400 hover:text-gray-600 font-bold pl-2 py-1 mt-0.5 transition-colors"
            >
              {expanded ? '▲ show less' : `▼ +${hiddenCount} ${labels.more}`}
            </button>
          )}
        </div>

        {/* Restore Button */}
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
