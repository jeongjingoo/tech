import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();
    
    // 전체 데이터 수 조회
    const total = await db.collection('schools').countDocuments();
    console.log('전체 데이터 수:', total);
    
    // 페이지네이션된 데이터 조회
    const schools = await db.collection('schools')
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();
    
    console.log('MongoDB에서 가져온 원본 데이터:', JSON.stringify(schools, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      data: schools,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('데이터 조회 오류:', error);
    return NextResponse.json({ success: false, error: '데이터를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    console.log('추가할 원본 데이터:', data);
    
    // 데이터 형식 확인 및 변환
    const schoolData = {
      data: {
        division: data.data.division || '',
        level: data.data.level || '',
        name: data.data.name || '',
        istech: Number(data.data.istech) || 0,
        address: data.data.address || '',
        total_classes: Number(data.data.total_classes) || 0,
        teachers_room_num: data.data.teacher_room_num || '',
        admin_room_num: data.data.admin_room_num || '',
        team: data.data.team || '',
        lat: Number(data.data.lat) || 37.5665,
        lng: Number(data.data.lng) || 126.9780,
      },
      createdAt: new Date().toISOString(),
    };
    
    console.log('추가할 변환된 데이터:', schoolData);
    const result = await db.collection('schools').insertOne(schoolData);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('데이터 추가 오류:', error);
    return NextResponse.json({ success: false, error: '데이터 추가에 실패했습니다.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    console.log('수정할 원본 데이터:', data);
    const { _id, ...updateData } = data;
    
    // 데이터 형식 확인 및 변환
    const schoolData = {
      data: {
        division: updateData.data.division || '',
        level: updateData.data.level || '',
        name: updateData.data.name || '',
        istech: Number(updateData.data.istech) || 0,
        address: updateData.data.address || '',
        total_classes: Number(updateData.data.total_classes) || 0,
        teachers_room_num: updateData.data.teacher_room_num || '',
        admin_room_num: updateData.data.admin_room_num || '',
        team: updateData.data.team || '',
        lat: Number(updateData.data.lat) || 37.5665,
        lng: Number(updateData.data.lng) || 126.9780,
      }
    };
    
    console.log('수정할 변환된 데이터:', schoolData);
    const result = await db.collection('schools').updateOne(
      { _id: new ObjectId(_id) },
      { $set: schoolData }
    );
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('데이터 수정 오류:', error);
    return NextResponse.json({ success: false, error: '데이터 수정에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID가 필요합니다.' }, { status: 400 });
    }
    const { db } = await connectToDatabase();
    const result = await db.collection('schools').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('데이터 삭제 오류:', error);
    return NextResponse.json({ success: false, error: '데이터 삭제에 실패했습니다.' }, { status: 500 });
  }
} 