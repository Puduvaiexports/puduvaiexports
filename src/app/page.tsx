"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  const [isBrochureOpen, setIsBrochureOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      });
    }
  };

  const brochureItems = [
    { category: "Healthcare", name: "5 Nature", icon: "🌱" },
    { category: "FMCG", name: "Tasty6", icon: "🥘" },
    { category: "Healthcare", name: "First Care", icon: "🛡️" },
  ];

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 px-[5%] py-4 md:py-6 flex justify-between items-center ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-3 md:py-4" : "bg-transparent"
          }`}
      >
        <div className="text-xl md:text-2xl font-extrabold tracking-tighter font-heading text-blue-600">
          Puduvai <span className="text-slate-800 font-semibold">Exports</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium items-center">
          {["Home", "About", "Medicare", "Our Brands"].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item.toLowerCase())}
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              {item}
            </button>
          ))}

          {/* Brochure Dropdown */}
          <div
            className="relative group"
            onMouseEnter={() => setIsBrochureOpen(true)}
            onMouseLeave={() => setIsBrochureOpen(false)}
          >
            <button className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors py-2">
              Brochure
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isBrochureOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Card */}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 transition-all duration-300 origin-top ${isBrochureOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
              <div className="space-y-2">
                {brochureItems.map((item, idx) => (
                  <button
                    key={idx}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group text-left"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{item.category}</div>
                      <div className="text-slate-900 font-bold">{item.name}</div>
                    </div>
                    <svg className="w-4 h-4 ml-auto text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50">
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
                  View All Brochures
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => scrollToSection("contact")}
            className="text-slate-600 hover:text-blue-600 transition-colors"
          >
            Contact
          </button>
        </div>
        <button
          onClick={() => scrollToSection("contact")}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform"
        >
          Inquiry
        </button>
      </nav>

      {/* Hero Section */}
      <header id="home" className="relative pt-32 pb-16 md:pt-48 md:pb-32 overflow-hidden bg-slate-50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-6">
              <div className="w-10 h-0.5 bg-blue-600"></div>
              <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-xs md:text-sm">
                Global Supplier
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-heading leading-tight mb-6 text-slate-900">
              Advancing Global <span className="text-blue-600">Healthcare</span> Standards
            </h1>
            <p className="text-slate-600 text-lg md:text-xl max-w-xl mb-10 mx-auto md:mx-0">
              Indian-based leaders in surgical textiles and dressings. Delivering sterile, safe, and effective medical supplies to healthcare facilities worldwide.
            </p>

            <div className="flex flex-wrap gap-8 justify-center md:justify-start mb-12">
              {[
                { label: "Years Exp", value: "15+" },
                { label: "Countries", value: "50+" },
                { label: "Sterile", value: "100%" }
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl md:text-3xl font-extrabold text-blue-600 font-heading">{stat.value}</div>
                  <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest font-bold">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={() => scrollToSection("medicare")}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-xl shadow-blue-600/20"
              >
                Our Products
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold hover:border-blue-600 hover:text-blue-600 transition-all"
              >
                Contact Us
              </button>
            </div>
          </div>

          <div className="flex-1 relative w-full aspect-square md:aspect-auto md:h-[600px]">
            <div className="absolute inset-0 bg-blue-600/5 rounded-full blur-3xl"></div>
            <Image
              src="/herovisual.jpg"
              alt="Global Healthcare Supply"
              fill
              className="object-contain drop-shadow-2xl animate-float"
              priority
            />
          </div>
        </div>
      </header>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading mb-4 text-slate-900">Welcome To Puduvai Exports</h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                We, Puduvai Exports, are an Indian-based company located in the historic and vibrant city of Puducherry. With a legacy built on trust and excellence, we serve as a Bridge between Indian quality and global needs.
              </p>
              <p>
                Established in the healthcare industry for the past 15 years, Puduvai Exports has built a solid reputation as a leading manufacturer and supplier of high-quality medical and healthcare products.
              </p>
            </div>
            <div className="glass p-8 md:p-12 rounded-3xl space-y-6 border-blue-50 relative">
              <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold font-heading text-slate-900">Our Commitment</h3>
              <p className="text-slate-600">
                We take great care to ensure the sterility, safety, and effectiveness of our medical supplies, making them suitable for a wide range of healthcare applications. Rely on us to deliver the best care to your patients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Medicare Section */}
      <section id="medicare" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading mb-4 text-slate-900">Medicare Products</h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                title: "Surgical Textiles",
                desc: "Premium quality surgical gowns, drapes, and sterilized fabrics meeting international medical standards.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.642.321a6 6 0 01-3.86.517l-2.388-.477a2 2 0 00-1.21.194l-1.062.708A2 2 0 002 18.062V22h20v-3.938a2 2 0 00-2.572-1.634z" />
                  </svg>
                )
              },
              {
                title: "Dressings",
                desc: "Advanced wound care solutions including sterile gauzes, bandages, and specialized surgical dressings.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )
              },
              {
                title: "Surgical Instruments",
                desc: "Precision-engineered surgical tools designed for accuracy and durability in critical medical procedures.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 00-1 1v1a2 2 0 11-4 0v-1a1 1 0 00-1-1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                )
              }
            ].map((p) => (
              <div key={p.title} className="glass p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border-none shadow-xl shadow-slate-200/50 group">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  {p.icon}
                </div>
                <h3 className="text-2xl font-bold font-heading mb-4 text-slate-900">{p.title}</h3>
                <p className="text-slate-500 leading-relaxed text-lg">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Brands Section */}
      <section id="our brands" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading mb-4 text-slate-900">Our Brands</h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
            <p className="mt-6 text-slate-600 text-lg">
              We take pride in our diverse portfolio of healthcare brands, each representing our commitment to quality and innovation.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 hover:border-blue-200 transition-colors group">
                <span className="text-slate-400 font-bold group-hover:text-blue-500 transition-colors">Brand {i}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brochure Section */}
      <section id="brochure" className="py-24 bg-blue-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-extrabold font-heading mb-6">Download Our Digital Brochure</h2>
              <p className="text-blue-100 text-lg mb-8">
                Get a comprehensive overview of our complete product range, technical specifications, and quality certifications in our latest catalog.
              </p>
              <button className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-xl flex items-center gap-3 mx-auto md:mx-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF (5.2 MB)
              </button>
            </div>
            <div className="hidden md:flex w-64 h-80 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 rotate-3 items-center justify-center shadow-2xl">
              <div className="w-48 h-64 bg-white rounded-lg flex flex-col p-4">
                <div className="w-full h-32 bg-slate-100 rounded mb-4"></div>
                <div className="h-2 w-3/4 bg-slate-100 rounded mb-2"></div>
                <div className="h-2 w-full bg-slate-100 rounded mb-2"></div>
                <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 text-center">
          <div className="text-3xl font-extrabold tracking-tighter font-heading text-blue-600 mb-6">
            Puduvai <span className="text-slate-800 font-semibold">Exports</span>
          </div>
          <p className="text-slate-500 mb-10 max-w-lg mx-auto">
            Located in Puducherry, India | Serving Global Healthcare Markets with precision and trust.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {["Home", "About", "Medicare", "Our Brands", "Brochure", "Contact"].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
          <div className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Puduvai Exports. All Rights Reserved.
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
