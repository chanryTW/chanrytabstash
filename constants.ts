
import React from 'react';
import { ChromeTab, ChromeTabGroup } from './types';

// Using functional component style with React.createElement to avoid JSX in .ts file
const iconProps = (className?: string) => ({
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2", // Thicker stroke for cuter look
  strokeLinecap: "round" as const, // Round caps for cute look
  strokeLinejoin: "round" as const,
  className
});

export const ArchiveIcon = ({ className }: { className?: string }) => (
  React.createElement("svg", iconProps(className),
    React.createElement("rect", { width: "20", height: "5", x: "2", y: "3", rx: "1" }),
    React.createElement("path", { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" }),
    React.createElement("path", { d: "M10 12h4" })
  )
);

export const LayersIcon = ({ className }: { className?: string }) => (
  React.createElement("svg", iconProps(className),
    React.createElement("polygon", { points: "12 2 2 7 12 12 22 7 12 2" }),
    React.createElement("polyline", { points: "2 17 12 22 22 17" }),
    React.createElement("polyline", { points: "2 12 12 17 22 12" })
  )
);

export const SparklesIcon = ({ className }: { className?: string }) => (
  React.createElement("svg", iconProps(className),
    React.createElement("path", { d: "M2 12h20" }),
    React.createElement("path", { d: "M12 2v20" }),
    React.createElement("path", { d: "m4.93 4.93 14.14 14.14" }),
    React.createElement("path", { d: "m19.07 4.93-14.14 14.14" })
  )
);

export const RefreshIcon = ({ className }: { className?: string }) => (
  React.createElement("svg", iconProps(className),
    React.createElement("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }),
    React.createElement("path", { d: "M21 3v9h-9" })
  )
);

export const TrashIcon = ({ className }: { className?: string }) => (
  React.createElement("svg", iconProps(className),
    React.createElement("path", { d: "M3 6h18" }),
    React.createElement("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }),
    React.createElement("path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })
  )
);

export const ExternalLinkIcon = ({ className }: { className?: string }) => (
  React.createElement("svg", iconProps(className),
    React.createElement("path", { d: "M11 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-5" }),
    React.createElement("line", { x1: "10", y1: "14", x2: "21", y2: "3" }),
    React.createElement("polyline", { points: "15 3 21 3 21 9" })
  )
);

export const SettingsIcon = ({ className }: { className?: string }) => (
  React.createElement("svg", iconProps(className),
    React.createElement("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }),
    React.createElement("circle", { cx: "12", cy: "12", r: "3" })
  )
);

export const XIcon = ({ className }: { className?: string }) => (
  React.createElement("svg", iconProps(className),
    React.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
    React.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
  )
);

// Map Chrome Group Colors to Pastel Tailwind classes
export const GROUP_COLOR_MAP: Record<string, string> = {
  grey: 'border-slate-300 text-slate-600 bg-slate-50',
  blue: 'border-blue-300 text-blue-600 bg-blue-50',
  red: 'border-red-300 text-red-600 bg-red-50',
  yellow: 'border-yellow-300 text-yellow-600 bg-yellow-50',
  green: 'border-green-300 text-green-600 bg-green-50',
  pink: 'border-pink-300 text-pink-600 bg-pink-50',
  purple: 'border-purple-300 text-purple-600 bg-purple-50',
  cyan: 'border-cyan-300 text-cyan-600 bg-cyan-50',
  orange: 'border-orange-300 text-orange-600 bg-orange-50',
};

// Mock Groups to demonstrate UI
export const MOCK_GROUPS: ChromeTabGroup[] = [
  { id: 1, title: "Daily Reads", color: 'pink', collapsed: false },
  { id: 2, title: "Study Mat", color: 'purple', collapsed: false }
];

export const MOCK_TABS: ChromeTab[] = [
  { id: 101, groupId: 1, title: "Google Gemini API // Neural Net", url: "https://ai.google.dev", favIconUrl: "https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png", active: true },
  { id: 102, groupId: 1, title: "React Core // Documentation", url: "https://react.dev", favIconUrl: "https://react.dev/favicon.ico", active: false },
  { id: 103, groupId: 2, title: "Chanry's Portfolio // Uplink", url: "https://chanrytw.github.io/", favIconUrl: "", active: false },
  { id: 104, groupId: -1, title: "GitHub // Repository Data", url: "https://github.com/google/genai", favIconUrl: "https://github.com/fluidicon.png", active: false },
  { id: 105, groupId: -1, title: "Cyberpunk Ambience // Audio Stream", url: "https://youtube.com", favIconUrl: "https://www.youtube.com/s/desktop/03f0b22a/img/favicon.ico", active: false },
];
