'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { 
  HomeIcon, 
  UserGroupIcon, 
  ShoppingBagIcon, 
  ChartBarIcon,
  CalendarIcon,
  UserIcon,
  ClipboardIcon,
  DocumentTextIcon,
  TableCellsIcon,
  DocumentDuplicateIcon,
  Bars3Icon,
  XMarkIcon, 
  Cog6ToothIcon, 
  WrenchIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'TechCenter', icon: HomeIcon, href: '/' },
  { name: '학교목록', icon: DocumentTextIcon, href: '/schoolmap' },
  { name: '유지보수업체', icon: WrenchIcon, href: '/maintenance' },
  { name: 'Q&A', icon: DocumentDuplicateIcon, href: '/qna' },
  { name: '일정표', icon: CalendarIcon, href: '/calendar' },
  { name: '테크메니저', icon: UserGroupIcon, href: '/technician' },
  { 
    name: '설정', 
    icon: Cog6ToothIcon, 
    href: '/setting',
    submenu: [
      { name: '학교 관리', icon: BuildingOfficeIcon, href: '/setting/schools' },
      { name: '엑셀파일 업로드', icon: DocumentDuplicateIcon, href: '/setting/upload' }
    ]
  },
//   { name: '캘린더', icon: CalendarIcon, href: '/calendar' },
//   { name: '프로필', icon: UserIcon, href: '/profile' },
//   { name: '테이블', icon: TableCellsIcon, href: '/tables' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (menuName: string) => {
    setOpenSubmenu(openSubmenu === menuName ? null : menuName);
  };

  return (
    <>
      {/* 모바일 햄버거 메뉴 버튼 */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* 모바일 오버레이 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div className={`
        fixed lg:static inset-y-0 left-0 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 flex items-center">
          <Image
            src="/edulogo.png"
            alt="교육 로고"
            width={32}
            height={32}
            className="mr-2"
          />
          <h1 className="text-2xl font-bold text-indigo-600">TECH_CENTER</h1>
        </div>

        <nav className="mt-4">
          <div className="px-2 space-y-1">
            {menuItems.map((item) => (
              <div key={item.name}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className="w-full flex items-center justify-between px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-md group"
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-8 w-8" />
                        {item.name}
                      </div>
                      {openSubmenu === item.name ? (
                        <ChevronDownIcon className="h-5 w-5" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                      )}
                    </button>
                    {openSubmenu === item.name && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-md group"
                          >
                            <subItem.icon className="mr-3 h-6 w-6" />
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-md group"
                  >
                    <item.icon className="mr-3 h-8 w-8" />
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
} 