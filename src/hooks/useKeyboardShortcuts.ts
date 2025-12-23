import { useEffect } from 'react';
// import { invoke } from '@tauri-apps/api/core';

export type Role = 'coder' | 'reviewer' | 'architect';

export function useKeyboardShortcuts(
    onRoleChange: (role: Role) => void,
    onToggleAirlock: () => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.altKey) {
            switch (e.key) {
                case '1':
                    onRoleChange('coder');
                    // invoke('set_role', { role: 'coder' }).catch(console.error);
                    break;
                case '2':
                    onRoleChange('reviewer');
                    // invoke('set_role', { role: 'reviewer' }).catch(console.error);
                    break;
                case '3':
                    onRoleChange('architect');
                    // invoke('set_role', { role: 'architect' }).catch(console.error);
                    break;
                case 'a':
                    onToggleAirlock();
                    break;
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRoleChange, onToggleAirlock]);
}
