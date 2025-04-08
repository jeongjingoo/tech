'use client';

import { UsersIcon, ShoppingBagIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import Layout from './components/Layout';
import StatsCard from './components/StatsCard';
import LoginModal from './components/LoginModal';
import { useState, useEffect } from 'react';

interface Stats {
  technicianCount: number;
  schoolCount: number;
  completedSchoolCount: number;
}

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    technicianCount: 0,
    schoolCount: 0,
    completedSchoolCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchStats();
    } else {
      setIsLoginModalOpen(true);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('통계 데이터 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    );
  }

  const statCards = [
    {
      title: '테크메니저 인원',
      value: `${stats.technicianCount}명`,
      link: '/technician',
      icon: UsersIcon,
    },
    {
      title: '관할지역 학교수',
      value: `${stats.schoolCount}개`,
      link: '/schoolmap',
      icon: ShoppingBagIcon,
    },
    {
      title: '점검 완료 학교',
      value: `${stats.completedSchoolCount}개`,
      link: '/schoolmap',
      icon: CurrencyDollarIcon,
    },
  ];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">대시보드</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            link={stat.link}
            icon={stat.icon}
          />
        ))}
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">최근 활동</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500">여기에 최근 활동 내역이 표시됩니다.</p>
        </div>
      </div>
    </Layout>
  );
}
