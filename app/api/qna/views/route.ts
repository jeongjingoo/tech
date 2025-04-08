import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PUT: 조회수 증가
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'QnA ID가 필요합니다.'
      }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    const result = await db.collection('qna').updateOne(
      { _id: new ObjectId(id) },
      { $inc: { views: 1 } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: '해당 QnA를 찾을 수 없습니다.'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: '조회수가 증가되었습니다.'
    });
  } catch (error) {
    console.error('조회수 증가 오류:', error);
    return NextResponse.json({
      success: false,
      error: '조회수 증가에 실패했습니다.'
    }, { status: 500 });
  }
} 