import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

// GET: 유지보수업체 목록 조회 (페이지네이션 포함)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();
    
    // 전체 데이터 수 조회
    const total = await db.collection('maintenance').countDocuments();
    
    // 페이지네이션된 데이터 조회
    const maintenanceList = await db.collection('maintenance')
      .find({})
      .sort({ createdAt: -1 }) // 최신순 정렬
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return NextResponse.json({
      success: true,
      data: maintenanceList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('유지보수업체 데이터 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: '유지보수업체 데이터를 불러오는데 실패했습니다.'
    }, { status: 500 });
  }
}

// POST: 새로운 유지보수업체 추가
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { db } = await connectToDatabase();
    
    const maintenanceData = {
      school_name: data.school_name,
      stuff: data.stuff,
      com_name: data.com_name,
      phone: data.phone,
      licence: data.licence,
      createdAt: new Date().toISOString()
    };
    
    const result = await db.collection('maintenance').insertOne(maintenanceData);
    
    return NextResponse.json({
      success: true,
      data: {
        _id: result.insertedId,
        ...maintenanceData
      }
    });
  } catch (error) {
    console.error('유지보수업체 추가 오류:', error);
    return NextResponse.json({
      success: false,
      error: '유지보수업체 추가에 실패했습니다.'
    }, { status: 500 });
  }
}

// PUT: 유지보수업체 수정
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { db } = await connectToDatabase();
    
    const maintenanceData = {
      school_name: data.school_name,
      stuff: data.stuff,
      com_name: data.com_name,
      phone: data.phone,
      licence: data.licence
    };
    
    const result = await db.collection('maintenance').updateOne(
      { _id: new ObjectId(data._id) },
      { $set: maintenanceData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: '해당 유지보수업체를 찾을 수 없습니다.'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        _id: data._id,
        ...maintenanceData
      }
    });
  } catch (error) {
    console.error('유지보수업체 수정 오류:', error);
    return NextResponse.json({
      success: false,
      error: '유지보수업체 수정에 실패했습니다.'
    }, { status: 500 });
  }
}

// DELETE: 유지보수업체 삭제
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: '유지보수업체 ID가 필요합니다.'
      }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    const result = await db.collection('maintenance').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: '해당 유지보수업체를 찾을 수 없습니다.'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: '유지보수업체가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('유지보수업체 삭제 오류:', error);
    return NextResponse.json({
      success: false,
      error: '유지보수업체 삭제에 실패했습니다.'
    }, { status: 500 });
  }
} 