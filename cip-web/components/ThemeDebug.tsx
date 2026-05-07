"use client";

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';

export function ThemeDebug() {
  const { theme, toggleTheme } = useAppStore();
  const [htmlClass, setHtmlClass] = useState('');

  useEffect(() => {
    // Force update HTML class
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    setHtmlClass(root.className);
    
    console.log('🎨 Theme Debug:', {
      storeTheme: theme,
      htmlClass: root.className,
      isDark: root.classList.contains('dark'),
      isLight: root.classList.contains('light')
    });
  }, [theme]);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] p-4 bg-white dark:bg-slate-800 border-2 border-red-500 rounded-lg shadow-2xl text-xs font-mono">
      <div className="mb-2 font-bold text-red-600 dark:text-red-400">THEME DEBUG</div>
      <div className="space-y-1 text-slate-900 dark:text-white">
        <div>Store: <span className="font-bold">{theme}</span></div>
        <div>HTML: <span className="font-bold">{htmlClass}</span></div>
        <div>BG: <span className="inline-block w-4 h-4 bg-slate-50 dark:bg-slate-900 border"></span></div>
      </div>
      <button
        onClick={() => {
          console.log('🔄 Manual toggle clicked');
          toggleTheme();
        }}
        className="mt-2 w-full px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded font-bold"
      >
        TOGGLE
      </button>
    </div>
  );
}
