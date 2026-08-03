import React, { useState, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';

export type ThemeId = 'emerald' | 'blue' | 'indigo' | 'teal' | 'amber' | 'rose' | 'slate';

interface ThemeOption {
  id: ThemeId;
  name: string;
  bgHex: string;
}

export const THEMES: ThemeOption[] = [
  { id: 'blue', name: 'Royal Sapphire', bgHex: '#2563eb' },
  { id: 'emerald', name: 'Emerald Growth', bgHex: '#059669' },
  { id: 'indigo', name: 'Executive Indigo', bgHex: '#4f46e5' },
  { id: 'teal', name: 'Industrial Teal', bgHex: '#0d9488' },
  { id: 'amber', name: 'Capital Amber', bgHex: '#d97706' },
  { id: 'rose', name: 'Corporate Rose', bgHex: '#e11d48' },
  { id: 'slate', name: 'Slate Executive', bgHex: '#334155' },
];

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('blue');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('inisio_theme') as ThemeId;
    if (saved && THEMES.some((t) => t.id === saved)) {
      setCurrentTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      setCurrentTheme('blue');
      document.documentElement.setAttribute('data-theme', 'blue');
      localStorage.setItem('inisio_theme', 'blue');
    }
  }, []);

  const changeTheme = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('inisio_theme', themeId);
    setIsOpen(false);
  };

  const activeThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-1.5 transition-all text-xs font-semibold cursor-pointer border border-gray-200/90 shadow-2xs"
        title="Change Website Color Palette"
      >
        <Palette className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="w-3 h-3 rounded-full inline-block border border-black/10 shrink-0" style={{ backgroundColor: activeThemeObj.bgHex }} />
        <span className="hidden xl:inline text-gray-700 font-medium">{activeThemeObj.name.split(' ')[0]}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-200/90 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 font-inter">
              Select Color Theme
            </div>
            <div className="space-y-1 mt-1">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => changeTheme(theme.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-xl transition-all cursor-pointer ${
                    currentTheme === theme.id
                      ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/80'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: theme.bgHex }} />
                    <span>{theme.name}</span>
                  </div>
                  {currentTheme === theme.id && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
