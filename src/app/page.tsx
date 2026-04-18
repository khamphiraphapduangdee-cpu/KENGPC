"use client";

import React, { useState, useEffect } from 'react';
import PartCard from '@/components/PartCard';
import { Toaster, toast } from 'react-hot-toast';
import Image from 'next/image';
import * as htmlToImage from 'html-to-image';
import { useRouter } from 'next/navigation'; // <-- 1. เพิ่มตัวเปลี่ยนหน้า

export default function Home() {
  const router = useRouter(); // <-- เปิดใช้งาน Router

  // --- 1. State สำหรับ Database ---
  const [PRODUCT_DATA, setPRODUCT_DATA] = useState<any>({});
  const [isLoadingDB, setIsLoadingDB] = useState(true);

  // --- 2. State พื้นฐานของหน้าเว็บ ---
  const [lang, setLang] = useState<'en' | 'th'>('en');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedParts, setSelectedParts] = useState<any>({});
  
  // ป้องกัน UI แตก (Hydration Mismatch) ใน Next.js
  const [isMounted, setIsMounted] = useState(false);

  // --- 3. Modal States ---
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  // --- 4. ดึงข้อมูลจาก API (Database) ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("⏳ กำลังดึงข้อมูลจาก Database...");
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); 
        
        console.log("✅ ดึงข้อมูลสำเร็จ! หน้าตาแบบนี้:", data);
        setPRODUCT_DATA(data); 
      } catch (error) {
        console.error("❌ ดึงข้อมูลพลาด (เช็ค API Route ด่วน!):", error);
      } finally {
        setIsLoadingDB(false);
      }
    };

    fetchProducts();
  }, []);

  // --- 💾 5. ระบบ AUTO-SAVE (LocalStorage) ---
  useEffect(() => {
    setIsMounted(true);
    const savedSpec = localStorage.getItem('keng-spec');
    if (savedSpec) {
      try {
        setSelectedParts(JSON.parse(savedSpec));
        toast('Loaded saved specification', { icon: '💾', style: { background: '#1A1A1A', color: '#00f2ff', border: '1px solid #00f2ff' } });
      } catch (e) {
        console.error("Error parsing saved spec");
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('keng-spec', JSON.stringify(selectedParts));
    }
  }, [selectedParts, isMounted]);

  // --- ⚡ 6. ระบบคำนวณวัตต์ไฟ (WATTAGE CALCULATOR) ---
  const calculateTotalWattage = (partsObject: any) => {
    let total = 50; 
    if (partsObject.cpu?.tdp) total += partsObject.cpu.tdp;
    if (partsObject.gpu?.tdp) total += partsObject.gpu.tdp;
    return total;
  };

  const estimatedWatt = calculateTotalWattage(selectedParts);
  const selectedPsuWatt = selectedParts.psu?.wattage || 0;

  // --- 7. คำนวณราคาและระบบภาษา ---
  const totalPrice: number = Object.values(selectedParts).reduce((sum: number, item: any) => sum + (item.price || 0), 0);

  const t = {
    en: {
      subtitle: "Next-Gen PC Architect & Builder",
      systemStatus: "Keng Intelligence System",
      header: "Hardware Selection",
      partsCount: "Parts",
      total: "Total Amount",
      btnOrder: "Checkout",
      btnShare: "Share Spec",
      sysReady: "System Ready",
      powerLabel: "Est. Power",
      select: "Select Component",        
      checkoutTitle: "Checkout Summary", 
      searchPlaceholder: "Search brand or model...",
      parts: { cpu: "Processor (CPU)", gpu: "Graphics Card (GPU)", mb: "Motherboard", ram: "Memory (RAM)", ssd: "Storage (SSD/HDD)", psu: "Power Supply (PSU)", case: "Case", cooling: "Cooling System", monitor: "Display Monitor", mouse: "Gaming Mouse", kb: "Mechanical Keyboard" }
    },
    th: {
      subtitle: "สถาปนิกและผู้สร้างคอมพิวเตอร์ยุคใหม่",
      systemStatus: "ระบบอัจฉริยะ Keng",
      header: "เลือกอุปกรณ์ฮาร์ดแวร์",
      partsCount: "อุปกรณ์",
      total: "ราคารวมทั้งหมด",
      btnOrder: "ชำระเงิน",
      select: "เลือกอุปกรณ์",               
      checkoutTitle: "สรุปรายการสั่งซื้อ",   
      btnShare: "แชร์สเปก",
      sysReady: "อุปกรณ์เข้ากันได้",
      powerLabel: "ใช้พลังงาน",
      searchPlaceholder: "ค้นหาชื่อแบรนด์หรือรุ่น...",
      parts: { cpu: "ซีพียู (CPU)", gpu: "การ์ดจอ (GPU)", mb: "เมนบอร์ด", ram: "แรม (RAM)", ssd: "หน่วยความจำ (SSD/HDD)", psu: "พาวเวอร์ซัพพลาย", case: "เคสคอมพิวเตอร์", cooling: "ระบบระบายความร้อน", monitor: "หน้าจอคอมพิวเตอร์", mouse: "เมาส์เกมมิ่ง", kb: "คีย์บอร์ดแมคคานิคอล" }
    }
  };
  const content = t[lang];

  // --- 8. ฟังก์ชันการทำงานต่างๆ ---
  const removeItem = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = { ...selectedParts };
    delete newSelected[category];
    setSelectedParts(newSelected);
  };

  const confirmExecuteReset = () => {
    setSelectedParts({});
    setActiveCategory(null);
    setShowConfirmReset(false);
    toast(lang === 'en' ? 'Configuration Cleared' : 'ล้างรายการทั้งหมดแล้ว', {
      icon: '🗑️',
      style: { background: '#1A1A1A', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
    });
  };

  // 🚀 ฟังก์ชันส่งข้อมูลไปหน้า Checkout
  const handleGoToCheckout = () => {
    // 1. แปลง Object (เช่น { cpu: {...}, gpu: {...} }) เป็น Array
    const cartArray = Object.values(selectedParts);
    
    // 2. เซฟลง LocalStorage ในชื่อ pc_cart เพื่อให้หน้า Checkout ดึงไปใช้
    localStorage.setItem('pc_cart', JSON.stringify(cartArray));
    
    // 3. เด้งไปหน้าชำระเงิน
    router.push('/checkout');
  };

  const getFilteredProducts = () => {
    if (!activeCategory || !PRODUCT_DATA[activeCategory]) return [];
    let filtered = [...PRODUCT_DATA[activeCategory]];
    if (searchQuery) filtered = filtered.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    if (sortOrder === 'asc') filtered.sort((a, b) => a.price - b.price);
    else if (sortOrder === 'desc') filtered.sort((a, b) => b.price - a.price);
    return filtered;
  };

  const handleDownloadSpec = async () => {
    const element = document.getElementById('spec-receipt');
    if (!element) return;
    const toastId = toast.loading(lang === 'en' ? 'Generating image...' : 'กำลังประมวลผลรูปภาพ...');
    try {
      const dataUrl = await htmlToImage.toPng(element, { backgroundColor: '#0a0a0a', pixelRatio: 2, skipFonts: true });
      const link = document.createElement('a');
      link.download = `KENG-CUSTOM-SPEC-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success(lang === 'en' ? 'Image saved successfully!' : 'บันทึกรูปภาพสำเร็จ!', { id: toastId });
    } catch (error) {
      toast.error('Error generating image', { id: toastId });
    }
  };

  // ป้องกันปัญหา Render บน Server กับ Client ไม่ตรงกัน (Hydration)
  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-pc-dark text-white p-6 md:p-12 relative overflow-hidden pb-40">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:30px_30px] -z-10"></div>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end gap-3 mb-8">
          <div className="flex bg-pc-surface/50 p-1 rounded-xl border border-white/5">
            <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${lang === 'en' ? 'bg-neon-cyan text-pc-dark shadow-[0_0_10px_#00f2ff]' : 'text-gray-500 hover:text-white'}`}>EN</button>
            <button onClick={() => setLang('th')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${lang === 'th' ? 'bg-neon-cyan text-pc-dark shadow-[0_0_10px_#00f2ff]' : 'text-gray-500 hover:text-white'}`}>TH</button>
          </div>
        </div>

        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-6xl font-black italic tracking-tighter uppercase mb-2">
              <span className="text-neon-cyan drop-shadow-[0_0_15px_rgba(0,242,255,0.6)]">KENG</span>
              <span className="text-white"> CUSTOM</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.5em] ml-1">{content.subtitle}</p>
          </div>
          <div className="bg-pc-surface/50 border border-white/5 px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-inner">
            <span className="w-2.5 h-2.5 bg-neon-cyan rounded-full animate-pulse shadow-[0_0_8px_#00f2ff]"></span>
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{content.systemStatus}</span>
          </div>
        </header>

        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-6 w-1.5 bg-neon-cyan shadow-[0_0_10px_#00f2ff]"></div>
            <h2 className="text-xl font-black uppercase tracking-widest">{content.header}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(content.parts).map((key) => (
              <div key={key} className="relative group/card">
                <div onClick={() => {
                  setActiveCategory(key);
                  setSearchQuery("");
                  setSortOrder(null);
                }}>
                  <PartCard
                    label={(content.parts as any)[key]}
                    icon={key === 'cpu' ? "🔲" : key === 'gpu' ? "🎛" : key === 'mb' ? "📟" : key === 'ram' ? "📏" : key === 'ssd' ? "💿" : key === 'psu' ? "⚡" : key === 'case' ? "⬛" : key === 'cooling' ? "❄️" : key === 'monitor' ? "🖥️" : key === 'kb' ? "⌨️" : "🖱️"}
                    selectText={selectedParts[key] ? selectedParts[key].name : content.select}
                  />
                </div>
                {selectedParts[key] && (
                  <button onClick={(e) => removeItem(key, e)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 text-white rounded-full text-[10px] font-bold shadow-lg shadow-red-500/20 transition-all z-10 flex items-center justify-center border border-white/10">✕</button>
                )}
              </div>
            ))}
          </div>

          {activeCategory && (
            <div className="mt-8 mb-40 p-6 bg-pc-surface border border-neon-cyan/30 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-neon-cyan uppercase tracking-widest italic">
                  Select {(content.parts as any)[activeCategory]}
                </h3>
                <button onClick={() => setActiveCategory(null)} className="text-[10px] font-black text-gray-400 hover:text-white uppercase bg-white/5 px-4 py-1.5 rounded-full transition-all">Close ✕</button>
              </div>

              <div className="flex gap-2 mb-6">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={content.searchPlaceholder} className="flex-1 bg-pc-dark border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-cyan focus:outline-none transition-colors" />
                <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="bg-pc-dark border border-white/10 px-4 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:border-neon-cyan transition-colors whitespace-nowrap">
                  {sortOrder === 'asc' ? '⬆️ Price' : sortOrder === 'desc' ? '⬇️ Price' : '↕️ Sort'}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar border-t border-white/5 pt-4">
                {isLoadingDB ? (
                  <div className="text-center text-neon-cyan py-10 animate-pulse">Loading parts from database...</div>
                ) : getFilteredProducts().length === 0 ? (
                  <p className="text-center text-gray-500 py-10">No items found</p>
                ) : (
                  getFilteredProducts().map((item: any) => (
                    <div key={item.id} onClick={() => { 
                        // 1. เช็ค Socket (CPU & MB)
                        if (activeCategory === 'mb' && selectedParts.cpu && item.socket !== selectedParts.cpu.socket) {
                          toast.error(lang === 'en' ? `Needs ${selectedParts.cpu.socket} socket` : `เมนบอร์ดนี้ไม่รองรับ (ต้องการ Socket ${selectedParts.cpu.socket})`, { style: { background: '#3b0707', color: '#ff4d4d', border: '1px solid red' }});
                          return;
                        }
                        if (activeCategory === 'cpu' && selectedParts.mb && item.socket !== selectedParts.mb.socket) {
                          toast.error(lang === 'en' ? `Needs ${selectedParts.mb.socket} socket` : `ซีพียูนี้ใส่กับเมนบอร์ดที่เลือกไม่ได้ (ต้องการ Socket ${selectedParts.mb.socket})`, { style: { background: '#3b0707', color: '#ff4d4d', border: '1px solid red' }});
                          return;
                        }

                        // 2. เช็ค PSU Wattage
                        const projectedParts = { ...selectedParts, [activeCategory]: item };
                        const projectedWatt = calculateTotalWattage(projectedParts);
                        const requiredWatt = projectedWatt + 100; // เผื่อ 100W

                        if (projectedParts.psu && projectedParts.psu.wattage < requiredWatt) {
                          toast.error(
                            lang === 'en' ? `Power Warning! Requires at least ${requiredWatt}W PSU` : `กำลังไฟไม่พอ! สเปกนี้ต้องการ Power Supply ขั้นต่ำ ${requiredWatt}W`, 
                            { icon: '⚡', style: { background: '#3b0707', color: '#ff4d4d', border: '1px solid red' }, duration: 4000 }
                          );
                          return;
                        }

                        // ผ่านฉลุย! เพิ่มเข้าระบบ
                        setSelectedParts(projectedParts); 
                        setActiveCategory(null); 
                        toast.success(lang === 'en' ? `${item.name} Selected` : `เพิ่ม ${item.name} เรียบร้อย`, { icon: '✅', style: { background: '#1A1A1A', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } });
                      }}
                      className="flex justify-between items-center p-4 bg-pc-dark border border-white/5 rounded-2xl hover:border-neon-cyan/40 hover:bg-pc-surface transition-all group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-black/50 group-hover:border-neon-cyan/50 transition-colors shrink-0 relative">
                          <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-neon-cyan font-black uppercase tracking-widest opacity-60 mb-1">
                            {item.brand} 
                            {item.socket && <span className="text-gray-500 ml-2">[{item.socket}]</span>}
                            {item.tdp && <span className="text-yellow-500 ml-2">⚡ {item.tdp}W</span>}
                            {item.wattage && <span className="text-yellow-500 ml-2">⚡ {item.wattage}W</span>}
                          </p>
                          <p className="font-bold text-gray-300 group-hover:text-white transition-colors line-clamp-1">{item.name}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="font-black text-xl md:text-2xl text-white group-hover:text-neon-cyan transition-colors italic">{item.price.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-600 font-bold uppercase">THB</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Floating Summary Bar --- */}
      {Object.keys(selectedParts).length > 0 && !showShareModal && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-40 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="bg-pc-surface/90 backdrop-blur-2xl border border-neon-cyan/40 p-4 md:p-6 rounded-[32px] shadow-[0_-10px_40px_-15px_rgba(0,242,255,0.4)] flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-start">
              
              <div className="text-center md:text-left hidden md:block">
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">{content.partsCount}</p>
                <p className="text-neon-cyan font-mono font-black">{Object.keys(selectedParts).length} / 11</p>
              </div>
              
              <div className="h-8 w-px bg-white/10 hidden md:block"></div>

              {/* ป้ายแสดงการใช้พลังงาน (Wattage) */}
              <div className="text-center md:text-left">
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">{content.powerLabel}</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg font-black italic tracking-tighter ${selectedPsuWatt > 0 && estimatedWatt + 100 > selectedPsuWatt ? 'text-red-500' : 'text-yellow-400'}`}>
                    ⚡ {estimatedWatt}W
                  </span>
                  {selectedPsuWatt > 0 && <span className="text-[10px] text-gray-500">/ {selectedPsuWatt}W</span>}
                </div>
              </div>

              <div className="h-8 w-px bg-white/10 hidden md:block"></div>
              
              <div className="text-center md:text-left">
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">{content.total}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl md:text-3xl font-black text-white italic tracking-tighter">{totalPrice.toLocaleString()}</span>
                  <span className="text-neon-cyan font-bold text-[10px]">THB</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
              <button onClick={() => setShowConfirmReset(true)} className="p-3 text-[16px] text-gray-400 hover:text-red-400 transition-colors bg-white/5 rounded-xl flex-shrink-0" title="Reset">🗑️</button>
              <button onClick={() => setShowShareModal(true)} className="hidden md:block px-4 py-3 bg-pc-dark border border-white/10 text-white font-black rounded-xl uppercase tracking-widest text-[10px] hover:border-neon-cyan hover:text-neon-cyan transition-all flex-shrink-0">
                 {content.btnShare}
              </button>
              
              {/* --- เปลี่ยนปุ่มนี้ให้เรียกฟังก์ชันไปยังหน้า Checkout --- */}
              <button onClick={handleGoToCheckout} className="flex-1 px-4 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple text-pc-dark font-black rounded-xl uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(0,242,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap">
                {content.btnOrder}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SHARE SPEC MODAL --- */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
           <div className="max-w-md w-full flex flex-col gap-4 mt-10 md:mt-0">
             
             <div className="flex justify-between items-center px-2">
                <h3 className="text-white font-black tracking-widest uppercase">Export Spec</h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-white">✕ CLOSE</button>
             </div>

             <div id="spec-receipt" className="bg-[#0a0a0a] border-2 border-neon-cyan/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,242,255,0.1)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                
                <div className="relative z-10 text-center mb-6 border-b border-white/10 pb-6">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-1">
                    <span className="text-neon-cyan">KENG</span> <span className="text-white">CUSTOM</span>
                  </h2>
                  <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.4em]">Official Spec Sheet</p>
                </div>

                <div className="relative z-10 flex justify-center mb-6">
                  <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    ⚡ Est. Power: {estimatedWatt}W
                  </span>
                </div>

                <div className="relative z-10 space-y-4 mb-8">
                  {Object.keys(selectedParts).map((key) => (
                    <div key={key} className="flex justify-between items-end border-b border-dashed border-white/10 pb-2">
                      <div className="pr-4">
                        <p className="text-[9px] text-neon-cyan font-bold uppercase tracking-wider mb-0.5">{(content.parts as any)[key]}</p>
                        <p className="text-sm font-medium text-white">{selectedParts[key].name}</p>
                      </div>
                      <p className="text-sm font-mono text-gray-400 shrink-0">{selectedParts[key].price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="relative z-10 bg-white/5 rounded-2xl p-6 text-center border border-white/10">
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">Total Estimated Price</p>
                   <div className="flex justify-center items-baseline gap-2">
                     <span className="text-4xl font-black text-white italic tracking-tighter">{totalPrice.toLocaleString()}</span>
                     <span className="text-neon-cyan font-bold">THB</span>
                   </div>
                </div>

                <div className="relative z-10 text-center mt-6 pt-4">
                   <p className="text-[8px] text-gray-600 uppercase tracking-widest">Built with Keng Intelligence System</p>
                </div>
             </div>

             <button onClick={handleDownloadSpec} className="w-full py-4 mt-2 bg-neon-cyan text-pc-dark font-black rounded-2xl uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                📸 Download Image
             </button>
           </div>
        </div>
      )}

      {/* --- CONFIRM RESET MODAL --- */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-pc-surface border border-red-500/30 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.15)] animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl border border-red-500/20 shadow-inner">⚠️</div>
              <h3 className="text-xl font-black text-white mb-2">{lang === 'en' ? "Clear all selections?" : "ยืนยันการล้างรายการ?"}</h3>
              <p className="text-gray-400 text-xs mb-8 leading-relaxed">{lang === 'en' ? "Are you sure you want to remove all selected hardware?" : "คุณแน่ใจหรือไม่ว่าต้องการลบอุปกรณ์ที่เลือกไว้ทั้งหมด?"}</p>
              <div className="flex gap-3">
                 <button onClick={() => setShowConfirmReset(false)} className="flex-1 py-3.5 rounded-xl border border-white/10 text-gray-400 font-bold text-xs uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">{lang === 'en' ? 'Cancel' : 'ยกเลิก'}</button>
                 <button onClick={confirmExecuteReset} className="flex-1 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all">{lang === 'en' ? 'Yes, Clear' : 'ยืนยันลบ'}</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}