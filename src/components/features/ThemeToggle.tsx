'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleCheckedChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <Label htmlFor="theme-switch">
                Dark Mode
            </Label>
        </div>
      <Switch
        id="theme-switch"
        checked={theme === 'dark'}
        onCheckedChange={handleCheckedChange}
      />
    </div>
  );
}
