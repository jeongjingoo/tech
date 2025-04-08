'use client';

import { useState } from 'react';
import Layout from '../../components/Layout';
import Image from 'next/image';
import * as XLSX from 'xlsx';

interface ExcelData {
  [key: string]: any;
}

export default function SettingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [previewData, setPreviewData] = useState<ExcelData[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      readExcelFile(selectedFile);
    }
  };

  const readExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<ExcelData>(worksheet);
      setPreviewData(jsonData.slice(0, 5)); // 처음 5개 행만 미리보기
    };
    reader.readAsBinaryString(file);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('파일을 선택해주세요.');
      return;
    }

    try {
      setUploadStatus('업로드 중...');
      
      // 엑셀 파일 읽기
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelData>(worksheet);

        // MongoDB에 데이터 저장
        const response = await fetch('/api/upload-excel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonData),
        });

        if (response.ok) {
          setUploadStatus('업로드가 완료되었습니다.');
          setPreviewData([]);
          setFile(null);
        } else {
          setUploadStatus('업로드 중 오류가 발생했습니다.');
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      setUploadStatus('오류가 발생했습니다: ' + error);
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
          <h1 className="text-2xl font-semibold text-gray-900">데이터 관리</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">엑셀 데이터 업로드</h2>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
            <button
              onClick={handleUpload}
              disabled={!file}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              업로드
            </button>
          </div>
          {uploadStatus && (
            <p className="mt-2 text-sm text-gray-600">{uploadStatus}</p>
          )}
        </div>

        {previewData.length > 0 && (
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">데이터 미리보기</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(previewData[0]).map((key) => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td
                          key={i}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}