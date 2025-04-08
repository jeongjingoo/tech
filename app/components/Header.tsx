'use client';

import { BellIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <header className="bg-white border-b">
      <div className="flex items-center justify-end h-16 px-4">
        <div className="flex items-center space-x-4">
          <button className="p-1 rounded-full text-gray-400 hover:text-gray-500">
            <BellIcon className="h-6 w-6" />
          </button>
          
          {user && (
            <div className="flex items-center">
              <img
                className="h-8 w-8 rounded-full"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User avatar"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">
                {user.name} ({user.team})
              </span>
              <button
                onClick={handleLogout}
                className="ml-4 text-red-500 hover:text-red-700 text-sm"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 