'use client';

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Image from 'next/image';
import KakaoMap from '../components/KakaoMap';
import { School } from '../types/school';

export default function SchoolMap() {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/schools/all');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '데이터를 불러오는데 실패했습니다.');
      }
      
      if (!result.data || !Array.isArray(result.data)) {
        console.log('데이터가 없거나 배열이 아닙니다.');
        setSchools([]);
        return;
      }
      
      setSchools(result.data);
    } catch (error) {
      console.error('학교 데이터 조회 오류:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/edulogo.png"
            alt="교육 로고"
            width={40}
            height={40}
            className="mr-3"
          />
          <h1 className="text-2xl font-semibold text-gray-900">학교 지도</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            전체 ({schools.length})
          </button>
          <button
            onClick={() => handleFilterChange('1팀')}
            className={`px-4 py-2 rounded-md ${
              filter === '1팀'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            1팀 ({schools.filter(school => school.data.team === '1팀').length})
          </button>
          <button
            onClick={() => handleFilterChange('2팀')}
            className={`px-4 py-2 rounded-md ${
              filter === '2팀'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            2팀 ({schools.filter(school => school.data.team === '2팀').length})
          </button>
          <button
            onClick={() => handleFilterChange('3팀')}
            className={`px-4 py-2 rounded-md ${
              filter === '3팀'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            3팀 ({schools.filter(school => school.data.team === '3팀').length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : (
          <div className="h-[600px]">
            <KakaoMap
              schools={schools}
              filter={filter}
              onSchoolSelect={handleSchoolSelect}
            />
          </div>
        )}
      </div>

      {selectedSchool && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{selectedSchool.data.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">주소</p>
              <p className="font-medium">{selectedSchool.data.address}</p>
            </div>
            <div>
              <p className="text-gray-600">교무실</p>
              <p className="font-medium">{selectedSchool.data.teachers_room_num}</p>
            </div>
            <div>
              <p className="text-gray-600">행정실</p>
              <p className="font-medium">{selectedSchool.data.admin_room_num}</p>
            </div>
            <div>
              <p className="text-gray-600">팀</p>
              <p className="font-medium">{selectedSchool.data.team}</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 
