import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { id, password } = await request.json();

    if (!id || !password) {
      return NextResponse.json(
        { success: false, error: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
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