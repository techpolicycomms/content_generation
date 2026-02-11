import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getAccessiblePaths, Role } from '@/lib/rbac';
import { getProfile, logout } from '@/lib/auth';

const NAV_ITEMS = [
  { path: '/app/dashboard', label: 'Dashboard' },
  { path: '/events', label: 'Events' },
  { path: '/collection', label: 'Collection' },
  { path: '/inventory', label: 'Inventory' },
  { path: '/orders', label: 'Orders' },
  { path: '/smartbins', label: 'Smart Bins' },
  { path: '/reports', label: 'Reports' },
  { path: '/admin/users', label: 'Users' },
];

export default function Sidebar() {
  const router = useRouter();
  const [accessiblePaths, setAccessiblePaths] = useState<string[]>([]);

  useEffect(() => {
    getProfile()
      .then(user => {
        const roles = user.roles as Role[];
        setAccessiblePaths(getAccessiblePaths(roles));
      })
      .catch(() => setAccessiblePaths(['/app/dashboard']));
  }, []);

  const visibleItems = NAV_ITEMS.filter(item =>
    accessiblePaths.some(p => item.path.startsWith(p))
  );

  return (
    <aside className="w-64 bg-greenloop-800 text-white flex flex-col">
      <div className="p-4 border-b border-greenloop-700">
        <h2 className="text-xl font-bold">GreenLoop</h2>
      </div>
      <nav className="flex-1 p-2">
        {visibleItems.map(item => (
          <Link
            key={item.path}
            href={item.path}
            className={`block px-4 py-2 rounded-lg mb-1 transition ${
              router.pathname.startsWith(item.path)
                ? 'bg-greenloop-600'
                : 'hover:bg-greenloop-700'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-greenloop-700">
        <button
          onClick={logout}
          className="w-full text-left px-4 py-2 rounded-lg hover:bg-greenloop-700 transition"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
