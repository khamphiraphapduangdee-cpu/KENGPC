import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 🗑️ ฟังก์ชันสำหรับ "ลบ" สินค้า
export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // <-- แก้ชนิดของ params
) {
  try {
    const resolvedParams = await params; // <-- เพิ่มบรรทัดนี้เพื่อ unwrap Promise
    const id = parseInt(resolvedParams.id);
    
    await prisma.product.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: "ลบสินค้าสำเร็จ" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return NextResponse.json({ error: "ลบสินค้าไม่สำเร็จ" }, { status: 500 });
  }
}

// ✏️ ฟังก์ชันสำหรับ "แก้ไข" สต็อกสินค้า
export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // <-- แก้ชนิดของ params
) {
  try {
    const body = await req.json();
    const resolvedParams = await params; // <-- เพิ่มบรรทัดนี้เพื่อ unwrap Promise
    const id = parseInt(resolvedParams.id);

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        stock: body.stock 
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Update Stock Error:", error);
    return NextResponse.json({ error: "อัปเดตสต็อกไม่สำเร็จ" }, { status: 500 });
  }
}