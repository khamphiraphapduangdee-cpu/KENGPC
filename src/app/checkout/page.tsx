"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import Image from 'next/image';

export default function CheckoutPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [isClient, setIsClient] = useState(false);

    // ดึงข้อมูลสินค้าที่จัดสเปกไว้จาก Local Storage
    useEffect(() => {
        setIsClient(true);
        const savedCart = localStorage.getItem('pc_cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error("Failed to parse cart data", error);
            }
        }
    }, []);

    // State สำหรับเก็บข้อมูลที่อยู่จัดส่ง
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '', phone: '', address: '', province: '', zipCode: '',
    });

    // State สำหรับวิธีชำระเงิน
    const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'credit_card' | 'cod'>('promptpay');

    // คำนวณราคาสุทธิ
    const subTotal = cartItems.reduce((acc, item) => acc + Number(item.price || 0), 0);
    const shippingFee = subTotal > 0 ? 150 : 0; // ค่าจัดส่ง 150 บาท
    const grandTotal = subTotal + shippingFee;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (cartItems.length === 0) {
            toast.error("ไม่มีสินค้าในตะกร้า กรุณากลับไปเลือกสินค้า");
            return;
        }

        setLoading(true);

        // 💡 อนาคตสามารถนำ shippingInfo, paymentMethod และ cartItems ส่งเข้า API Database ตรงนี้ได้เลย

        // จำลองเวลาประมวลผลการสั่งซื้อ
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success("สั่งซื้อสินค้าสำเร็จ! ระบบกำลังเตรียมจัดส่ง", {
            style: { background: '#1A1A1A', color: '#00f2ff', border: '1px solid #00f2ff' },
            icon: '📦'
        });
        
        // เคลียร์ตะกร้า
        localStorage.removeItem('pc_cart');
        localStorage.removeItem('keng-spec'); // เคลียร์สเปกที่เซฟไว้หน้าแรกด้วย
        setCartItems([]);
        setLoading(false);
        
        // เด้งกลับหน้าแรก
        setTimeout(() => {
            router.push('/');
        }, 2000);
    };

    // ป้องกัน Hydration Error
    if (!isClient) return null;

    return (
        <div className="min-h-screen bg-pc-dark text-white p-4 md:p-8 font-sans pb-20 relative overflow-hidden">
            <Toaster />
            {/* พื้นหลังตารางไซเบอร์ */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:30px_30px] -z-10"></div>

            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <button onClick={() => router.push('/')} className="text-gray-500 hover:text-white text-sm font-bold mb-4 flex items-center gap-2 transition-colors">
                        ← กลับไปแก้ไขสเปก
                    </button>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
                        <span className="text-neon-cyan">SECURE</span> CHECKOUT
                    </h1>
                    <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">Order Confirmation & Payment</p>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* --- ฝั่งซ้าย: ข้อมูลจัดส่ง & วิธีชำระเงิน (8 ส่วน) --- */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* 1. ข้อมูลจัดส่ง */}
                        <div className="bg-pc-surface/80 backdrop-blur-md p-6 md:p-8 rounded-[32px] border border-white/5 shadow-2xl">
                            <h2 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-white">
                                <span className="w-1.5 h-6 bg-neon-cyan shadow-[0_0_10px_#00f2ff]"></span>
                                Shipping Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" name="fullName" placeholder="ชื่อ-นามสกุล" required className="w-full bg-pc-dark border border-white/10 p-4 rounded-xl focus:border-neon-cyan outline-none transition-all md:col-span-2 text-sm" value={shippingInfo.fullName} onChange={handleInputChange} />
                                <input type="tel" name="phone" placeholder="เบอร์โทรศัพท์" required className="w-full bg-pc-dark border border-white/10 p-4 rounded-xl focus:border-neon-cyan outline-none transition-all md:col-span-2 text-sm" value={shippingInfo.phone} onChange={handleInputChange} />
                                <textarea name="address" placeholder="ที่อยู่จัดส่ง (บ้านเลขที่, หมู่, ซอย, ถนน)" required rows={3} className="w-full bg-pc-dark border border-white/10 p-4 rounded-xl focus:border-neon-cyan outline-none transition-all md:col-span-2 resize-none text-sm custom-scrollbar" value={shippingInfo.address} onChange={handleInputChange}></textarea>
                                <input type="text" name="province" placeholder="จังหวัด" required className="w-full bg-pc-dark border border-white/10 p-4 rounded-xl focus:border-neon-cyan outline-none transition-all text-sm" value={shippingInfo.province} onChange={handleInputChange} />
                                <input type="text" name="zipCode" placeholder="รหัสไปรษณีย์" required className="w-full bg-pc-dark border border-white/10 p-4 rounded-xl focus:border-neon-cyan outline-none transition-all text-sm" value={shippingInfo.zipCode} onChange={handleInputChange} />
                            </div>
                        </div>

                        {/* 2. วิธีการชำระเงิน */}
                        <div className="bg-pc-surface/80 backdrop-blur-md p-6 md:p-8 rounded-[32px] border border-white/5 shadow-2xl">
                            <h2 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-white">
                                <span className="w-1.5 h-6 bg-neon-cyan shadow-[0_0_10px_#00f2ff]"></span>
                                Payment Method
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* PromptPay */}
                                <label className={`cursor-pointer border p-4 rounded-xl flex flex-col items-center justify-center gap-3 transition-all ${paymentMethod === 'promptpay' ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(0,242,255,0.1)]' : 'bg-pc-dark border-white/5 text-gray-500 hover:border-white/20'}`}>
                                    <input type="radio" name="payment" value="promptpay" className="hidden" checked={paymentMethod === 'promptpay'} onChange={(e) => setPaymentMethod(e.target.value as any)} />
                                    <span className="text-3xl">📱</span>
                                    <span className="font-bold text-xs uppercase tracking-widest">QR PromptPay</span>
                                </label>
                                {/* Credit Card */}
                                <label className={`cursor-pointer border p-4 rounded-xl flex flex-col items-center justify-center gap-3 transition-all ${paymentMethod === 'credit_card' ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(0,242,255,0.1)]' : 'bg-pc-dark border-white/5 text-gray-500 hover:border-white/20'}`}>
                                    <input type="radio" name="payment" value="credit_card" className="hidden" checked={paymentMethod === 'credit_card'} onChange={(e) => setPaymentMethod(e.target.value as any)} />
                                    <span className="text-3xl">💳</span>
                                    <span className="font-bold text-xs uppercase tracking-widest">Credit Card</span>
                                </label>
                                {/* COD */}
                                <label className={`cursor-pointer border p-4 rounded-xl flex flex-col items-center justify-center gap-3 transition-all ${paymentMethod === 'cod' ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(0,242,255,0.1)]' : 'bg-pc-dark border-white/5 text-gray-500 hover:border-white/20'}`}>
                                    <input type="radio" name="payment" value="cod" className="hidden" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value as any)} />
                                    <span className="text-3xl">🚚</span>
                                    <span className="font-bold text-xs uppercase tracking-widest">Cash on Delivery</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* --- ฝั่งขวา: สรุปรายการสั่งซื้อ (4 ส่วน) --- */}
                    <div className="lg:col-span-4">
                        <div className="bg-pc-surface/80 backdrop-blur-md p-6 md:p-8 rounded-[32px] border border-neon-cyan/30 sticky top-8 shadow-[0_10px_40px_-15px_rgba(0,242,255,0.2)]">
                            <h2 className="text-lg font-black uppercase tracking-widest mb-6 text-white border-b border-white/10 pb-4">Order Summary</h2>
                            
                            {/* รายการสินค้าในตะกร้า */}
                            <div className="space-y-4 mb-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.length > 0 ? (
                                    cartItems.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4 bg-pc-dark p-3 rounded-2xl border border-white/5">
                                            <div className="w-14 h-14 bg-black rounded-xl border border-white/10 overflow-hidden flex-shrink-0 relative">
                                                <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[9px] text-neon-cyan font-black uppercase tracking-widest mb-0.5">{item.brand}</p>
                                                <p className="text-xs font-bold text-white line-clamp-1">{item.name}</p>
                                                <p className="text-xs text-gray-400 font-mono mt-1">{Number(item.price).toLocaleString()} ฿</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center p-8 border border-dashed border-white/10 rounded-2xl text-gray-500 text-sm">
                                        ยังไม่มีสินค้าในตะกร้า
                                    </div>
                                )}
                            </div>

                            <hr className="border-white/10 mb-6" />

                            {/* สรุปราคา */}
                            <div className="space-y-3 text-sm mb-6 font-medium text-gray-400">
                                <div className="flex justify-between">
                                    <span>อุปกรณ์ ({cartItems.length} ชิ้น)</span>
                                    <span className="font-mono text-white">{subTotal.toLocaleString()} ฿</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>ค่าจัดส่งมาตรฐาน</span>
                                    <span className="font-mono text-white">{shippingFee.toLocaleString()} ฿</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-8 p-5 bg-neon-cyan/5 rounded-2xl border border-neon-cyan/20">
                                <span className="text-xs font-black uppercase tracking-widest text-neon-cyan">Total</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black font-mono text-white italic tracking-tighter">{grandTotal.toLocaleString()}</span>
                                    <span className="text-neon-cyan font-bold text-[10px]">THB</span>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading || cartItems.length === 0}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all text-xs ${
                                    loading || cartItems.length === 0
                                    ? 'bg-pc-dark text-gray-600 border border-white/5 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-neon-cyan to-neon-purple text-pc-dark shadow-[0_0_20px_rgba(0,242,255,0.4)] hover:scale-[1.02] active:scale-95'
                                }`}
                            >
                                {loading ? 'Processing...' : 'Confirm & Pay'}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}