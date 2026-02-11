import { useEffect, useState } from 'react';
import { getProfile } from '@/lib/auth';

export default function TopBar() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    getProfile()
      .then(user => setUserName(user.name))
      .catch(() => {});
  }, []);

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{userName}</span>
        <div className="w-8 h-8 rounded-full bg-greenloop-200 flex items-center justify-center text-greenloop-700 font-semibold text-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
