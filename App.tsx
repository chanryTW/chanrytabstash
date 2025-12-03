
import React, { useEffect, useState, useCallback } from 'react';
import { ChromeTab, ChromeTabGroup, SavedSession, TabSelection, Language } from './types';
import { chromeService } from './services/chromeService';
import { geminiService } from './services/geminiService';
import TabItem from './components/TabItem';
import SessionCard from './components/SessionCard';
import { ArchiveIcon, SparklesIcon, RefreshIcon, LayersIcon, GROUP_COLOR_MAP, SettingsIcon, XIcon } from './constants';
import { translations } from './locales';

function App() {
  const [activeTabs, setActiveTabs] = useState<ChromeTab[]>([]);
  const [tabGroups, setTabGroups] = useState<ChromeTabGroup[]>([]);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [selectedTabIds, setSelectedTabIds] = useState<TabSelection>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionNameInput, setSessionNameInput] = useState('');
  const [view, setView] = useState<'current' | 'saved'>('current');
  const [lang, setLang] = useState<Language>('en');
  
  // Settings / API Key State
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');

  // Get current translation object
  const t = translations[lang];

  // Load initial data
  const refreshData = useCallback(async () => {
    const tabs = await chromeService.getTabs();
    const groups = await chromeService.getTabGroups();
    
    setActiveTabs(tabs);
    setTabGroups(groups);
    setSelectedTabIds(new Set(tabs.map(t => t.id))); // Select all by default
    
    const sessions = await chromeService.loadSessions();
    setSavedSessions(sessions);
    
    // Load API Key
    const storedKey = localStorage.getItem('chanry_gemini_api_key');
    if (storedKey) setApiKey(storedKey);

    // Load Lang
    const storedLang = localStorage.getItem('chanry_app_lang');
    if (storedLang && (['en', 'zh', 'ja'] as const).includes(storedLang as any)) {
      setLang(storedLang as Language);
    }

  }, []);

  useEffect(() => {
    refreshData();
  }, []);

  const changeLanguage = (l: Language) => {
    setLang(l);
    localStorage.setItem('chanry_app_lang', l);
  };

  const saveApiKey = () => {
    localStorage.setItem('chanry_gemini_api_key', apiKey);
    setShowSettings(false);
  };

  // Toggle selection
  const toggleTabSelection = (id: number) => {
    const newSelection = new Set(selectedTabIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedTabIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedTabIds.size === activeTabs.length) {
      setSelectedTabIds(new Set());
    } else {
      setSelectedTabIds(new Set(activeTabs.map(t => t.id)));
    }
  };

  const handleManualSave = async () => {
    if (selectedTabIds.size === 0) return;
    if (!sessionNameInput.trim()) {
      alert(t.errNameRequired);
      return;
    }
    await performSave(sessionNameInput, Array.from(selectedTabIds), undefined);
    setSessionNameInput('');
  };

  const handleStashGroup = async (group: ChromeTabGroup, tabsInGroup: ChromeTab[]) => {
    if (tabsInGroup.length === 0) return;
    const groupName = group.title || `${t.groupPrefix}_${group.id}`;
    await performSave(groupName, tabsInGroup.map(t => t.id), group.color);
  };

  const performSave = async (name: string, tabIdsToSave: number[], groupColor?: string) => {
    setIsProcessing(true);
    const tabsToSave = activeTabs.filter(t => tabIdsToSave.includes(t.id));
    const newSession: SavedSession = {
      id: Date.now().toString(),
      name: name,
      createdAt: Date.now(),
      tabs: tabsToSave,
      groupColor: groupColor
    };
    const updatedSessions = [newSession, ...savedSessions];
    await chromeService.saveSessions(updatedSessions);
    setSavedSessions(updatedSessions);
    await chromeService.closeTabs(tabsToSave.map(t => t.id));
    setIsProcessing(false);
    setView('saved');
    refreshData();
  }

  const handleAISave = async () => {
    if (selectedTabIds.size === 0) return;
    
    // Check API Key
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    setIsProcessing(true);
    const tabsToProcess = activeTabs.filter(t => selectedTabIds.has(t.id));
    
    // Call Gemini with user key and language
    const result = await geminiService.categorizeTabs(tabsToProcess, apiKey, lang);
    
    let newSessions: SavedSession[] = [];
    const tabsToClose: number[] = [];

    if (result && result.groups) {
      result.groups.forEach(group => {
        const groupTabs = group.tabIndices.map(idx => tabsToProcess[idx]).filter(Boolean);
        if (groupTabs.length > 0) {
          newSessions.push({
            id: Date.now().toString() + Math.random().toString().slice(2,6),
            name: group.groupName, 
            createdAt: Date.now(),
            tabs: groupTabs,
            tags: ['AI-Generated']
          });
          groupTabs.forEach(t => tabsToClose.push(t.id));
        }
      });
    } else {
      // Fallback
      newSessions.push({
        id: Date.now().toString(),
        name: `${t.autoSavePrefix}_${new Date().toLocaleTimeString()}`,
        createdAt: Date.now(),
        tabs: tabsToProcess,
        tags: [t.aiFailedTag]
      });
      tabsToProcess.forEach(t => tabsToClose.push(t.id));
    }

    const updatedSessions = [...newSessions, ...savedSessions];
    await chromeService.saveSessions(updatedSessions);
    setSavedSessions(updatedSessions);
    await chromeService.closeTabs(tabsToClose);
    setIsProcessing(false);
    setView('saved');
    refreshData();
  };

  const handleRestore = async (session: SavedSession) => {
    await chromeService.restoreSession(session);
    const updated = savedSessions.filter(s => s.id !== session.id);
    await chromeService.saveSessions(updated);
    setSavedSessions(updated);
    refreshData();
  };

  const handleDeleteSession = async (id: string) => {
    if(!confirm(t.warnDelete)) return;
    const updated = savedSessions.filter(s => s.id !== id);
    await chromeService.saveSessions(updated);
    setSavedSessions(updated);
  };

  // Render Logic
  const renderTabList = () => {
    const ungroupedTabs = activeTabs.filter(t => t.groupId === -1 || t.groupId === undefined);
    return (
      <div className="space-y-6 pb-20">
        {/* Chrome Groups */}
        {tabGroups.map(group => {
          const groupTabs = activeTabs.filter(t => t.groupId === group.id);
          if (groupTabs.length === 0) return null;
          // Apply cyber border color based on group color
          const borderColor = GROUP_COLOR_MAP[group.color]?.split(' ')[0] || 'border-gray-600';

          return (
            <div key={group.id} className={`border-l-4 ${borderColor} bg-gray-900/20 pl-2`}>
              <div className="flex items-center justify-between p-2 mb-1 border-b border-gray-800/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-200 text-sm tracking-wider uppercase">
                    {group.title || `${t.groupPrefix}_${group.id}`}
                  </h3>
                  <span className="text-[10px] text-gray-500 font-mono">[{groupTabs.length}]</span>
                </div>
                <button
                  onClick={() => handleStashGroup(group, groupTabs)}
                  className="flex items-center gap-1 text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 uppercase tracking-widest clip-corner-top transition-colors"
                >
                  <ArchiveIcon className="w-3 h-3" />
                  {t.stashUnit}
                </button>
              </div>
              <div className="space-y-1">
                {groupTabs.map(tab => (
                  <TabItem 
                    key={tab.id} 
                    tab={tab} 
                    isSelected={selectedTabIds.has(tab.id)}
                    onToggle={toggleTabSelection}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Ungrouped */}
        {ungroupedTabs.length > 0 && (
          <div>
            <div className="mb-2 px-1 flex items-center gap-2">
               <div className="h-[1px] bg-gray-700 flex-1"></div>
               <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.unsortedData}</h3>
               <div className="h-[1px] bg-gray-700 flex-1"></div>
            </div>
            <div className="space-y-1">
              {ungroupedTabs.map(tab => (
                <TabItem 
                  key={tab.id} 
                  tab={tab} 
                  isSelected={selectedTabIds.has(tab.id)}
                  onToggle={toggleTabSelection}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col font-sans overflow-hidden">
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-950 border border-cyan-500/50 w-full max-w-md p-6 relative shadow-[0_0_30px_rgba(34,211,238,0.1)] clip-corner">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 tracking-widest flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" /> {t.settingsTitle}
            </h2>
            <p className="text-xs text-gray-400 mb-4 font-mono">
              {t.apiKeyDesc}
            </p>
            <div className="mb-6">
              <label className="text-[10px] uppercase text-cyan-600 font-bold mb-1 block">{t.apiKeyLabel}</label>
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-black border border-gray-700 focus:border-cyan-500 text-cyan-100 px-3 py-2 text-sm font-mono outline-none transition-colors"
              />
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-gray-500 underline mt-2 inline-block hover:text-cyan-400">
                {t.getKeyLink}
              </a>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest"
              >
                {t.cancel}
              </button>
              <button 
                onClick={saveApiKey}
                className="flex-1 py-2 bg-cyan-900/30 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black text-xs font-bold uppercase tracking-widest transition-all"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-black/80 border-b border-gray-800 p-4 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-950 border border-cyan-500/30 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-cyan-400/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
              <ArchiveIcon className="text-cyan-400 w-6 h-6 relative z-10" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-widest leading-none">
                {t.appTitle}<span className="text-cyan-400">{t.appTitleSuffix}</span>{t.appTitleEnd}
              </h1>
              <p className="text-[10px] text-gray-500 font-mono tracking-widest">{t.sysVer}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            
            {/* Language Switcher */}
            <div className="flex text-[10px] font-bold border border-gray-800 bg-gray-900 rounded-sm overflow-hidden">
               <button onClick={() => changeLanguage('en')} className={`px-2 py-1 transition-colors ${lang === 'en' ? 'bg-cyan-900 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}>EN</button>
               <div className="w-[1px] bg-gray-800"></div>
               <button onClick={() => changeLanguage('zh')} className={`px-2 py-1 transition-colors ${lang === 'zh' ? 'bg-cyan-900 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}>繁</button>
               <div className="w-[1px] bg-gray-800"></div>
               <button onClick={() => changeLanguage('ja')} className={`px-2 py-1 transition-colors ${lang === 'ja' ? 'bg-cyan-900 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}>日</button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 hover:text-cyan-400 border border-transparent hover:border-gray-800 rounded transition-all"
                title={t.settingsTitle}
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
              <div className="flex bg-gray-900 border border-gray-800 p-1 clip-corner-top">
                <button
                  onClick={() => setView('current')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    view === 'current' 
                      ? 'bg-cyan-900/40 text-cyan-400 border-b-2 border-cyan-500' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {t.activeView} ({activeTabs.length})
                </button>
                <button
                  onClick={() => setView('saved')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    view === 'saved' 
                      ? 'bg-purple-900/40 text-purple-400 border-b-2 border-purple-500' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {t.savedView} ({savedSessions.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 overflow-y-auto relative z-10">
        
        {/* VIEW: ACTIVE TABS */}
        {view === 'current' && (
          <div className="space-y-6">
            {/* Control Panel */}
            <div className="bg-black/60 border border-gray-800 p-4 clip-corner relative">
               {/* Decorative tech lines */}
               <div className="absolute top-0 left-0 w-16 h-[1px] bg-cyan-500"></div>
               <div className="absolute bottom-0 right-0 w-16 h-[1px] bg-cyan-500"></div>

              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder={t.enterSessionId}
                  value={sessionNameInput}
                  onChange={(e) => setSessionNameInput(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 text-sm px-3 py-2 text-white placeholder-gray-600 font-mono focus:border-cyan-500 focus:outline-none transition-all"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleManualSave}
                    disabled={isProcessing || selectedTabIds.size === 0}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 text-xs font-bold uppercase tracking-widest py-3 border border-gray-600 hover:border-gray-400 transition-all clip-corner flex items-center justify-center gap-2"
                  >
                    <LayersIcon className="w-4 h-4" />
                    {t.executeSave}
                  </button>
                  <button 
                    onClick={handleAISave}
                    disabled={isProcessing || selectedTabIds.size === 0}
                    className="flex-1 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-500/50 hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-cyan-400 text-xs font-bold uppercase tracking-widest py-3 transition-all clip-corner flex items-center justify-center gap-2 relative overflow-hidden group"
                  >
                    {isProcessing ? (
                      <RefreshIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      <SparklesIcon className="w-4 h-4" />
                    )}
                    <span className="relative z-10">{t.aiAnalyze}</span>
                    <div className="absolute inset-0 bg-cyan-400/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* List Header */}
            <div className="flex justify-between items-center px-1 border-b border-dashed border-gray-800 pb-2">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.targetSelection}</h2>
              <button 
                onClick={toggleSelectAll}
                className="text-[10px] text-cyan-600 hover:text-cyan-400 font-mono transition-colors uppercase"
              >
                [{selectedTabIds.size === activeTabs.length ? t.deselectAll : t.selectAll}]
              </button>
            </div>

            {/* Tab Groups and List */}
            {renderTabList()}
          </div>
        )}

        {/* VIEW: SAVED SESSIONS */}
        {view === 'saved' && (
          <div className="space-y-4">
            {savedSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-600 gap-4 border border-dashed border-gray-800 bg-black/40">
                <ArchiveIcon className="w-12 h-12 opacity-30" />
                <p className="font-mono text-xs tracking-widest">{t.noArchivedData}</p>
                <button 
                  onClick={() => setView('current')}
                  className="text-cyan-600 hover:text-cyan-400 text-xs uppercase underline"
                >
                  {t.returnToActive}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 pb-10">
                {savedSessions.map(session => (
                  <SessionCard 
                    key={session.id} 
                    session={session} 
                    onRestore={handleRestore}
                    onDelete={handleDeleteSession}
                    labels={{
                      purge: t.sessionPurge,
                      more: t.sessionMore,
                      init: t.sessionInit
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer / Copyright */}
      <footer className="border-t border-gray-900 bg-black p-3 text-center z-20">
        <p className="text-[10px] text-gray-700 font-mono uppercase tracking-widest">
           &copy; 2025 ChanryTabStash // {t.copyright}
        </p>
        <p className="text-[9px] text-gray-800 mt-1">
           {t.systemId}
        </p>
      </footer>
    </div>
  );
}

export default App;
