'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Image from 'next/image';

interface School {
  _id?: string;
  data: {
    division: string;
    level: string;
    name: string;
    istech: number;
    address: string;
    total_classes: number;
    teachers_room_num: string;
    admin_room_num: string;
    team: string;
    lat: number;
    lon: number;
  };
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 10;

export default function SchoolsPage() {
  const [schoolData, setSchoolData] = useState<School[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalPages: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<School | null>(null);
  const [formData, setFormData] = useState<School['data']>({
    division: '',
    level: '',
    name: '',
    istech: 0,
    address: '',
    total_classes: 0,
    teachers_room_num: '',
    admin_room_num: '',
    team: '',
    lat: 37.5665,
    lon: 126.9780,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchools(currentPage);
  }, [currentPage]);

  const fetchSchools = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/schools?page=${page}&limit=${ITEMS_PER_PAGE}`);
      const result = await response.json();
      console.log('API 응답 전체:', result);

      if (!result.success) {
        throw new Error(result.error || '데이터를 불러오는데 실패했습니다.');
      }

      if (!result.data || !Array.isArray(result.data)) {
        console.log('데이터가 없거나 배열이 아닙니다.');
        setSchoolData([]);
        return;
      }

      // 서버에서 받아온 데이터를 그대로 사용
      console.log('서버에서 받아온 데이터:', result.data);
      setSchoolData(result.data);
      setPaginationInfo(result.pagination);
    } catch (error) {
      console.error('데이터 조회 오류:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenModal = (item?: School) => {
    if (item) {
      setEditingItem(item);
      setFormData(item.data);
    } else {
      setEditingItem(null);
      setFormData({
        division: '',
        level: '',
        name: '',
        istech: 0,
        address: '',
        total_classes: 0,
        teachers_room_num: '',
        admin_room_num: '',
        team: '',
        lat: 37.5665,
        lon: 126.9780,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      division: '',
      level: '',
      name: '',
      istech: 0,
      address: '',
      total_classes: 0,
      teachers_room_num: '',
      admin_room_num: '',
      team: '',
      lat: 37.5665,
      lon: 126.9780,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'total_classes' || name === 'istech' || name === 'lat' || name === 'lon') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value.trim()
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const response = await fetch('/api/schools', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _id: editingItem._id,
            data: formData
          }),
        });
        const result = await response.json();
        if (result.success) {
          fetchSchools(currentPage);
          handleCloseModal();
        } else {
          setError('데이터 수정에 실패했습니다.');
        }
      } else {
        const response = await fetch('/api/schools', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: formData
          }),
        });
        const result = await response.json();
        if (result.success) {
          fetchSchools(currentPage);
          handleCloseModal();
        } else {
          setError('데이터 추가에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('제출 오류:', error);
      setError('작업 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/schools?id=${id}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (result.success) {
          fetchSchools(currentPage);
        } else {
          setError('데이터 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('삭제 오류:', error);
        setError('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const response = await fetch(`/api/schools/update?id=${id}&iscomp=1`, {
        method: 'PUT',
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // 학교 목록 새로고침
      fetchSchools(currentPage);
    } catch (error) {
      console.error('학교 완료 처리 오류:', error);
      alert('완료 처리에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">로딩 중...</div>
        </div>
      </Layout>
    );
  }

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
          <h1 className="text-2xl font-semibold text-gray-900">학교 관리</h1>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          학교 추가
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>                
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  구분
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  학교급
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  학교명
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  테크센터 OR 튜터
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  총학급수
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  교무실번호
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  행정실번호
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  팀
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  등록일
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  작업
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  점검
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schoolData.length > 0 ? (
                schoolData.map((school) => (
                  <tr key={school._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{school.data.division}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{school.data.level}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{school.data.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{school.data.istech === 1 ? '테크센터' : '튜터'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{school.data.total_classes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{school.data.teachers_room_num}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{school.data.admin_room_num}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{school.data.team}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {new Date(school.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(school)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(school._id!)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">                      
                      <button
                        onClick={() => handleComplete(school._id!)}
                        className="text-red-600 hover:text-red-900"
                      >
                        완료하기
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
                    {isLoading ? '데이터를 불러오는 중...' : '등록된 학교가 없습니다.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="bg-white px-4 py-3 flex items-center justify-center border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-center sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === paginationInfo.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                처음
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === paginationInfo.totalPages}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
              <button
                onClick={() => handlePageChange(paginationInfo.totalPages)}
                disabled={currentPage === paginationInfo.totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                마지막
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? '학교 정보 수정' : '학교 추가'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="division" className="block text-sm font-medium text-gray-700">교육청</label>
                  <input
                    id="division"
                    type="text"
                    name="division"
                    value={formData.division}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700">학교급</label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                    required
                  >
                    <option value="">선택하세요</option>
                    <option value="초등학교">초등학교</option>
                    <option value="중학교">중학교</option>
                    <option value="고등학교">고등학교</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">학교명</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="istech" className="block text-sm font-medium text-gray-700">기술교사</label>
                  <input
                    id="istech"
                    type="text"
                    name="istech"
                    value={formData.istech}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="total_classes" className="block text-sm font-medium text-gray-700">총학급수</label>
                  <input
                    id="total_classes"
                    type="number"
                    name="total_classes"
                    value={formData.total_classes}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="teachers_room_num" className="block text-sm font-medium text-gray-700">교무실번호</label>
                  <input
                    id="teachers_room_num"
                    type="text"
                    name="teachers_room_num"
                    value={formData.teachers_room_num}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="admin_room_num" className="block text-sm font-medium text-gray-700">행정실번호</label>
                  <input
                    id="admin_room_num"
                    type="number"
                    name="admin_room_num"
                    value={formData.admin_room_num}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="team" className="block text-sm font-medium text-gray-700">팀</label>
                  <input
                    id="team"
                    type="text"
                    name="team"
                    value={formData.team}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">주소</label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label htmlFor="lat" className="block text-sm font-medium text-gray-700">위도</label>
                    <input
                      id="lat"
                      type="number"
                      step="0.000001"
                      name="lat"
                      value={formData.lat}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="lon" className="block text-sm font-medium text-gray-700">경도</label>
                    <input
                      id="lon"
                      type="number"
                      step="0.000001"
                      name="lon"
                      value={formData.lon}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    {editingItem ? '수정' : '추가'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 