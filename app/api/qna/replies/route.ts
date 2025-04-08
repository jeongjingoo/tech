import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST: 새로운 답변 추가
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { db } = await connectToDatabase();
    
    const replyData = {
      content: data.content,
      writer: data.writer,
      createdAt: new Date().toISOString()
    };
    
    const result = await db.collection('qna').updateOne(
      { _id: new ObjectId(data.qnaId) },
      { $push: { replies: replyData } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: '해당 QnA를 찾을 수 없습니다.'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: replyData
    });
  } catch (error) {
    console.error('답변 작성 오류:', error);
    return NextResponse.json({
      success: false,
      error: '답변 작성에 실패했습니다.'
    }, { status: 500 });
  }
} 