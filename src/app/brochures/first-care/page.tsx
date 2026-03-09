"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Brand Colors
const BRAND_RED = "#b20404";
const BRAND_GREEN = "#178d11";
const BRAND_BLUE = "#2563eb";
const BRAND_DARK = "#0f172a";

// --- Comprehensive Data ---

const db = {
    blades: [
        { sl: "1", no: "#10", feature: "Curved, broad edge", min: "1000", max: "20000" },
        { sl: "2", no: "#11", feature: "Triangular, sharp point", min: "1000", max: "20000" },
        { sl: "3", no: "#12", feature: "Hook-shaped curved edge", min: "1000", max: "20000" },
        { sl: "4", no: "#15", feature: "Small curved edge", min: "1000", max: "20000" },
        { sl: "5", no: "#20–24", feature: "Large, heavy blades", min: "1000", max: "20000" },
    ],
    handles: [
        { sl: "1", id: "10-130-5EM", feature: "Straight 14.5cm", min: "2000", max: "40000" },
        { sl: "5", id: "10-130-03", feature: "Bard Parker No. 3", min: "2000", max: "40000" },
        { sl: "7", id: "10-100-04E", feature: "No. 4 13.5cm", min: "2000", max: "40000" },
        { sl: "8", id: "10-130-07E", feature: "No. 7 16.5cm", min: "2000", max: "40000" },
    ],
    gauzeSterile: [
        { sl: "1", type13: "5CM X 5CM X 8PLY", type17: "5CM X 5CM X 8PLY", min: "3000", max: "60000" },
        { sl: "3", type13: "7.5CM X 7.5CM X 8PLY", type17: "7.5CM X 7.5CM X 8PLY", min: "3000", max: "60000" },
        { sl: "5", type13: "10CM X 10CM X 8PLY", type17: "10CM X 10CM X 8PLY", min: "3000", max: "60000" },
        { sl: "7", type13: "15CM X 15CM X 8PLY", type17: "15CM X 15CM X 8PLY", min: "3000", max: "60000" },
    ],
    gloves: [
        { sl: "1", size: "5.5 - 8.5", feature: "Surgical Latex - Sterile", min: "50000", max: "1M" },
        { sl: "2", size: "XS - XL", feature: "Exam Latex - Powdered", min: "2000", max: "100K" },
        { sl: "3", size: "S - L", feature: "Nitrile Med", min: "10000", max: "500K" },
    ],
    syringes: [
        { sl: "1", size: ".03 mL", feature: "Insulin/TB - 100 BOX", min: "1000", max: "20000" },
        { sl: "4", size: "5 mL", feature: "Routine - 100 BOX", min: "1000", max: "20000" },
        { sl: "7", size: "10-50 mL", feature: "IV/Flushing", min: "1000", max: "20000" },
        { sl: "8", size: "60 mL", feature: "Catheter Tip", min: "500", max: "5000" },
    ],
    cotton: [
        { sl: "1", desc: "ABSORBENT COTTON 1 PCS", size: "500GM", min: "2000", max: "40000" },
        { sl: "2", desc: "ABSORBENT COTTON 1 PCS", size: "400GM", min: "2000", max: "40000" },
        { sl: "4", desc: "ABSORBENT COTTON 1 PCS", size: "100GM", min: "2000", max: "40000" },
        { sl: "5", desc: "ABSORBENT BALLS 100pk", size: "BALLS", min: "2000", max: "40000" },
    ]
};

// --- Helper Components ---

const LandscapePage = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`landscape-page w-[1123px] h-[794px] overflow-hidden flex flex-col relative print:border-0 border border-slate-200 shadow-2xl mx-auto my-12 first:mt-32 ${className}`}>
        {children}
    </div>
);

const SectionHeader = ({ title, badge, color = BRAND_RED }: { title: string, badge: string, color?: string }) => (
    <div className="flex items-end justify-between mb-8 pb-6 border-b-4 relative" style={{ borderColor: color }}>
        <div className="relative z-10">
            <h2 className="text-6xl font-black tracking-tighter uppercase italic leading-none" style={{ color: color }}>{title}</h2>
        </div>
        <div className="text-right">
            <span className="px-6 py-2 rounded-full text-[12px] font-black text-white uppercase tracking-widest" style={{ backgroundColor: color }}>{badge}</span>
        </div>
        {/* Background Vertical Number */}
        <div className="absolute right-0 top-[-80%] text-[10rem] font-black opacity-[0.03] select-none pointer-events-none" style={{ color: color }}>
            {badge.includes('0') ? badge.split(' ')[1] : 'FC'}
        </div>
    </div>
);

const ImgPlaceholder = ({ label, className = "" }: { label: string, className?: string }) => (
    <div className={`bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 font-extrabold text-[12px] uppercase tracking-widest text-center px-4 relative overflow-hidden ${className}`}>
        <span className="relative z-10">{label}</span>
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_center,_black_1.5px,_transparent_1.5px)] bg-[length:20px_20px]"></div>
    </div>
);

export default function FirstCareBrochure() {
    const [isPdfMode, setIsPdfMode] = useState(false);

    useEffect(() => {
        // If the URL has ?pdf=true, hide controls for the Puppeteer renderer
        if (window.location.search.includes("pdf=true")) {
            setIsPdfMode(true);
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-100 font-sans selection:bg-red-500 selection:text-white pb-20">

            {/* Landscape Print Meta */}
            <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            margin: 0;
            background: white !important;
          }
          .landscape-page {
            box-shadow: none !important;
            border: 0 !important;
            margin: 0 !important;
            page-break-after: always;
            width: 1123px !important;
            height: 794px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            transform: scale(1) !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

            {/* Navigation */}
            {!isPdfMode && (
                <nav className="fixed top-0 w-full z-[300] bg-white/90 backdrop-blur-2xl border-b border-slate-200 h-20 flex items-center px-[5%] justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#b20404] flex items-center justify-center text-white font-black text-xl">FC</div>
                        <div className="text-xl font-black uppercase tracking-tighter">FIRST<span style={{ color: BRAND_RED }}>CARE</span></div>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/" className="px-6 py-2 rounded-full border border-slate-200 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Home</Link>
                        <a href="/api/pdf" target="_blank" className="px-8 py-2 rounded-full bg-[#b20404] text-white text-xs font-black uppercase tracking-widest hover:bg-red-800 shadow-xl shadow-red-500/20 active:scale-95 transition-all outline-none">Download High-Res PDF</a>
                    </div>
                </nav>
            )}

            <main className="flex flex-col">

                {/* PAGE 1: COVER */}
                <LandscapePage className="bg-[#b20404] !border-none">
                    <div className="flex h-full">
                        <div className="w-[40%] p-20 flex flex-col justify-between relative z-10">
                            <div>
                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-[#b20404] font-black text-3xl shadow-2xl mb-16 rotate-3">FC</div>
                                <h1 className="text-[8rem] font-black italic tracking-tighter leading-[0.8] uppercase text-white mb-6">
                                    PRO<br />DUCT.
                                </h1>
                                <div className="h-3 w-32 bg-white rounded-full"></div>
                            </div>
                            <div className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">
                                Official Catalogue / 2026 Edition
                            </div>
                        </div>

                        <div className="w-[60%] bg-black/5 backdrop-blur-3xl p-20 flex flex-col justify-center border-l border-white/10 relative overflow-hidden">
                            <div className="max-w-2xl space-y-12 relative z-20">
                                <div className="space-y-6">
                                    <span className="inline-block px-5 py-2 bg-white text-[#b20404] rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Premium Supply Chain</span>
                                    <h2 className="text-7xl font-black text-white leading-[0.95] tracking-tight uppercase italic underline decoration-white/20 decoration-8 underline-offset-8">
                                        Shipping and <br />Fulfilling <br />Global Demands.
                                    </h2>
                                </div>

                                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl transform rotate-1 border border-red-100 max-w-lg">
                                    <p className="text-lg text-slate-900 font-bold leading-relaxed mb-1 capitalize">
                                        Specialized healthcare curated instruments & healthcare dressings supplier from India.
                                    </p>
                                    <div className="h-1 w-12 bg-red-600 rounded-full mt-4"></div>
                                </div>

                                <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/20">
                                    <div>
                                        <p className="text-[10px] font-black text-red-300 uppercase tracking-widest mb-3">Expertise</p>
                                        <p className="text-white font-bold text-sm uppercase leading-tight">Surgical Instruments <br />& Wound Care Textiles</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-red-300 uppercase tracking-widest mb-3">Operations</p>
                                        <p className="text-white font-bold text-sm uppercase leading-tight">Volume Procurement <br />& Global Compliance</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:50px_50px] opacity-[0.05]"></div>
                        </div>
                    </div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] aspect-square bg-white opacity-[0.05] rounded-full blur-[100px]"></div>
                </LandscapePage>

                {/* PAGE 2: SURGICAL BLADES */}
                <LandscapePage className="bg-white p-16">
                    <SectionHeader title="Surgical Blades" badge="Vertical 01" color={BRAND_RED} />
                    <div className="flex-1 grid grid-cols-12 gap-12 overflow-hidden h-full">
                        <div className="col-span-5 flex flex-col gap-6 h-full">
                            <ImgPlaceholder label="Blade Series Master Overview [Placeholder]" className="flex-1 border-4 border-slate-50 shadow-inner" />
                            <div className="grid grid-cols-2 gap-6 h-40">
                                <ImgPlaceholder label="Macro Edge Detail [Placeholder]" />
                                <ImgPlaceholder label="Sterling Foil Pack [Placeholder]" />
                            </div>
                        </div>
                        <div className="col-span-7 flex flex-col gap-8 h-full">
                            <div className="grid grid-cols-3 gap-6">
                                {[
                                    { l: 'Material Grade', v: 'AISI 420 Carbon Steel' },
                                    { l: 'Edge Geometry', v: 'Computerized Grind' },
                                    { l: 'Sterilization', v: 'Gamma / ETO Compatible' }
                                ].map((s, i) => (
                                    <div key={i} className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{s.l}</span>
                                        <span className="font-black text-sm uppercase tracking-tight text-slate-900 leading-none">{s.v}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-xl flex flex-col">
                                <div className="px-10 py-6 bg-slate-900 flex justify-between items-center">
                                    <h4 className="text-white text-[12px] font-black uppercase tracking-[0.2em]">Blade Specifications Matrix</h4>
                                    <div className="h-1.5 w-16 bg-red-600 rounded-full"></div>
                                </div>
                                <div className="flex-1">
                                    <table className="w-full text-left font-black text-[11px] uppercase tracking-tighter">
                                        <thead className="bg-slate-50 border-b-2 border-slate-200">
                                            <tr><th className="px-10 py-5 text-slate-400">Sl No.</th><th className="px-10 py-5">Blade Type</th><th className="px-10 py-5">Geometry / Application</th><th className="px-10 py-5 text-right">Min OQ</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 italic">
                                            {db.blades.map((b, i) => (
                                                <tr key={b.sl} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                                    <td className="px-10 py-4 text-slate-300 text-lg">{b.sl}</td>
                                                    <td className="px-10 py-4 text-red-600 font-black text-lg">{b.no}</td>
                                                    <td className="px-10 py-4 text-slate-600 font-bold">{b.feature}</td>
                                                    <td className="px-10 py-4 text-right text-slate-900 text-sm">{b.min}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t font-black border-slate-100 flex justify-between items-center text-[9px] text-slate-300 uppercase tracking-[0.4em]">
                        <span>FirstCare Surgical Catalog</span>
                        <span>Page 02 / 07</span>
                    </div>
                </LandscapePage>

                {/* PAGE 3: SCALPEL HANDLES */}
                <LandscapePage className="bg-white p-16">
                    <SectionHeader title="Scalpel Hubs" badge="Vertical 02" color={BRAND_RED} />
                    <div className="flex-1 grid grid-cols-12 gap-12 overflow-hidden h-full">
                        <div className="col-span-7 flex flex-col gap-8 h-full">
                            <div className="flex-1 bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-xl flex flex-col">
                                <div className="px-10 py-6 bg-slate-900 flex justify-between items-center">
                                    <h4 className="text-white text-[12px] font-black uppercase tracking-[0.2em]">Handle Specifications Matrix</h4>
                                    <div className="h-1.5 w-16 bg-red-600 rounded-full"></div>
                                </div>
                                <div className="flex-1">
                                    <table className="w-full text-left font-black text-[11px] uppercase tracking-tighter">
                                        <thead className="bg-slate-50 border-b-2 border-slate-200">
                                            <tr><th className="px-10 py-5 text-slate-400">Sl No.</th><th className="px-10 py-5">ISO Part ID</th><th className="px-10 py-5">Length / Fitment</th><th className="px-10 py-5 text-right">Min OQ</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 italic">
                                            {db.handles.map((h, i) => (
                                                <tr key={h.sl} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                                    <td className="px-10 py-4 text-slate-300 text-lg">{h.sl}</td>
                                                    <td className="px-10 py-4 text-red-600 font-black text-lg">{h.id}</td>
                                                    <td className="px-10 py-4 text-slate-600 font-bold">{h.feature}</td>
                                                    <td className="px-10 py-4 text-right text-slate-900 text-sm">{h.min}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-5 flex flex-col gap-6 h-full">
                            <ImgPlaceholder label="No. 3 & No. 4 Handles [Placeholder]" className="flex-1 border-4 border-slate-50 shadow-inner" />
                            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                <h4 className="font-black text-lg uppercase tracking-tight text-slate-900 mb-2">Ergonomic Fitment</h4>
                                <p className="text-slate-500 font-bold text-sm leading-relaxed">Precision milled from high-grade 304 stainless steel. Guaranteed zero play and perfect tactile compliance with all standard surgical blades.</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t font-black border-slate-100 flex justify-between items-center text-[9px] text-slate-300 uppercase tracking-[0.4em]">
                        <span>FirstCare Surgical Catalog</span>
                        <span>Page 03 / 07</span>
                    </div>
                </LandscapePage>

                {/* PAGE 4: GAUZE */}
                <LandscapePage className="bg-white p-16">
                    <SectionHeader title="Sterile Gauze" badge="Vertical 03" color={BRAND_GREEN} />
                    <div className="flex-1 grid grid-cols-12 gap-12 overflow-hidden h-full">
                        <div className="col-span-5 flex flex-col gap-6 h-full">
                            <div className="bg-[#178d11] p-12 rounded-[3.5rem] text-white flex flex-col relative overflow-hidden shadow-2xl h-1/2">
                                <h3 className="text-4xl font-black italic uppercase leading-[0.9] tracking-tighter mb-4 relative z-10">
                                    High-Absorbency <br />Textile Engineering.
                                </h3>
                                <p className="text-green-100 font-bold text-sm max-w-[90%] uppercase tracking-tight opacity-80 relative z-10">
                                    BP Type 13/17 optimized cotton technology. Sterilized folded edges for surgical safety.
                                </p>
                                <div className="absolute right-[-10%] bottom-[-10%] text-[8rem] font-black text-white/10 italic">WC</div>
                            </div>
                            <ImgPlaceholder label="Gauze Swab 8Ply Stack [Placeholder]" className="flex-1 border-4 border-slate-50 shadow-inner" />
                        </div>
                        <div className="col-span-7 flex flex-col gap-8 h-full">
                            <div className="flex-1 bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-xl flex flex-col">
                                <div className="px-10 py-6 bg-slate-900 flex justify-between items-center">
                                    <h4 className="text-white text-[12px] font-black uppercase tracking-[0.2em]">Swab Dimensions matrix</h4>
                                    <div className="h-1.5 w-16 bg-green-500 rounded-full"></div>
                                </div>
                                <div className="flex-1">
                                    <table className="w-full text-left font-black text-[11px] uppercase tracking-tighter">
                                        <thead className="bg-slate-50 border-b-2 border-slate-200">
                                            <tr><th className="px-10 py-5 text-slate-400">Sl</th><th className="px-10 py-5">Type 13 Architecture</th><th className="px-10 py-5">Type 17 Architecture</th><th className="px-10 py-5 text-right">MOQ</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 italic">
                                            {db.gauzeSterile.map((g, i) => (
                                                <tr key={g.sl} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                                    <td className="px-10 py-4 text-slate-300 text-lg">{g.sl}</td>
                                                    <td className="px-10 py-4 text-green-700 font-black text-lg">{g.type13}</td>
                                                    <td className="px-10 py-4 text-slate-600 font-bold">{g.type17}</td>
                                                    <td className="px-10 py-4 text-right text-slate-900">{g.min}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t font-black border-slate-100 flex justify-between items-center text-[9px] text-slate-300 uppercase tracking-[0.4em]">
                        <span>FirstCare Surgical Catalog</span>
                        <span>Page 04 / 07</span>
                    </div>
                </LandscapePage>

                {/* PAGE 5: COTTON WELLNESS */}
                <LandscapePage className="bg-white p-16">
                    <SectionHeader title="Absorbent Cotton" badge="Vertical 04" color={BRAND_GREEN} />
                    <div className="flex-1 grid grid-cols-12 gap-12 overflow-hidden h-full">
                        <div className="col-span-7 flex flex-col gap-8 h-full">
                            <div className="flex-1 bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-xl flex flex-col">
                                <div className="px-10 py-6 bg-slate-900 flex justify-between items-center">
                                    <h4 className="text-white text-[12px] font-black uppercase tracking-[0.2em]">Volume Sizing Matrix</h4>
                                    <div className="h-1.5 w-16 bg-green-500 rounded-full"></div>
                                </div>
                                <div className="flex-1">
                                    <table className="w-full text-left font-black text-[11px] uppercase tracking-tighter">
                                        <thead className="bg-slate-50 border-b-2 border-slate-200">
                                            <tr><th className="px-10 py-5 text-slate-400">Sl</th><th className="px-10 py-5">Product Format</th><th className="px-10 py-5 text-green-600 text-xl font-extrabold italic">Grammage</th><th className="px-10 py-5 text-right">MOQ</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 italic">
                                            {db.cotton.map((c, i) => (
                                                <tr key={c.sl} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                                    <td className="px-10 py-5 text-slate-300 text-lg">{c.sl}</td>
                                                    <td className="px-10 py-5 text-slate-800 font-black text-sm">{c.desc}</td>
                                                    <td className="px-10 py-5 text-green-600 font-black text-xl tracking-tighter">{c.size}</td>
                                                    <td className="px-10 py-5 text-right text-slate-900 text-lg">{c.min}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-5 flex flex-col gap-6 h-full">
                            <ImgPlaceholder label="Absorbent Rolls & Z-fold [Placeholder]" className="flex-1 border-4 border-slate-50 shadow-inner" />
                            <ImgPlaceholder label="Cotton Ball Pkt 100s [Placeholder]" className="flex-1 border-4 border-slate-50 shadow-inner" />
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t font-black border-slate-100 flex justify-between items-center text-[9px] text-slate-300 uppercase tracking-[0.4em]">
                        <span>FirstCare Surgical Catalog</span>
                        <span>Page 05 / 07</span>
                    </div>
                </LandscapePage>

                {/* PAGE 6: GLOVES & SYRINGES */}
                <LandscapePage className="bg-white p-16">
                    <div className="flex flex-col h-full gap-10">
                        <div className="grid grid-cols-2 gap-12 flex-1">
                            <div className="flex flex-col h-full gap-6">
                                <SectionHeader title="Barrier Gloves" badge="Vertical 05" color={BRAND_DARK} />
                                <ImgPlaceholder label="Nitrile & Latex Array [Placeholder]" className="h-48 border-4 border-slate-50 shadow-inner" />
                                <div className="flex-1 border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl flex flex-col">
                                    <table className="w-full text-[11px] font-black uppercase tracking-tighter text-left flex-1">
                                        <thead className="bg-[#0f172a] text-white"><tr><th className="px-8 py-5">Size Target</th><th className="px-8 py-5">Variant Class</th><th className="px-8 py-5 text-right">MOQ Demand</th></tr></thead>
                                        <tbody className="divide-y divide-slate-100 italic">{db.gloves.map((g, i) => (
                                            <tr key={g.sl} className={i % 2 === 0 ? "bg-slate-50/80" : "bg-white"}><td className="px-8 py-4 font-black text-slate-900 text-lg tracking-tight">{g.size}</td><td className="px-8 py-4 text-slate-500">{g.feature}</td><td className="px-8 py-4 font-black text-right text-base">{g.min}</td></tr>
                                        ))}</tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex flex-col h-full gap-6">
                                <SectionHeader title="Syringes" badge="Vertical 06" color={BRAND_BLUE} />
                                <ImgPlaceholder label="Plunger & Needles [Placeholder]" className="h-48 border-4 border-slate-50 shadow-inner" />
                                <div className="flex-1 border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl flex flex-col">
                                    <table className="w-full text-[11px] font-black uppercase tracking-tighter text-left flex-1">
                                        <thead className="bg-[#2563eb] text-white"><tr><th className="px-8 py-5">Capacity</th><th className="px-8 py-5">Clinical Application</th><th className="px-8 py-5 text-right">MOQ Demand</th></tr></thead>
                                        <tbody className="divide-y divide-slate-100 italic">{db.syringes.map((s, i) => (
                                            <tr key={s.sl} className={i % 2 === 0 ? "bg-blue-50/20" : "bg-white"}><td className="px-8 py-4 font-black text-blue-600 text-lg">{s.size}</td><td className="px-8 py-4 text-slate-500">{s.feature}</td><td className="px-8 py-4 font-black text-blue-800 text-right text-base">{s.min}</td></tr>
                                        ))}</tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t font-black border-slate-100 flex justify-between items-center text-[9px] text-slate-300 uppercase tracking-[0.4em]">
                        <span>FirstCare Surgical Catalog</span>
                        <span>Page 06 / 07</span>
                    </div>
                </LandscapePage>

                {/* PAGE 7: BACK COVER */}
                <LandscapePage className="bg-[#b20404] !border-none p-20 flex flex-col justify-center">
                    <div className="w-[80%] mx-auto text-center flex flex-col items-center gap-12 relative z-10 py-16">
                        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-[#b20404] font-black text-4xl shadow-2xl">FC</div>
                        <h2 className="text-[7rem] font-black italic tracking-tighter leading-[0.9] uppercase text-white drop-shadow-2xl">
                            Partnering <br />For Global <br />Health.
                        </h2>
                        <div className="flex gap-16 uppercase text-white font-black tracking-[0.4em] text-sm mt-8 opacity-80 border-t border-b border-white/20 py-8">
                            <span>ISO 13485 CERTIFIED</span>
                            <span>CE MARKED INSTRUMENTS</span>
                            <span>GMP COMPLIANT</span>
                        </div>
                        <div className="flex flex-col items-center gap-4 text-center mt-12 bg-white/10 p-12 rounded-[3.5rem] backdrop-blur-xl border border-white/20 shadow-2xl w-full">
                            <p className="text-[12px] font-black text-red-200 uppercase tracking-widest leading-none">Global Trade Desk</p>
                            <p className="font-extrabold text-4xl uppercase italic text-white leading-none">Puduvai Exports India</p>
                            <p className="text-xl text-white font-bold opacity-80 mt-2">sales@puduvai.exports</p>
                            <p className="text-[12px] text-red-100 font-bold uppercase leading-relaxed italic opacity-60 mt-6 max-w-xl">
                                Minimum Ordering Quantities (MOQ) as strictly listed. Advanced global logistics and customized contract packing available on strategic requests.
                            </p>
                        </div>
                        <div className="absolute top-[20%] right-[-10%] text-[20rem] font-black text-white opacity-[0.03] select-none pointer-events-none rotate-90 italic">END.</div>
                    </div>
                    {/* Ambient Lighting */}
                    <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[80%] aspect-square bg-white opacity-[0.05] rounded-full blur-[150px]"></div>
                </LandscapePage>

            </main>

        </div>
    );
}
