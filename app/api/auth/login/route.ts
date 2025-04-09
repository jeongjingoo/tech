import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// OPTIONS: CORS 처리
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  try {
    const { id, password } = await request.json();

    if (!id || !password) {
      return NextResponse.json(
        { success: false, error: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // MongoDB에 연결
    const { db } = await connectToDatabase();
    
    // 사용자 조회
    const technician = await db.collection('technicians').findOne({ id });

    if (!technician) {
      return NextResponse.json(
        { success: false, error: '아이디가 존재하지 않습니다.' },
        { status: 401 }
      );
    }

    if (technician.password !== password) {
      return NextResponse.json(
        { success: false, error: '비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: technician.id,
        name: technician.name,
        team: technician.team
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 