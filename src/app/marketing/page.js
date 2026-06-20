import Link from 'next/link';

export const metadata = {
  title: 'Continuum — Your Organization\'s Collective Memory',
  description: 'Continuum silently observes, organizes, and retrieves the critical context of your work. Zero manual entry required. Absolute recall guaranteed.',
};

export default function MarketingHome() {
  return (
    <div className="marketing min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[rgba(247,249,251,0.8)] backdrop-blur-xl border-b border-[#c6c6cd]/30" style={{maxWidth:'100%'}}>
        <div className="text-2xl font-bold" style={{fontFamily:'Geist,sans-serif',color:'#000'}}>Continuum</div>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/marketing" className="text-[#4648d4] font-bold border-b-2 border-[#4648d4] pb-1 text-sm">Product</Link>
          <Link href="/marketing/solutions" className="text-[#45464d] hover:text-black transition-colors text-sm">Solutions</Link>
          <Link href="/marketing/engine" className="text-[#45464d] hover:text-black transition-colors text-sm">Engine</Link>
          <Link href="/marketing/pricing" className="text-[#45464d] hover:text-black transition-colors text-sm">Pricing</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm text-[#45464d] hover:text-black transition-colors">Sign In</Link>
          <Link href="/auth/register" className="bg-black text-white px-5 py-2 rounded-full text-xs font-bold tracking-wide hover:bg-black/90 transition-colors">Get Started</Link>
        </div>
      </nav>

      <main className="flex-grow" style={{paddingTop:'80px'}}>
        {/* Hero */}
        <section className="py-12 px-6 mx-auto text-center flex flex-col items-center justify-center" style={{maxWidth:'1440px',minHeight:'614px'}}>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-[#191c1e] max-w-4xl" style={{fontFamily:'Geist,sans-serif',lineHeight:'1.1',letterSpacing:'-0.02em'}}>
            Your Organization's Collective Memory, Ambiently Captured.
          </h1>
          <p className="text-lg text-[#45464d] mb-12 max-w-2xl" style={{fontFamily:'Inter,sans-serif',lineHeight:'28px'}}>
            Continuum silently observes, organizes, and retrieves the critical context of your work. Zero manual entry required. Absolute recall guaranteed.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link href="/auth/register" className="bg-black text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-black/90 transition-colors shadow-sm">
              Get Started
            </Link>
            <Link href="/marketing/engine" className="border border-[#c6c6cd] text-[#191c1e] px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#f2f4f6] transition-colors">
              See the Engine
            </Link>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="py-12 px-6 bg-[#f2f4f6]">
          <div className="mx-auto" style={{maxWidth:'1440px'}}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="bg-white p-6 rounded-xl border border-[#c6c6cd]/30 shadow-sm flex flex-col items-start">
                <span className="material-symbols-outlined text-[#4648d4] text-3xl mb-2" style={{fontVariationSettings:"'FILL' 1"}}>mic</span>
                <h3 className="text-2xl font-semibold mb-2" style={{fontFamily:'Geist,sans-serif'}}>Zero Manual Entry</h3>
                <p className="text-[#45464d] text-base">We passively digest meetings, threads, and documents. No more taking notes, tagging, or manual organizing.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-[#c6c6cd]/30 shadow-sm flex flex-col items-start">
                <span className="material-symbols-outlined text-[#001f26] text-3xl mb-2" style={{fontVariationSettings:"'FILL' 1"}}>verified</span>
                <h3 className="text-2xl font-semibold mb-2" style={{fontFamily:'Geist,sans-serif'}}>Trustworthy Source-of-Truth</h3>
                <p className="text-[#45464d] text-base">Every decision is mapped to its original source. Trace the lineage of any thought back to the exact moment it was born.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-[#c6c6cd]/30 shadow-sm flex flex-col items-start">
                <span className="material-symbols-outlined text-[#ba1a1a] text-3xl mb-2" style={{fontVariationSettings:"'FILL' 1"}}>warning</span>
                <h3 className="text-2xl font-semibold mb-2" style={{fontFamily:'Geist,sans-serif'}}>Catch Contradictions Early</h3>
                <p className="text-[#45464d] text-base">The Engine automatically flags when new decisions conflict with established past precedents, preventing costly misalignment.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 px-6 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-4xl font-bold mb-4" style={{fontFamily:'Geist,sans-serif'}}>Ready to give your org a memory?</h2>
            <p className="text-[#45464d] mb-8 text-lg">Join the teams using Continuum to eliminate context loss forever.</p>
            <Link href="/auth/register" className="bg-black text-white px-10 py-4 rounded-full text-sm font-bold tracking-wide hover:bg-black/90 transition-colors inline-block">
              Start for Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-6 flex flex-col md:flex-row justify-between items-center bg-white border-t border-[#c6c6cd]/50" style={{maxWidth:'100%'}}>
        <div className="text-2xl font-bold text-black mb-4 md:mb-0" style={{fontFamily:'Geist,sans-serif'}}>Continuum</div>
        <div className="flex flex-wrap justify-center gap-4 mb-4 md:mb-0">
          <Link href="#" className="text-[#45464d] hover:text-black text-sm transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-[#45464d] hover:text-black text-sm transition-colors">Terms of Service</Link>
          <Link href="#" className="text-[#45464d] hover:text-black text-sm transition-colors">Security</Link>
          <Link href="#" className="text-[#45464d] hover:text-black text-sm transition-colors">Status</Link>
        </div>
        <div className="text-[#45464d] text-sm">© 2024 Continuum AI. All rights reserved.</div>
      </footer>
    </div>
  );
}
