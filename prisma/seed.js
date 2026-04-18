const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const products = [
  // --- 🔲 CPU (Processor) ---
  { name: "Intel Core i9-14900K", price: 22900, brand: "Intel", category: "cpu", socket: "LGA1700", tdp: 253, image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=400&auto=format&fit=crop" },
  { name: "AMD Ryzen 9 7950X", price: 19500, brand: "AMD", category: "cpu", socket: "AM5", tdp: 170, image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=400&auto=format&fit=crop" },
  { name: "Intel Core i5-14600K", price: 11500, brand: "Intel", category: "cpu", socket: "LGA1700", tdp: 125, image: "https://images.unsplash.com/photo-1555617766-c94804975da3?q=80&w=400&auto=format&fit=crop" },
  
  // --- 🎛 GPU (Graphics Card) ---
  { name: "NVIDIA RTX 4090", price: 65900, brand: "ASUS", category: "gpu", tdp: 450, image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=400&auto=format&fit=crop" },
  { name: "NVIDIA RTX 4070 Ti", price: 29900, brand: "MSI", category: "gpu", tdp: 285, image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=400&auto=format&fit=crop" },
  { name: "AMD RX 7800 XT", price: 19500, brand: "Sapphire", category: "gpu", tdp: 263, image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=400&auto=format&fit=crop" },
  
  // --- 📟 Motherboard (MB) ---
  { name: "ROG STRIX Z790-E (Intel)", price: 15500, brand: "ASUS", category: "mb", socket: "LGA1700", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop" },
  { name: "B650 TOMAHAWK (AMD)", price: 7900, brand: "MSI", category: "mb", socket: "AM5", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop" },
  
  // --- 📏 Memory (RAM) ---
  { name: "32GB (16x2) DDR5 6000MHz", price: 4500, brand: "CORSAIR", category: "ram", image: "https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?q=80&w=400&auto=format&fit=crop" },
  
  // --- 💿 Storage (SSD) ---
  { name: "1TB NVMe Gen4", price: 3200, brand: "Samsung", category: "ssd", image: "https://m.media-amazon.com/images/I/71u9S+yOOnL.jpg" },
  
  // --- ⚡ Power Supply (PSU) ---
  { name: "1000W 80+ Gold", price: 5900, brand: "Seasonic", category: "psu", wattage: 1000, image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=400&auto=format&fit=crop" },
  { name: "750W 80+ Bronze", price: 2900, brand: "Corsair", category: "psu", wattage: 750, image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=400&auto=format&fit=crop" },
  
  // --- ⬛ Case ---
  { name: "H9 Elite White", price: 8500, brand: "NZXT", category: "case", image: "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=400&auto=format&fit=crop" },
  
  // --- ❄️ Cooling System ---
  { name: "Kraken Elite 360", price: 9900, brand: "NZXT", category: "cooling", image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=400&auto=format&fit=crop" },
  
  // --- 🖥️ Display Monitor (หน้าจอ) ---
  { name: "LG UltraGear 27\" 144Hz 2K", price: 11500, brand: "LG", category: "monitor", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400&auto=format&fit=crop" },
  { name: "ZOWIE XL2546K 24.5\" 240Hz", price: 16900, brand: "Zowie", category: "monitor", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400&auto=format&fit=crop" },
  { name: "Samsung Odyssey G7 27\" 240Hz", price: 19900, brand: "Samsung", category: "monitor", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400&auto=format&fit=crop" },

  // --- ⌨️ Mechanical Keyboard (คีย์บอร์ด) ---
  { name: "Keychron Q1 Pro Wireless", price: 6500, brand: "Keychron", category: "kb", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=400&auto=format&fit=crop" },
  { name: "Razer BlackWidow V4", price: 5900, brand: "Razer", category: "kb", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=400&auto=format&fit=crop" },
  { name: "Logitech G915 TKL Lightspeed", price: 7200, brand: "Logitech", category: "kb", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=400&auto=format&fit=crop" },

  // --- 🖱️ Gaming Mouse (เมาส์) ---
  { name: "Logitech G Pro X Superlight", price: 4990, brand: "Logitech", category: "mouse", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=400&auto=format&fit=crop" },
  { name: "Razer DeathAdder V3 Pro", price: 5590, brand: "Razer", category: "mouse", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=400&auto=format&fit=crop" },
  { name: "ZOWIE EC2-CW Wireless", price: 5990, brand: "Zowie", category: "mouse", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=400&auto=format&fit=crop" }
];

async function main() {
  console.log(`⏳ เริ่มทำการล้างข้อมูลเก่าและเพิ่มข้อมูลใหม่...`);
  
  // (ทางเลือก) ล้างข้อมูลเก่าทิ้งก่อนเพื่อป้องกันการซ้ำซ้อน
  await prisma.product.deleteMany(); 

  for (const p of products) {
    const product = await prisma.product.create({
      data: p,
    });
    console.log(`✅ เพิ่มสินค้า: ${product.name}`);
  }
  console.log(`🎉 สร้างข้อมูลเสร็จสมบูรณ์ทั้งหมด ${products.length} รายการ!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });