'use client';

import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

interface MaintenanceCompany {
  _id: string;
  school_name: string;
  stuff: string;
  com_name: string;
  phone: string;
  licence: string;
  createdAt: string;
}

export default function MaintenancePage() {
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceCompany[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaintenanceCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MaintenanceCompany>>({
    school_name: '',
    stuff: '',
    com_name: '',
    phone: '',
    licence: ''
  });

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchMaintenanceData();
  }, [currentPage]);

  const fetchMaintenanceData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/maintenance?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '데이터를 불러오는데 실패했습니다.');
      }
      
      setMaintenanceData(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.total);
    } catch (error) {
      console.error('유지보수업체 데이터 조회 오류:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenModal = (item?: MaintenanceCompany) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        school_name: item.school_name,
        stuff: item.stuff,
        com_name: item.com_name,
        phone: item.phone,
        licence: item.licence
      });
    } else {
      setEditingItem(null);
      setFormData({
        school_name: '',
        stuff: '',
        com_name: '',
        phone: '',
        licence: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      school_name: '',
      stuff: '',
      com_name: '',
      phone: '',
      licence: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // 수정
        const response = await fetch('/api/maintenance', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _id: editingItem._id,
            ...formData
          }),
        });
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error);
        }
      } else {
        // 추가
        const response = await fetch('/api/maintenance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error);
        }
      }
      
      handleCloseModal();
      fetchMaintenanceData();
    } catch (error) {
      console.error('유지보수업체 저장 오류:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/maintenance?id=${id}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error);
        }
        
        fetchMaintenanceData();
      } catch (error) {
        console.error('유지보수업체 삭제 오류:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">유지보수업체 목록</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          유지보수업체 추가
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
                <th className="px-6 py-3 text-center whitespace-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">
                  학교명
                </th>
                <th className="px-6 py-3 text-center whitespace-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유지보수대상
                </th>
                <th className="px-6 py-3 text-center whitespace-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">
                  업체명
                </th>
                <th className="px-6 py-3 text-center whitespace-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">
                  연락처
                </th>
                <th className="px-6 py-3 text-center whitespace-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">
                  정보통신면허보유
                </th>
                <th className="px-6 py-3 text-center whitespace-nowrap text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {maintenanceData.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {item.school_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {item.stuff}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {item.com_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {item.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {item.licence === '1' ? '보유' : '미보유'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                전체 <span className="font-medium">{totalItems}</span>개 중{' '}
                <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>부터{' '}
                <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span>까지 표시
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === index + 1
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? '유지보수업체 수정' : '유지보수업체 추가'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">학교명</label>
                  <input
                    type="text"
                    name="school_name"
                    value={formData.school_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">담당자</label>
                  <input
                    type="text"
                    name="stuff"
                    value={formData.stuff}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">업체명</label>
                  <input
                    type="text"
                    name="com_name"
                    value={formData.com_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">연락처</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">면허번호</label>
                  <input
                    type="text"
                    name="licence"
                    value={formData.licence}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                    required
                  />
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