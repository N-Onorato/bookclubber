'use client';

import { logout } from './actions';
import { useTransition } from 'react';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logout();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="px-4 py-2 bg-[#18181B]/60 backdrop-blur-lg rounded-full border border-[#27272A] text-foreground hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? 'Logging out...' : 'Logout'}
    </button>
  );
}
