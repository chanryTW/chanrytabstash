
import { ChromeTab, ChromeTabGroup, SavedSession } from '../types';
import { MOCK_TABS, MOCK_GROUPS } from '../constants';

declare var chrome: any;

// Check if we are in a Chrome Extension environment
// We check for chrome.tabs to ensure we have permission/capability
const isExtension = typeof chrome !== 'undefined' && !!chrome.tabs;

const STORAGE_KEY = 'tabstash_sessions';

export const chromeService = {
  /**
   * Get all tabs from current window
   */
  async getTabs(): Promise<ChromeTab[]> {
    if (isExtension) {
      return new Promise((resolve) => {
        chrome.tabs.query({ currentWindow: true }, (tabs: any[]) => {
          resolve(tabs as ChromeTab[]);
        });
      });
    } else {
      // Return Mock data for web preview
      return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_TABS), 300);
      });
    }
  },

  /**
   * Get all tab groups from current window
   */
  async getTabGroups(): Promise<ChromeTabGroup[]> {
    if (isExtension && chrome.tabGroups) {
      return new Promise((resolve) => {
        chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (groups: any[]) => {
          resolve(groups as ChromeTabGroup[]);
        });
      });
    } else {
      return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_GROUPS), 300);
      });
    }
  },

  /**
   * Close specific tabs
   */
  async closeTabs(tabIds: number[]): Promise<void> {
    if (isExtension) {
      return new Promise((resolve) => {
        chrome.tabs.remove(tabIds, () => resolve());
      });
    } else {
      console.log(`[Mock] Closing tabs: ${tabIds.join(', ')}`);
      return Promise.resolve();
    }
  },

  /**
   * Restore a session (open all tabs)
   * If it was saved with a color, we could theoretically recreate the group,
   * but for now just opening tabs is safer.
   */
  async restoreSession(session: SavedSession): Promise<void> {
    if (isExtension) {
      // Create tabs
      const promises = session.tabs.map(tab => 
        new Promise<number>((resolve) => {
           chrome.tabs.create({ url: tab.url, active: false }, (newTab: any) => {
             resolve(newTab.id);
           });
        })
      );
      
      const newTabIds = await Promise.all(promises);

      // If this session had a group name/color, try to group them back
      // Note: This requires 'tabGroups' permission in manifest
      if (session.groupColor && chrome.tabs.group && chrome.tabGroups) {
        chrome.tabs.group({ tabIds: newTabIds }, (groupId: number) => {
          chrome.tabGroups.update(groupId, { 
            title: session.name,
            color: session.groupColor as any
          });
        });
      }

    } else {
      console.log(`[Mock] Restoring session: ${session.name} with ${session.tabs.length} tabs.`);
    }
  },

  /**
   * Save sessions to storage (Local Storage or Chrome Storage)
   */
  async saveSessions(sessions: SavedSession[]): Promise<void> {
    if (isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEY]: sessions }, () => resolve());
      });
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      return Promise.resolve();
    }
  },

  /**
   * Load sessions from storage
   */
  async loadSessions(): Promise<SavedSession[]> {
    if (isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEY], (result: any) => {
          resolve(result[STORAGE_KEY] || []);
        });
      });
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      return Promise.resolve(stored ? JSON.parse(stored) : []);
    }
  }
};
