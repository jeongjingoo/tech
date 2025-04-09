import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import * as XLSX from 'xlsx';

// MongoDB 연결 설정
const MONGODB_URI = process.env.MONGODB_URI;

// 엑셀 데이터 타입 정의
interface ExcelRow {
  division: string;
  level: string;
  total_classes: string;
  name: string;
  address: string;
  team: string;
  istech: string;
  teachers_room_num: string;
  admin_room_num: string;
  lat: string;
  lon: string;
}

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: '파일이 제공되지 않았습니다.' }, { status: 400 });
    }

    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI가 설정되지 않았습니다.');
    }

    // 파일을 ArrayBuffer로 변환
    const buffer = await file.arrayBuffer();
    
    // XLSX로 워크북 읽기
    const workbook = XLSX.read(buffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // JSON으로 변환
    const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

    // 데이터 변환 및 저장
    const schools = jsonData.map(row => ({
      data: {
        division: row.division, 
        level: row.level,
        total_classes: row.total_classes,
        name: row.name,
        address: row.address,
        team: row.team,
        istech: row.istech,
        teachers_room_num: row.teachers_room_num,
        admin_room_num: row.admin_room_num,
        lat: row.lat,
        lon: row.lon
      },
      createdAt: new Date()
    }));

    // 데이터베이스에 저장
    const result = await db.collection('schools').insertMany(schools);

    return NextResponse.json({ 
      success: true, 
      message: '엑셀 파일이 성공적으로 업로드되었습니다.',
      data: {
        totalRows: schools.length,
        insertedCount: result.insertedCount
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
} 