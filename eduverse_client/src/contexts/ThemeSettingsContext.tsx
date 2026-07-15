'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { createAppTheme } from '@/src/theme/createAppTheme';
import Swal from 'sweetalert2';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'pink';

export interface ColorOption {
  id: AccentColor;
  name: string;
  value: string;
  hoverColor: string;
}

export const accentColors: ColorOption[] = [
  { id: 'red', name: 'Đỏ', value: '#8B1313', hoverColor: '#6D0F0F' },
  { id: 'blue', name: 'Xanh dương', value: '#1976d2', hoverColor: '#115293' },
  { id: 'green', name: 'Xanh lá', value: '#2e7d32', hoverColor: '#1b5e20' },
  { id: 'purple', name: 'Tím', value: '#7b1fa2', hoverColor: '#4a148c' },
  { id: 'orange', name: 'Cam', value: '#ed6c02', hoverColor: '#b55200' },
  { id: 'pink', name: 'Hồng', value: '#d81b60', hoverColor: '#9f1043' },
];

interface ThemeSettingsContextProps {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  currentAccent: ColorOption;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  saveSettings: () => void;
  resetSettings: () => void;
}

const ThemeSettingsContext = createContext<ThemeSettingsContextProps | undefined>(undefined);

export function ThemeSettingsProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [accentColor, setAccentColorState] = useState<AccentColor>('red');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on client-side mount
  useEffect(() => {
    const savedTheme = window.localStorage.getItem('eduverse_theme_mode') as ThemeMode;
    const savedAccent = window.localStorage.getItem('eduverse_accent_color') as AccentColor;


    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedTheme) setThemeModeState(savedTheme);
    if (savedAccent) setAccentColorState(savedAccent);
    setMounted(true);
  }, []);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const activeMode = !mounted
    ? 'light'
    : themeMode === 'system'
      ? (prefersDarkMode ? 'dark' : 'light')
      : themeMode;

  const currentAccent = accentColors.find((c) => c.id === accentColor) || accentColors[0];

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
  };

  const saveSettings = () => {
    window.localStorage.setItem('eduverse_theme_mode', themeMode);
    window.localStorage.setItem('eduverse_accent_color', accentColor);

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: 'success',
      title: 'Đã lưu cài đặt giao diện',
    });
  };

  const resetSettings = () => {
    setThemeModeState('light');
    setAccentColorState('red');
  };

  // Theme dùng chung từ factory (đồng bộ toàn hệ thống)
  const theme = React.useMemo(
    () => createAppTheme(activeMode, currentAccent.value, currentAccent.hoverColor),
    [activeMode, currentAccent],
  );

  return (
    <ThemeSettingsContext.Provider
      value={{
        themeMode,
        accentColor,
        currentAccent,
        setThemeMode,
        setAccentColor,
        saveSettings,
        resetSettings,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeSettingsContext.Provider>
  );
}

export function useThemeSettings() {
  const context = useContext(ThemeSettingsContext);
  if (!context) {
    throw new Error('useThemeSettings must be used within a ThemeSettingsProvider');
  }
  return context;
}
