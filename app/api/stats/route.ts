import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // 테크메니저 수 가져오기
    const technicianCount = await db.collection('technicians').countDocuments();
    
    // 학교 수 가져오기
    const schoolCount = await db.collection('schools').countDocuments();
    
    // 점검 완료된 학교 수 가져오기
    const completedSchoolCount = await db.collection('schools').countDocuments({
      'data.iscomp': 1
    });

    return NextResponse.json({
      success: true,
      data: {
        technicianCount,
        schoolCount,
        completedSchoolCount
      }
    });
  } catch (error) {
    console.error('통계 데이터 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 