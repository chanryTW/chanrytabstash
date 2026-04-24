import { Language } from './types';

export const translations = {
  en: {
    appTitle: "CHANRY",
    appTitleSuffix: "TAB",
    appTitleEnd: "STASH",
    sysVer: "Version 1.0",
    activeView: "Current",
    savedView: "Saved",
    settingsTitle: "Settings",
    apiKeyDesc: "To utilize AI Categorization, a GEMINI API KEY is required. The key is securely stored in your browser local storage.",
    apiKeyLabel: "Google GenAI API Key",
    getKeyLink: "Get API Key here",
    cancel: "Cancel",
    confirm: "Confirm",

    // Grouping
    manualSaveTitle: "Manual Grouping",
    manualSaveDesc: "Save selected tabs into a single named group.",
    enterSessionId: "Enter group name...",
    executeSave: "Create Group",

    aiSaveTitle: "AI Auto Categorize",
    aiSaveDesc: "Let AI analyze and split selected tabs into multiple smart groups.",
    aiAnalyze: "Auto Categorize Selected",

    targetSelection: "Selection",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    unsortedData: "Unsorted Tabs",
    stashUnit: "Save",
    noArchivedData: "No saved sessions found.",
    returnToActive: "Return to Current Tabs",
    copyright: "All Rights Reserved",
    systemId: "Powered by AI",

    // SessionCard
    sessionPurge: "Delete",
    sessionMore: "more tabs...",
    sessionInit: "Restore",

    // Alerts
    errNameRequired: "Please enter a group name.",
    warnDelete: "Are you sure you want to delete this session?",

    // Dynamic
    groupPrefix: "Group",
    autoSavePrefix: "Auto-Save",
    aiFailedTag: "AI-Failed"
  },
  zh: {
    appTitle: "CHANRY",
    appTitleSuffix: "TAB",
    appTitleEnd: "STASH",
    sysVer: "版本 1.0",
    activeView: "使用中",
    savedView: "已儲存",
    settingsTitle: "設定",
    apiKeyDesc: "使用 AI 自動分類功能需要 GEMINI API KEY。金鑰將僅儲存於您的瀏覽器本地端，不會外洩。",
    apiKeyLabel: "Google GenAI API 金鑰",
    getKeyLink: "在此申請 API KEY",
    cancel: "取消",
    confirm: "確認",

    // Grouping
    manualSaveTitle: "手動分組",
    manualSaveDesc: "將右側選取的分頁，全部加入到同一個自訂群組中。",
    enterSessionId: "輸入這個群組的名字...",
    executeSave: "建立手動群組",

    aiSaveTitle: "AI 智慧多重分類",
    aiSaveDesc: "讓 AI 幫您讀取選取的分頁，自動拆分並命名為多個適合的群組。",
    aiAnalyze: "執行 AI 智慧分組",

    targetSelection: "目前選擇",
    selectAll: "全選",
    deselectAll: "取消全選",
    unsortedData: "未分類分頁",
    stashUnit: "儲存",
    noArchivedData: "目前沒有已儲存的分頁紀錄",
    returnToActive: "返回目前分頁",
    copyright: "版權所有",
    systemId: "Powered by AI",

    // SessionCard
    sessionPurge: "刪除",
    sessionMore: "更多分頁...",
    sessionInit: "還原分頁",

    // Alerts
    errNameRequired: "請為這個群組命名！",
    warnDelete: "確定要刪除這筆紀錄嗎？此動作無法復原。",

    // Dynamic
    groupPrefix: "群組",
    autoSavePrefix: "自動儲存",
    aiFailedTag: "AI-失敗"
  },
  ja: {
    appTitle: "CHANRY",
    appTitleSuffix: "TAB",
    appTitleEnd: "STASH",
    sysVer: "バージョン 1.0",
    activeView: "現在",
    savedView: "保存済み",
    settingsTitle: "設定",
    apiKeyDesc: "AI自動分類を使用するには、GEMINI API KEYが必要です。キーはブラウザのローカルストレージに安全に保存されます。",
    apiKeyLabel: "Google GenAI API キー",
    getKeyLink: "API KEYを取得",
    cancel: "キャンセル",
    confirm: "確認",

    // Grouping
    manualSaveTitle: "手動グループ化",
    manualSaveDesc: "選択したタブを1つのグループにまとめます。",
    enterSessionId: "グループ名を入力...",
    executeSave: "グループを作成",

    aiSaveTitle: "AI 自動分類",
    aiSaveDesc: "AIが選択したタブを分析し、複数のスマートグループに分類します。",
    aiAnalyze: "AIで自動分類する",

    targetSelection: "選択対象",
    selectAll: "すべて選択",
    deselectAll: "選択解除",
    unsortedData: "未分類のタブ",
    stashUnit: "保存",
    noArchivedData: "保存されたセッションが見つかりません。",
    returnToActive: "現在のタブに戻る",
    copyright: "無断転載を禁じます",
    systemId: "Powered by AI",

    // SessionCard
    sessionPurge: "削除",
    sessionMore: "その他のタブ...",
    sessionInit: "復元する",

    // Alerts
    errNameRequired: "グループ名を入力してください。",
    warnDelete: "このセッションを削除してもよろしいですか？",

    // Dynamic
    groupPrefix: "グループ",
    autoSavePrefix: "自動保存",
    aiFailedTag: "AI-失敗"
  }
};
