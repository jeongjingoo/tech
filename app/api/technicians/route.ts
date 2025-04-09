import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// MongoDB 연결 설정
const MONGODB_URI = process.env.MONGODB_URI;

// 테크메니저 스키마 정의
const TechnicianSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  team: { type: String, required: true },
  id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'technicians' });

// 모델 생성 (이미 존재하면 재사용)
const Technician = mongoose.models.Technician || mongoose.model('Technician', TechnicianSchema);

// GET: 모든 테크메니저 조회
export async function GET() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI가 설정되지 않았습니다.');
    }
    await mongoose.connect(MONGODB_URI);
    const technicians = await Technician.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: technicians });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  } finally {
    await mongoose.disconnect();
  }
}

// POST: 새로운 테크메니저 추가
export async function POST(request: Request) {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI가 설정되지 않았습니다.');
    }
    await mongoose.connect(MONGODB_URI);
    const data = await request.json();
    console.log(data);
    const technician = await Technician.create(data);
    return NextResponse.json({ success: true, data: technician });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  } finally {
    await mongoose.disconnect();
  }
}

// PUT: 테크메니저 정보 수정
export async function PUT(request: Request) {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI가 설정되지 않았습니다.');
    }
    await mongoose.connect(MONGODB_URI);
    const data = await request.json();
    const { _id, ...updateData } = data;
    const technician = await Technician.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json({ success: true, data: technician });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  } finally {
    await mongoose.disconnect();
  }
}

// DELETE: 테크메니저 삭제
export async function DELETE(request: Request) {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI가 설정되지 않았습니다.');
    }
    await mongoose.connect(MONGODB_URI);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await Technician.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  } finally {
    await mongoose.disconnect();
  }
} 