'use client';

import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Image from 'next/image';

interface Reply {
  content: string;
  writer: string;
  createdAt: string;
}

interface QnaItem {
  _id: string;
  title: string;
  content: string;
  writer: string;
  createdAt: string;
  views: number;
  replies: Reply[];
}

export default function QnaPage() {
  const [qnaData, setQnaData] = useState<QnaItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedQna, setSelectedQna] = useState<QnaItem | null>(null);
  const [editingItem, setEditingItem] = useState<QnaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<QnaItem>>({
    title: '',
    content: '',
    writer: ''
  });
  const [replyFormData, setReplyFormData] = useState({
    content: '',
    writer: ''
  });

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchQnaData();
  }, [currentPage]);

  const fetchQnaData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/qna?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '데이터를 불러오는데 실패했습니다.');
      }
      
      setQnaData(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.total);
    } catch (error) {
      console.error('QnA 데이터 조회 오류:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenModal = (item?: QnaItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        content: item.content,
        writer: item.writer
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        content: '',
        writer: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      title: '',
      content: '',
      writer: ''
    });
  };

  const handleOpenDetailModal = (item: QnaItem) => {
    setSelectedQna(item);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedQna(null);
  };

  const handleOpenReplyModal = (item: QnaItem) => {
    setSelectedQna(item);
    setReplyFormData({
      content: '',
      writer: ''
    });
    setIsReplyModalOpen(true);
  };

  const handleCloseReplyModal = () => {
    setIsReplyModalOpen(false);
    setSelectedQna(null);
    setReplyFormData({
      content: '',
      writer: ''
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReplyInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReplyFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // 수정
        const response = await fetch('/api/qna', {
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
        const response = await fetch('/api/qna', {
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
      fetchQnaData();
    } catch (error) {
      console.error('QnA 저장 오류:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedQna) return;

      const response = await fetch('/api/qna/replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qnaId: selectedQna._id,
          ...replyFormData
        }),
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }
      
      handleCloseReplyModal();
      fetchQnaData();
    } catch (error) {
      console.error('답변 작성 오류:', error);
      alert('답변 작성에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/qna?id=${id}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error);
        }
        
        fetchQnaData();
      } catch (error) {
        console.error('QnA 삭제 오류:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleIncreaseViews = async (id: string) => {
    try {
      const response = await fetch(`/api/qna/views?id=${id}`, {
        method: 'PUT',
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }
      
      fetchQnaData();
    } catch (error) {
      console.error('조회수 증가 오류:', error);
    }
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
          <h1 className="text-2xl font-semibold text-gray-900">Q&A 게시판</h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          문의하기
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
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  번호
                </th> */}
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">
                  제목
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-24 text-center whitespace-nowrap">
                  작성자
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-32 text-center whitespace-nowrap">
                  작성일자
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-20 text-center whitespace-nowrap">
                  조회수
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-24 text-center whitespace-nowrap">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {qnaData.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item._id}
                  </td> */}
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:text-indigo-600 text-center"
                    onClick={() => {
                      handleIncreaseViews(item._id);
                      handleOpenDetailModal(item);
                    }}
                  >
                    <div className="flex items-center justify-center">
                      {item.title}
                      {item.replies && item.replies.length > 0 && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                          답변 {item.replies.length}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {item.writer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {item.views}
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

      {/* QnA 작성/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Q&A 수정' : 'Q&A 작성'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">제목</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">내용</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">작성자</label>
                  <input
                    type="text"
                    name="writer"
                    value={formData.writer}
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
                    {editingItem ? '수정' : '작성'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* QnA 상세 모달 */}
      {isDetailModalOpen && selectedQna && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedQna.title}</h3>
                <button
                  onClick={handleCloseDetailModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>작성자: {selectedQna.writer}</span>
                  <span>작성일: {new Date(selectedQna.createdAt).toLocaleDateString()}</span>
                  <span>조회수: {selectedQna.views}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-md text-black">
                  {selectedQna.content}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-md font-medium text-gray-900">답변</h4>
                  <button
                    onClick={() => handleOpenReplyModal(selectedQna)}
                    className="text-sm text-indigo-600 hover:text-indigo-900 text-black"
                  >
                    답변 작성
                  </button>
                </div>
                {selectedQna.replies && selectedQna.replies.length > 0 ? (
                  <div className="space-y-4">
                    {selectedQna.replies.map((reply, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-md">
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                          <span>{reply.writer}</span>
                          <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className='text-black'>{reply.content}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    아직 답변이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 답변 작성 모달 */}
      {isReplyModalOpen && selectedQna && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                답변 작성
              </h3>
              <form onSubmit={handleReplySubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">내용</label>
                  <textarea
                    name="content"
                    value={replyFormData.content}
                    onChange={handleReplyInputChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">작성자</label>
                  <input
                    type="text"
                    name="writer"
                    value={replyFormData.writer}
                    onChange={handleReplyInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseReplyModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    작성
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