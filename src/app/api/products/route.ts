import { NextResponse } from 'next/server';
// ใช้ทางลัด @/ เพื่อพุ่งตรงไปที่ src เสมอ จะได้ไม่ต้องนับจุดถอยหลังครับ
import { prisma } from '@/lib/prisma'; 

export async function GET() {
  try {
    // 1. ดึงข้อมูลสินค้าทั้งหมดจากฐานข้อมูล
    const products = await prisma.product.findMany();

    // 2. จัดกลุ่มสินค้าตามหมวดหมู่ (category) ให้หน้าเว็บเอาไปใช้ง่ายๆ
    const groupedProducts = products.reduce((acc: any, item: any) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    // 3. ส่งข้อมูลกลับไปให้หน้าเว็บ
    return NextResponse.json(groupedProducts);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "ดึงข้อมูลไม่สำเร็จ" }, { status: 500 });
  }
}
// เพิ่มต่อท้ายใน src/app/api/products/route.ts

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // สร้างสินค้าใหม่ใน Database
    const product = await prisma.product.create({
      data: {
        name: body.name,
        price: Number(body.price),
        brand: body.brand,
        category: body.category,
        image: body.image,
        socket: body.socket || null,
        tdp: body.tdp ? Number(body.tdp) : null,
        wattage: body.wattage ? Number(body.wattage) : null,
        stock: body.stock ? Number(body.stock) : 0,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Add Product Error:", error);
    return NextResponse.json({ error: "เพิ่มสินค้าไม่สำเร็จ" }, { status: 500 });
  }
}