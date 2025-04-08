import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// MongoDB 연결 설정
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/schools';

// 데이터 모델 정의
const ExcelDataSchema = new mongoose.Schema({
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'school' });

// 모델 생성 (이미 존재하면 재사용)
const ExcelData = mongoose.model('school', ExcelDataSchema);

export async function POST(request: Request) {
  try {
    // MongoDB 연결
    await mongoose.connect(MONGODB_URI);

    // 요청 데이터 파싱
    const rows = await request.json();

    // 각 행을 개별적으로 저장
    const savedRows = await Promise.all(
      rows.map(async (row: any) => {
        return await ExcelData.create({
          data: row
        });
      })
    );

    return NextResponse.json({ 
      success: true, 
      message: `${savedRows.length}개의 데이터가 성공적으로 저장되었습니다.`,
      data: savedRows 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: '데이터 저장 중 오류가 발생했습니다.',
      error: error 
    }, { status: 500 });
  } finally {
    // MongoDB 연결 종료
    await mongoose.disconnect();
  }
} 