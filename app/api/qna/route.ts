import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET: QnA 목록 조회 (페이지네이션 포함)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();
    
    // 전체 데이터 수 조회
    const total = await db.collection('qna').countDocuments();
    
    // 페이지네이션된 데이터 조회
    const qnaList = await db.collection('qna')
      .find({})
      .sort({ createdAt: -1 }) // 최신순 정렬
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return NextResponse.json({
      success: true,
      data: qnaList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('QnA 데이터 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: 'QnA 데이터를 불러오는데 실패했습니다.'
    }, { status: 500 });
  }
}

// POST: 새로운 QnA 작성
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { db } = await connectToDatabase();
    
    const qnaData = {
      title: data.title,
      content: data.content,
      writer: data.writer,
      createdAt: new Date().toISOString(),
      views: 0,
      replies: []
    };
    
    const result = await db.collection('qna').insertOne(qnaData);
    
    return NextResponse.json({
      success: true,
      data: {
        _id: result.insertedId,
        ...qnaData
      }
    });
  } catch (error) {
    console.error('QnA 작성 오류:', error);
    return NextResponse.json({
      success: false,
      error: 'QnA 작성에 실패했습니다.'
    }, { status: 500 });
  }
}

// PUT: QnA 수정
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { db } = await connectToDatabase();
    
    const qnaData = {
      title: data.title,
      content: data.content,
      writer: data.writer,
    };
    
    const result = await db.collection('qna').updateOne(
      { _id: new ObjectId(data._id) },
      { $set: qnaData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: '해당 QnA를 찾을 수 없습니다.'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        _id: data._id,
        ...qnaData
      }
    });
  } catch (error) {
    console.error('QnA 수정 오류:', error);
    return NextResponse.json({
      success: false,
      error: 'QnA 수정에 실패했습니다.'
    }, { status: 500 });
  }
}

// DELETE: QnA 삭제
export async function DELETE(request: Request) {
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
    const result = await db.collection('qna').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: '해당 QnA를 찾을 수 없습니다.'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'QnA가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('QnA 삭제 오류:', error);
    return NextResponse.json({
      success: false,
      error: 'QnA 삭제에 실패했습니다.'
    }, { status: 500 });
  }
} 