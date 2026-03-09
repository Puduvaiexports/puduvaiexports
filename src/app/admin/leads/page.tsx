"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const COUNTRIES = [
    // Existing & Global Markets
    "Australia", "Austria", "Belgium", "Bulgaria", "Canada", "Croatia", "Cyprus",
    "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany",
    "Greece", "Hungary", "Ireland", "Italy", "Japan", "Latvia", "Lithuania",
    "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal", "Romania",
    "Singapore", "Slovakia", "Slovenia", "Spain", "Sweden", "United Kingdom", "United States",

    // African Countries
    "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde",
    "Cameroon", "Central African Republic", "Chad", "Comoros", "Congo", "DR Congo",
    "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia",
    "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya",
    "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania",
    "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda",
    "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia",
    "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia",
    "Uganda", "Zambia", "Zimbabwe",

    // Arab Countries (Remaining/Middle East Asian)
    "Bahrain", "Iraq", "Jordan", "Kuwait", "Lebanon", "Oman", "Palestine",
    "Qatar", "Saudi Arabia", "Syria", "United Arab Emirates", "Yemen"
].sort();

const CATEGORIES = [
    "Medicare Surgical Blade",
    "Medicare Gauze",
    "Syringes & Needles",
    "Surgical & Medical Gloves"
];

const SOURCES = [
    "Google Maps",
    "LinkedIn",
    "Yelp",
    "Bing Places",
    "Yellow Pages",
    "Alibaba"
];

export default function LeadGeneratorPage() {
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedSources, setSelectedSources] = useState<string[]>(["Google Maps"]);
    const [strictFilter, setStrictFilter] = useState(true);
    const [targetLeads, setTargetLeads] = useState<number>(25);
    const [isScraping, setIsScraping] = useState(false);
    const [leads, setLeads] = useState<any[]>([]);
    const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
    const [error, setError] = useState<string | null>(null);

    const toggleCategory = (cat: string) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const toggleSource = (src: string) => {
        setSelectedSources(prev =>
            prev.includes(src) ? prev.filter(s => s !== src) : [...prev, src]
        );
    };

    const toggleLeadSelection = (index: number) => {
        setSelectedLeads(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) newSet.delete(index);
            else newSet.add(index);
            return newSet;
        });
    };

    const toggleAllLeads = () => {
        if (selectedLeads.size === leads.length) {
            setSelectedLeads(new Set());
        } else {
            setSelectedLeads(new Set(leads.map((_, i) => i)));
        }
    };

    const handleScrape = async () => {
        if (selectedCategories.length === 0) {
            setError("Please select at least one product niche.");
            return;
        }
        if (selectedSources.length === 0) {
            setError("Please select at least one data source.");
            return;
        }

        setError(null);
        setIsScraping(true);
        setLeads([]); // Clear previous results
        setSelectedLeads(new Set()); // Clear selection

        try {
            const response = await fetch('/api/leads-scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    country: selectedCountry,
                    categories: selectedCategories,
                    sources: selectedSources,
                    strictFilter: strictFilter,
                    maxResults: targetLeads // Pass user-defined target lead count
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to run scraping agent.");
            }

            const fetchedLeads = result.data || [];
            setLeads(fetchedLeads);
            // Auto-select all returned leads
            setSelectedLeads(new Set(fetchedLeads.map((_: any, i: number) => i)));

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsScraping(false);
        }
    };

    const exportCsv = () => {
        const exportedLeads = leads.filter((_, i) => selectedLeads.has(i));
        if (exportedLeads.length === 0) return;

        // Headers
        const headers = ["Company Name", "Country", "Source", "Category", "Phone", "Email", "Website"];
        const rows = exportedLeads.map(l => [
            `"${l.company_name || ''}"`,
            `"${l.country || ''}"`,
            `"${l.source || ''}"`,
            `"${l.category || ''}"`,
            `"${l.phone || ''}"`,
            `"${l.email || ''}"`,
            `"${l.website || ''}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Targeted_B2B_Leads_${selectedCountry.replace(" ", "_")}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-600 selection:bg-red-500 selection:text-white p-8">

            {/* Simple Header */}
            <div className="flex justify-between items-center mb-12 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-4">
                    <Link href="/" className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-xl hover:scale-105 transition-transform shadow-lg shadow-red-500/20">FC</Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Lead Generation OS</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Autonomous Agent Control</p>
                    </div>
                </div>
                {leads.length > 0 && selectedLeads.size > 0 && (
                    <button onClick={exportCsv} className="px-6 py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors shadow-lg">
                        Export {selectedLeads.size} Selected Leads (CSV)
                    </button>
                )}
            </div>

            <div className="grid grid-cols-12 gap-8">

                {/* Left Control Panel */}
                <div className="col-span-4 space-y-8">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 relative z-10">Agent Configuration</h2>

                        {/* Country Select */}
                        <div className="mb-8 relative z-10">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Target Market</label>
                            <select
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none focus:border-red-500 transition-colors shadow-inner"
                            >
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Source Checkboxes */}
                        <div className="mb-8 relative z-10">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Intelligent Data Sources</label>
                            <div className="grid grid-cols-2 gap-3">
                                {SOURCES.map(src => (
                                    <label key={src} onClick={() => toggleSource(src)} className="flex items-center gap-3 cursor-pointer group select-none bg-slate-50 border border-slate-200 p-3 rounded-xl hover:border-slate-300 transition-colors">
                                        <div className={`w-4 h-4 shrink-0 rounded flex items-center justify-center transition-colors border ${selectedSources.includes(src) ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300 group-hover:border-slate-400'}`}>
                                            {selectedSources.includes(src) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span className={`font-bold text-xs truncate transition-colors ${selectedSources.includes(src) ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>{src}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Category Checkboxes */}
                        <div className="mb-8 relative z-10">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Target Import Niches</label>
                            <div className="space-y-3">
                                {CATEGORIES.map(cat => (
                                    <label key={cat} onClick={() => toggleCategory(cat)} className="flex items-center gap-4 cursor-pointer group select-none">
                                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${selectedCategories.includes(cat) ? 'bg-red-600 border-red-600' : 'bg-slate-50 border-slate-300 group-hover:border-red-400'}`}>
                                            {selectedCategories.includes(cat) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span className={`font-bold text-sm transition-colors ${selectedCategories.includes(cat) ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Strict Filter & Volume Settings */}
                        <div className="mb-10 relative z-10 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Target Volume (Per Niche)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="5"
                                        max="50"
                                        step="5"
                                        value={targetLeads}
                                        onChange={(e) => setTargetLeads(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                                    />
                                    <div className="bg-slate-900 text-white font-black text-xs px-3 py-1.5 rounded-lg w-12 text-center shadow-inner">
                                        {targetLeads}
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-200 w-full" />

                            <label onClick={() => setStrictFilter(!strictFilter)} className="flex items-start gap-4 cursor-pointer group select-none">
                                <div className={`w-5 h-5 mt-0.5 shrink-0 rounded flex items-center justify-center transition-colors border ${strictFilter ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300 group-hover:border-slate-500'}`}>
                                    {strictFilter && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <div>
                                    <span className={`font-bold text-sm block mb-1 transition-colors ${strictFilter ? 'text-slate-900' : 'text-slate-500'}`}>Strict Importer Filter</span>
                                    <span className="text-xs text-slate-400 block leading-relaxed">Auto-removes local B2C clinics, hospitals, and pharmacies. Deduplicates results.</span>
                                </div>
                            </label>
                        </div>

                        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold relative z-10">{error}</div>}

                        <button
                            onClick={handleScrape}
                            disabled={isScraping}
                            className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all relative z-10 ${isScraping ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02] shadow-xl shadow-red-900/20'}`}
                        >
                            {isScraping ? 'Agent Deploying...' : 'Deploy Scraping Agent'}
                        </button>

                        {/* Decorative Background */}
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-red-600/5 blur-[50px] rounded-full pointer-events-none"></div>
                    </div>
                </div>

                {/* Right Data Table */}
                <div className="col-span-8 overflow-hidden flex flex-col h-[calc(100vh-160px)]">
                    <div className="bg-white flex-1 border border-slate-200 rounded-3xl p-8 shadow-2xl flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <div className="flex gap-4 items-center">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Intelligence Feed</h2>
                                {leads.length > 0 && <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">{leads.length} Entities Found</span>}
                            </div>
                            {isScraping && <div className="text-red-600 font-bold text-xs uppercase tracking-widest animate-pulse flex items-center gap-2"><div className="w-2 h-2 bg-red-600 rounded-full"></div> Scraping Active</div>}
                            {!isScraping && leads.length > 0 && (
                                <div className="text-xs font-bold text-slate-400">
                                    {selectedLeads.size} Selected
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-slate-50 shadow-inner">
                            {leads.length === 0 && !isScraping ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                                    <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    <p className="font-bold uppercase tracking-widest text-xs">Awaiting Agent Deployment</p>
                                </div>
                            ) : isScraping && leads.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-6">
                                    <div className="w-12 h-12 border-4 border-t-red-600 border-slate-200 rounded-full animate-spin"></div>
                                    <p className="font-bold uppercase tracking-widest text-xs animate-pulse text-slate-400">Navigating Google Business & Extracting Nodes...</p>
                                </div>
                            ) : (
                                <table className="w-full text-left text-xs font-bold text-slate-600 relative">
                                    <thead className="bg-slate-100 text-slate-500 uppercase tracking-widest border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                                        <tr>
                                            <th className="px-6 py-4 w-16">
                                                <div
                                                    onClick={toggleAllLeads}
                                                    className={`w-5 h-5 rounded cursor-pointer flex items-center justify-center transition-colors border ${selectedLeads.size === leads.length && leads.length > 0 ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300'}`}
                                                >
                                                    {selectedLeads.size > 0 && selectedLeads.size < leads.length && <div className="w-2.5 h-0.5 bg-slate-900 rounded-full"></div>}
                                                    {selectedLeads.size === leads.length && leads.length > 0 && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                                                </div>
                                            </th>
                                            <th className="py-4 pr-6">Company Name</th>
                                            <th className="px-6 py-4">Contact</th>
                                            <th className="px-6 py-4">Email Extracted</th>
                                            <th className="px-6 py-4 text-right">Target Niche</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {leads.map((lead, i) => (
                                            <tr key={i} onClick={() => toggleLeadSelection(i)} className={`cursor-pointer transition-colors ${selectedLeads.has(i) ? 'bg-slate-50/80 hover:bg-slate-100' : 'hover:bg-slate-50'}`}>
                                                <td className="px-6 py-4">
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${selectedLeads.has(i) ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300'}`}>
                                                        {selectedLeads.has(i) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-6">
                                                    <div className="text-slate-900 font-black text-sm">{lead.company_name}</div>
                                                    <div className="text-[10px] mt-1 text-slate-400 flex gap-2 items-center tracking-wider uppercase">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> {lead.country}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 space-y-2">
                                                    {lead.phone && <div className="text-slate-700">{lead.phone}</div>}
                                                    {lead.website && <a href={lead.website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-block text-[10px] px-2 py-0.5 bg-slate-100 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors uppercase tracking-widest">Visit Site</a>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {lead.email ? (
                                                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-md border border-green-200 shadow-sm">{lead.email}</span>
                                                    ) : (
                                                        <span className="text-slate-400 italic font-normal text-[10px] uppercase tracking-widest">None Detected</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-400 uppercase tracking-wider text-[10px]">
                                                    {lead.category.replace('Importers', '')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
