import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET: 모든 테크메니저 조회
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const technicians = await db.collection('technicians').find().toArray();
    return NextResponse.json({ success: true, data: technicians });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}

// POST: 새로운 테크메니저 추가
export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    console.log(data);
    const result = await db.collection('technicians').insertOne(data);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}

// PUT: 테크메니저 정보 수정
export async function PUT(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    const { _id, ...updateData } = data;
    const result = await db.collection('technicians').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}

// DELETE: 테크메니저 삭제
export async function DELETE(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID가 제공되지 않았습니다.' }, { status: 400 });
    }
    
    const result = await db.collection('technicians').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
} 