import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET: 모든 학교 데이터 조회
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // 전체 데이터 수 조회
    const total = await db.collection('school').countDocuments();
    console.log('전체 데이터 수:', total);
    
    // 모든 데이터 조회
    const schools = await db.collection('school')
      .find({})
      .toArray();
    
    console.log('MongoDB에서 가져온 전체 데이터:', schools.length, '개');
    
    return NextResponse.json({
      success: true,
      data: schools,
      total: total
    });
  } catch (error) {
    console.error('학교 데이터 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: '학교 데이터를 불러오는데 실패했습니다.'
    }, { status: 500 });
  }
} 