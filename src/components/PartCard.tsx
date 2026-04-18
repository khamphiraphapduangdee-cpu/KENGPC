// src/components/PartCard.tsx
import React from 'react';

// 1. ต้องเพิ่ม selectText เข้าไปใน interface นี้ (เพื่อให้หายแดง)
interface PartCardProps {
  label: string;
  icon: string;
  selectText: string; // เพิ่มบรรทัดนี้
}

// 2. รับค่า selectText มาใช้งาน
export default function PartCard({ label, icon, selectText }: PartCardProps) {
  return (
    <div className="group bg-pc-surface/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex justify-between items-center hover:border-neon-cyan/50 hover:bg-pc-surface/80 transition-all cursor-pointer active:scale-95 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-pc-dark border border-white/10 rounded-xl flex items-center justify-center text-xl group-hover:text-neon-cyan transition-colors shadow-inner">
          {icon}
        </div>
        
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">{label}</span>
          {/* 3. นำค่า selectText มาแสดงตรงนี้ */}
          <span className="text-md font-bold text-gray-300 group-hover:text-white transition-colors">
            {selectText}
          </span>
        </div>
      </div>

      <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-600 group-hover:border-neon-cyan group-hover:text-neon-cyan transition-all">
        ＋
      </div>
    </div>
  );
}