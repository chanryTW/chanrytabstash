
import React, { useEffect, useState, useCallback } from 'react';
import { ChromeTab, ChromeTabGroup, SavedSession, TabSelection, Language } from './types';
import { chromeService } from './services/chromeService';
import { geminiService } from './services/geminiService';
import TabItem from './components/TabItem';
import SessionCard from './components/SessionCard';
import { ArchiveIcon, SparklesIcon, RefreshIcon, LayersIcon, GROUP_COLOR_MAP, SettingsIcon, XIcon } from './constants';
import { translations } from './locales';
import pkg from './package.json';

const LOCAL_VERSION = pkg.version;

function App() {
  const [activeTabs, setActiveTabs] = useState<ChromeTab[]>([]);
  const [tabGroups, setTabGroups] = useState<ChromeTabGroup[]>([]);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [selectedTabIds, setSelectedTabIds] = useState<TabSelection>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionNameInput, setSessionNameInput] = useState('');
  const [view, setView] = useState<'current' | 'saved'>('current');
  const [lang, setLang] = useState<Language>('zh'); // Default to zh
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
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
    setSelectedTabIds(new Set()); // Deselect all by default
    
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
    
    // Check for updates from GitHub
    const checkUpdate = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/chanryTW/chanrytabstash/main/package.json', { cache: 'no-store' });
        if (response.ok) {
          const remotePkg = await response.json();
          if (remotePkg.version && remotePkg.version !== LOCAL_VERSION) {
             const localParts = LOCAL_VERSION.split('.').map(Number);
             const remoteParts = remotePkg.version.split('.').map(Number);
             let isNewer = false;
             for (let i = 0; i < 3; i++) {
               if (remoteParts[i] > localParts[i]) { isNewer = true; break; }
               if (remoteParts[i] < localParts[i]) { break; }
             }
             if (isNewer) setUpdateAvailable(true);
          }
        }
      } catch (e) {
        console.error('Failed to check updates', e);
      }
    };
    checkUpdate();
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
    const groupName = group.title || `${t.groupPrefix} ${group.id}`;
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
          // Apply pastel background based on group color
          const groupStyle = GROUP_COLOR_MAP[group.color] || 'bg-white border-gray-200';

          return (
            <div key={group.id} className={`rounded-xl border-2 ${groupStyle} overflow-hidden shadow-sm`}>
              <div className="flex items-center justify-between p-3 border-b border-black/5 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 text-sm tracking-wide">
                    {group.title || `${t.groupPrefix} ${group.id}`}
                  </h3>
                  <span className="text-[11px] text-gray-600 font-bold bg-black/5 px-2 py-0.5 rounded-full">{groupTabs.length}</span>
                </div>
                <button
                  onClick={() => handleStashGroup(group, groupTabs)}
                  className="flex items-center gap-1 text-xs bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm transition-all focus:ring-2 focus:ring-pastel-mint/50 font-bold"
                >
                  <ArchiveIcon className="w-3.5 h-3.5" />
                  {t.stashUnit}
                </button>
              </div>
              <div className="p-2 space-y-1">
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
          <div className="cute-card p-2 border-slate-200 shadow-sm">
            <div className="mb-3 px-2 flex items-center justify-center gap-3 pt-2">
               <div className="h-px bg-slate-200 flex-1"></div>
               <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{t.unsortedData}</h3>
               <div className="h-px bg-slate-200 flex-1"></div>
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
    <div className="relative w-full min-h-screen flex flex-col font-sans overflow-hidden bg-[var(--color-bg)]">
      
      {updateAvailable && (
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-center py-2.5 px-4 shadow-sm z-50 relative font-bold text-xs flex items-center justify-center gap-2">
          {t.updateAvailable || "✨ 有新版本可供更新！"} 
          <a href="https://github.com/chanryTW/chanrytabstash/releases" target="_blank" rel="noreferrer" className="underline hover:text-teal-100 transition-colors bg-black/10 px-2 py-0.5 rounded-full ml-2">
            {t.downloadUpdate || "前往下載最新版本"}
          </a>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 transition-all">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold text-teal-500 mb-4 flex items-center gap-2">
              <SettingsIcon className="w-6 h-6" /> {t.settingsTitle}
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              {t.apiKeyDesc}
            </p>
            <div className="mb-6">
              <label className="text-xs uppercase text-gray-500 font-bold mb-2 block">{t.apiKeyLabel}</label>
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-400/20 text-gray-800 px-4 py-3 text-sm font-mono outline-none transition-all"
              />
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:text-blue-600 font-semibold underline mt-3 inline-block transition-colors">
                {t.getKeyLink}
              </a>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowSettings(false)}
                className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              >
                {t.cancel}
              </button>
              <button 
                onClick={saveApiKey}
                className="flex-1 py-3 bg-teal-500 text-white hover:bg-teal-600 focus:ring-4 focus:ring-teal-500/50 rounded-xl text-sm font-bold transition-all shadow-md shadow-teal-200"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 border-b border-gray-100 p-4 sticky top-0 z-20 backdrop-blur-md shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-[14px] flex items-center justify-center shadow-sm border-2 border-teal-100 group overflow-hidden">
              <img src="/icon.png" alt="Logo" className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-800 leading-none">
                {t.appTitle}<span className="text-teal-500">{t.appTitleSuffix}</span>{t.appTitleEnd}
              </h1>
              <p className="text-[11px] text-gray-500 font-bold tracking-wider mt-1">{t.sysVer}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            
            {/* Language Switcher */}
            <div className="flex text-xs font-bold bg-slate-100 rounded-lg p-0.5">
               <button onClick={() => changeLanguage('en')} className={`px-2 py-1 rounded-md transition-all ${lang === 'en' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}>EN</button>
               <button onClick={() => changeLanguage('zh')} className={`px-2 py-1 rounded-md transition-all ${lang === 'zh' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}>繁</button>
               <button onClick={() => changeLanguage('ja')} className={`px-2 py-1 rounded-md transition-all ${lang === 'ja' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}>日</button>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <button 
                onClick={() => setShowSettings(true)}
                className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                title={t.settingsTitle}
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
              <div className="flex bg-slate-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setView('current')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    view === 'current' 
                      ? 'bg-white shadow-sm text-gray-800' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.activeView} <span className="ml-1 bg-slate-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">{activeTabs.length}</span>
                </button>
                <button
                  onClick={() => setView('saved')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    view === 'saved' 
                      ? 'bg-white shadow-sm text-purple-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.savedView} <span className="ml-1 bg-slate-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">{savedSessions.length}</span>
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
            {/* Control Panel: Action Options */}
            <div className="grid grid-cols-2 gap-4">
              {/* Option 1: Manual Group */}
              <div className="cute-card p-4 border-slate-200 flex flex-col justify-between group">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs text-gray-400 font-black">1</div>
                    {t.manualSaveTitle}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-bold leading-relaxed">{t.manualSaveDesc}</p>
                </div>
                <div className="flex flex-col gap-2 mt-auto">
                  <input 
                    type="text" 
                    placeholder={t.enterSessionId}
                    value={sessionNameInput}
                    onChange={(e) => setSessionNameInput(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl text-xs px-3 py-2.5 text-gray-800 font-bold focus:border-teal-400 focus:ring-4 focus:ring-teal-400/20 outline-none transition-all placeholder-gray-400"
                  />
                  <button 
                    onClick={handleManualSave}
                    disabled={isProcessing || selectedTabIds.size === 0}
                    className="w-full bg-white hover:bg-slate-50 text-gray-700 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold py-2.5 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <LayersIcon className="w-4 h-4 text-gray-500" />
                    {t.executeSave}
                  </button>
                </div>
              </div>

              {/* Option 2: AI Group */}
              <div className="cute-card p-4 border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100 flex flex-col justify-between group shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-teal-800 mb-1 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-teal-200 flex items-center justify-center text-xs text-teal-700 font-black">2</div>
                    {t.aiSaveTitle}
                  </h3>
                  <p className="text-[11px] text-teal-700 font-bold leading-relaxed opacity-80">{t.aiSaveDesc}</p>
                </div>
                <div className="flex flex-col gap-2 mt-auto">
                  <button 
                    onClick={handleAISave}
                    disabled={isProcessing || selectedTabIds.size === 0}
                    className="w-full h-full min-h-[92px] bg-teal-500 hover:bg-teal-600 text-white rounded-xl focus:ring-4 focus:ring-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold py-3 transition-all flex flex-col items-center justify-center gap-2 shadow-md shadow-teal-200"
                  >
                    {isProcessing ? (
                      <RefreshIcon className="w-6 h-6 animate-spin" />
                    ) : (
                      <SparklesIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    )}
                    <span>{t.aiAnalyze}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* List Header */}
            <div className="flex justify-between items-center px-2 pb-2">
              <h2 className="text-sm font-bold text-slate-500">{t.targetSelection}</h2>
              <button 
                onClick={toggleSelectAll}
                className="text-xs text-teal-600 hover:text-teal-700 font-bold transition-colors bg-teal-50 hover:bg-teal-100 border border-teal-100 px-3 py-1.5 rounded-full"
              >
                {selectedTabIds.size === activeTabs.length ? t.deselectAll : t.selectAll}
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
              <div className="cute-card flex flex-col items-center justify-center py-20 text-gray-500 gap-4 border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                  <ArchiveIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="font-bold text-sm tracking-wide">{t.noArchivedData}</p>
                <button 
                  onClick={() => setView('current')}
                  className="text-teal-600 hover:text-teal-700 text-sm font-bold bg-teal-50 px-4 py-2 rounded-full mt-2 transition-colors border border-teal-100"
                >
                  {t.returnToActive}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 pb-10">
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
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 text-center z-20 shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">
        <p className="text-xs text-gray-500 font-bold mix-blend-multiply">
           &copy; 2025 ChanryTabStash • {t.copyright}
        </p>
        <p className="text-[11px] text-gray-400 mt-1 font-bold">
           {t.systemId}
        </p>
      </footer>
    </div>
  );
}

export default App;

