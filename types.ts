
export interface ChromeTab {
  id: number;
  groupId: number; // -1 if not in a group
  title: string;
  url: string;
  favIconUrl?: string;
  active: boolean;
}

export interface ChromeTabGroup {
  id: number;
  title?: string;
  color: 'grey' | 'blue' | 'red' | 'yellow' | 'green' | 'pink' | 'purple' | 'cyan' | 'orange';
  collapsed: boolean;
}

export interface SavedSession {
  id: string;
  name: string;
  createdAt: number;
  tabs: ChromeTab[];
  tags?: string[];
  groupColor?: string; // Store original group color if applicable
}

export interface AIGroupingResponse {
  groups: {
    groupName: string;
    tabIndices: number[]; // Index based on the input array
  }[];
}

export type TabSelection = Set<number>;

export type Language = 'en' | 'zh' | 'ja';
