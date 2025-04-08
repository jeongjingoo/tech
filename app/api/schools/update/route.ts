import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const team = searchParams.get('team');
    
    if (!id || !team) {
      return NextResponse.json(
        { success: false, error: 'ID와 team 값이 필요합니다.' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const result = await db.collection('school').updateOne(
      { _id: new ObjectId(id) },
      { $set: { 'data.team': team } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: '해당 학교를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('학교 업데이트 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 