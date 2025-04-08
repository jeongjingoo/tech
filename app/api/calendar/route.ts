import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET: 일정 목록 조회
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const events = await db.collection('calendar').find({}).toArray();
    
    return NextResponse.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('일정 데이터 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: '일정 데이터를 불러오는데 실패했습니다.'
    }, { status: 500 });
  }
}

// POST: 새로운 일정 추가
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { db } = await connectToDatabase();
    
    const eventData = {
      title: data.title,
      start: data.start,
      end: data.end,
      description: data.description || '',
      createdAt: new Date().toISOString()
    };
    
    const result = await db.collection('calendar').insertOne(eventData);
    
    return NextResponse.json({
      success: true,
      data: {
        _id: result.insertedId,
        ...eventData
      }
    });
  } catch (error) {
    console.error('일정 추가 오류:', error);
    return NextResponse.json({
      success: false,
      error: '일정 추가에 실패했습니다.'
    }, { status: 500 });
  }
}

// PUT: 일정 수정
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { db } = await connectToDatabase();
    
    const eventData = {
      title: data.title,
      start: data.start,
      end: data.end,
      description: data.description || ''
    };
    
    const result = await db.collection('calendar').updateOne(
      { _id: new ObjectId(data._id) },
      { $set: eventData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: '해당 일정을 찾을 수 없습니다.'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        _id: data._id,
        ...eventData
      }
    });
  } catch (error) {
    console.error('일정 수정 오류:', error);
    return NextResponse.json({
      success: false,
      error: '일정 수정에 실패했습니다.'
    }, { status: 500 });
  }
}

// DELETE: 일정 삭제
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: '일정 ID가 필요합니다.'
      }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    const result = await db.collection('calendar').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: '해당 일정을 찾을 수 없습니다.'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: '일정이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('일정 삭제 오류:', error);
    return NextResponse.json({
      success: false,
      error: '일정 삭제에 실패했습니다.'
    }, { status: 500 });
  }
} 