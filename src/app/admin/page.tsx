"use client";

import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';

// รายการหมวดหมู่ทั้งหมด
const categories = [
    { id: 'all', label: 'ทั้งหมด', icon: '📦' },
    { id: 'cpu', label: 'CPU', icon: '🔲' },
    { id: 'gpu', label: 'GPU', icon: '🎛' },
    { id: 'mb', label: 'Mainboard', icon: '📟' },
    { id: 'ram', label: 'RAM', icon: '📏' },
    { id: 'ssd', label: 'SSD', icon: '💿' },
    { id: 'psu', label: 'PSU', icon: '⚡' },
    { id: 'case', label: 'Case', icon: '⬛' },
    { id: 'cooling', label: 'Cooling', icon: '❄️' },
    { id: 'monitor', label: 'Monitor', icon: '🖥️' },
    { id: 'kb', label: 'Keyboard', icon: '⌨️' },
    { id: 'mouse', label: 'Mouse', icon: '🖱️' },
];

export default function AdminPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('all'); // เก็บค่าหมวดหมู่ที่เลือก
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '', price: '', brand: '', category: 'cpu', image: '', socket: '', tdp: '', wattage: '',
        stock: '1'
    });

    const fetchProducts = async () => {
        setLoading(true);
        const res = await fetch('/api/products');
        const data = await res.json();
        const flatList = Object.values(data).flat();
        setProducts(flatList);
        setLoading(false);
    };

    useEffect(() => { fetchProducts(); }, []);

    // --- ฟังก์ชันอัปเดตสต็อก (เพิ่ม/ลด) ---
    const handleUpdateStock = async (id: number, currentStock: number, change: number) => {
        const newStock = Math.max(0, currentStock + change); // ป้องกันติดลบ
        
        // อัปเดต UI ทันที (Optimistic Update)
        setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock: newStock }),
            });

            if (!res.ok) throw new Error();
        } catch (error) {
            toast.error("ไม่สามารถอัปเดตสต็อกได้");
            fetchProducts(); // ถ้า Error ให้โหลดข้อมูลจริงจาก DB กลับมา
        }
    };

    // กรองสินค้าตาม Tab ที่เลือก
    const filteredProducts = activeTab === 'all'
        ? products
        : products.filter(p => p.category === activeTab);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
                tdp: formData.tdp ? Number(formData.tdp) : null,
                wattage: formData.wattage ? Number(formData.wattage) : null,
            }),
        });

        if (res.ok) {
            toast.success("เพิ่มสินค้าสำเร็จ!");
            setFormData({ name: '', price: '', brand: '', category: 'cpu', image: '', socket: '', tdp: '', wattage: '', stock: '1' });
            fetchProducts();
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("ลบสินค้านี้ใช่หรือไม่?")) return;
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
            toast.success("ลบสำเร็จ");
            fetchProducts();
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-4 md:p-8 font-sans">
            <Toaster />
            <div className="max-w-7xl mx-auto">

                <header className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter text-white">
                            CORE <span className="text-cyan-500">ADMIN</span>
                        </h1>
                        <p className="text-slate-500 text-sm">Inventory & Stock Management</p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                        Total Items: {products.length}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* --- ฝั่งซ้าย: ฟอร์มเพิ่มสินค้า --- */}
                    <div className="lg:col-span-4">
                        <div className="bg-[#141417] p-6 rounded-3xl border border-white/5 sticky top-8 shadow-2xl">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-cyan-500 rounded-full"></span>
                                เพิ่มสินค้าใหม่
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input type="text" placeholder="ชื่อสินค้า" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl focus:border-cyan-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" placeholder="ราคา" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl focus:border-cyan-500 outline-none" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                                    <input
                                        type="number"
                                        placeholder="จำนวนสต็อก"
                                        className="w-full bg-black/40 border border-white/10 p-3 rounded-xl focus:border-cyan-500 outline-none"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                        required
                                    />
                                </div>
                                <input type="text" placeholder="แบรนด์" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl focus:border-cyan-500 outline-none" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} required />

                                <select className="w-full bg-black/40 border border-white/10 p-3 rounded-xl focus:border-cyan-500 outline-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    {categories.filter(c => c.id !== 'all').map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>

                                <input type="text" placeholder="Image URL" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl focus:border-cyan-500 outline-none" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} required />

                                <div className="p-4 bg-black/20 rounded-2xl border border-dashed border-white/10 space-y-3">
                                    <p className="text-[10px] uppercase font-bold text-slate-500">ข้อมูลเฉพาะทาง (Option)</p>
                                    <input type="text" placeholder="Socket" className="w-full bg-transparent border-b border-white/10 p-1 text-sm outline-none" value={formData.socket} onChange={e => setFormData({ ...formData, socket: e.target.value })} />
                                    <input type="number" placeholder="TDP" className="w-full bg-transparent border-b border-white/10 p-1 text-sm outline-none" value={formData.tdp} onChange={e => setFormData({ ...formData, tdp: e.target.value })} />
                                </div>

                                <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-2xl transition-all">
                                    SAVE TO DATABASE
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* --- ฝั่งขวา: ตารางแยกหมวดหมู่ --- */}
                    <div className="lg:col-span-8">
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveTab(cat.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${activeTab === cat.id ? 'bg-cyan-500 border-cyan-500 text-black' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}
                                >
                                    <span>{cat.icon}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        <div className="bg-[#141417] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/5 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                                        <th className="p-5">สินค้า</th>
                                        <th className="p-5 text-center">คลัง</th>
                                        <th className="p-5 text-right">ราคา</th>
                                        <th className="p-5 text-center">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredProducts.map((item) => (
                                        <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-black" />
                                                    <div>
                                                        <p className="font-bold text-white text-sm leading-tight">{item.name}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase">{item.brand} • {item.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            {/* --- ส่วนปุ่มเพิ่ม/ลดสต็อก --- */}
                                            <td className="p-5 text-center font-mono">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button 
                                                        onClick={() => handleUpdateStock(item.id, item.stock, -1)}
                                                        className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-red-500/20 hover:border-red-500/50 text-slate-400 hover:text-red-500 transition-all"
                                                    >
                                                        -
                                                    </button>
                                                    <span className={`min-w-[30px] font-bold ${item.stock > 0 ? 'text-cyan-400' : 'text-red-500'}`}>
                                                        {item.stock}
                                                    </span>
                                                    <button 
                                                        onClick={() => handleUpdateStock(item.id, item.stock, 1)}
                                                        className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-green-500/20 hover:border-green-500/50 text-slate-400 hover:text-green-500 transition-all"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="p-5 text-right font-mono text-cyan-500 font-bold">
                                                {item.price.toLocaleString()} ฿
                                            </td>
                                            <td className="p-5 text-center">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 px-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black transition-all"
                                                >
                                                    ลบ
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredProducts.length === 0 && !loading && (
                                <div className="p-20 text-center text-slate-600 italic">ไม่มีสินค้าในหมวดหมู่นี้...</div>
                            )}
                            {loading && <div className="p-20 text-center text-cyan-500 animate-pulse">กำลังโหลดคลังสินค้า...</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}