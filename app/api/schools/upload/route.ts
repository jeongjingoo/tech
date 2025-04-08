import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import * as XLSX from 'xlsx';

interface ExcelRow {
  division?: string;
  level?: string;
  name?: string;
  istech?: string;
  total_classes?: number;
  teachers_room_num?: number;
  admin_room_num?: number;
  team?: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: '파일이 없습니다.' }, { status: 400 });
    }

    // 파일 확장자 검사
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      return NextResponse.json({ success: false, error: '엑셀 파일만 업로드 가능합니다.' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: '데이터가 없습니다.' }, { status: 400 });
    }

    console.log('엑셀에서 파싱된 데이터:', data);

    const { db } = await connectToDatabase();
    const collection = db.collection('school');

    let added = 0;
    let updated = 0;
    let errors = 0;

    for (const row of data) {
      try {
        // 데이터 형식 변환
        const schoolData = {
          data: {
            division: row.division || '',
            level: row.level || '',
            name: row.name || '',
            tech: row.tech || '',
            total_classes: Number(row.total_classes) || 0,
            teacher_room_num: Number(row.teacher_room_num) || 0,
            admin_room_num: Number(row.admin_room_num) || 0,
            team: row.team || '',
          },
          createdAt: new Date().toISOString()
        };

        // 기존 데이터 확인
        const existingSchool = await collection.findOne({
          'data.division': schoolData.data.division,
          'data.level': schoolData.data.level,
          'data.name': schoolData.data.name
        });

        if (existingSchool) {
          // 기존 데이터 업데이트
          await collection.updateOne(
            { _id: existingSchool._id },
            { $set: schoolData }
          );
          updated++;
        } else {
          // 새 데이터 추가
          await collection.insertOne(schoolData);
          added++;
        }
      } catch (error) {
        console.error('데이터 처리 오류:', error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        added,
        updated,
        errors
      }
    });
  } catch (error) {
    console.error('파일 처리 오류:', error);
    return NextResponse.json({ success: false, error: '파일 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 