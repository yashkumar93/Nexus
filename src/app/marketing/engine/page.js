import Link from 'next/link';

export const metadata = {
  title: 'Continuum Engine — Technology Showcase',
  description: 'Powered by a proprietary AI/ML pipeline designed for absolute reliability and cognitive ease.',
};

export default function EnginePage() {
  return (
    <div className="marketing min-h-screen" style={{background:'#f7f9fb',color:'#191c1e'}}>
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#c6c6cd]/20 shadow-sm" style={{background:'rgba(247,249,251,0.8)',backdropFilter:'blur(24px)'}}>
        <div className="flex justify-between items-center h-20 px-6 mx-auto" style={{maxWidth:'1440px'}}>
          <Link href="/marketing" className="text-3xl font-bold tracking-tight" style={{fontFamily:'Geist,sans-serif',color:'#000'}}>Continuum</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/marketing" className="text-[#45464d] hover:text-[#4648d4] transition-colors text-base">Product</Link>
            <Link href="/marketing/solutions" className="text-[#45464d] hover:text-[#4648d4] transition-colors text-base">Solutions</Link>
            <Link href="/marketing/engine" className="text-[#4648d4] font-bold border-b-2 border-[#4648d4] text-base">Engine</Link>
            <Link href="/marketing/pricing" className="text-[#45464d] hover:text-[#4648d4] transition-colors text-base">Pricing</Link>
          </div>
          <Link href="/auth/register" className="bg-black text-white px-6 py-2 rounded-full text-xs font-bold tracking-widest hover:bg-black/90 transition-colors">Get Started</Link>
        </div>
      </nav>

      <main style={{paddingTop:'128px',paddingBottom:'96px'}}>
        {/* Hero */}
        <section className="mx-auto px-6 mb-24 text-center" style={{maxWidth:'1440px'}}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#c6c6cd]/30 mb-6" style={{background:'#eceef0'}}>
            <span className="material-symbols-outlined text-[#4648d4] text-sm">memory</span>
            <span className="text-[#45464d] text-xs font-bold uppercase tracking-wider" style={{fontFamily:'Geist,monospace'}}>ContextOS × MeetMind Architecture</span>
          </div>
          <h1 className="font-bold mb-6 max-w-4xl mx-auto" style={{fontFamily:'Geist,sans-serif',color:'#000',fontSize:'clamp(40px,5vw,64px)',lineHeight:'1.1',letterSpacing:'-0.02em'}}>
            The Organizational Memory Engine
          </h1>
          <p className="text-lg text-[#45464d] max-w-2xl mx-auto mb-12" style={{lineHeight:'28px'}}>
            Continuum is powered by a proprietary AI/ML pipeline designed for absolute reliability and cognitive ease. It transforms raw interactions into structured, permanent intelligence.
          </p>
        </section>

        {/* Pipeline Architecture Bento Grid */}
        <section className="mx-auto px-6 mb-24" style={{maxWidth:'1440px'}}>
          <div className="grid gap-6" style={{gridTemplateColumns:'repeat(12,1fr)'}}>

            {/* Transcription Node — 5 cols */}
            <div className="bg-white rounded-xl border border-[#c6c6cd]/30 p-8 shadow-sm relative overflow-hidden hover:border-[#4648d4]/30 transition-colors" style={{gridColumn:'span 5'}}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined" style={{fontSize:'96px'}}>mic</span>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{background:'#eceef0'}}>
                <span className="material-symbols-outlined text-[#4648d4]" style={{fontVariationSettings:"'FILL' 1"}}>graphic_eq</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2" style={{fontFamily:'Geist,sans-serif'}}>Whisper-Class Transcription</h3>
              <p className="text-[#45464d] text-base mb-6 relative z-10">
                Flawless, multi-speaker diarization capturing every nuance of conversation in real-time, forming the base layer of organizational memory.
              </p>
              <div className="h-32 rounded-lg flex items-end p-2 gap-1 overflow-hidden" style={{background:'#f7f9fb'}}>
                {[20,60,40,80,30,70,50,90,35,65].map((h,i)=>(
                  <div key={i} className="flex-1 rounded-t-sm animate-pulse" style={{height:`${h}%`,background:`rgba(70,72,212,${0.2+i*0.06})`,animationDelay:`${i*75}ms`}}></div>
                ))}
              </div>
            </div>

            {/* Reasoning Node — 7 cols */}
            <div className="bg-white rounded-xl border border-[#c6c6cd]/30 p-8 shadow-sm relative overflow-hidden hover:border-[#4648d4]/30 transition-colors" style={{gridColumn:'span 7'}}>
              <div className="absolute inset-0 bg-pattern opacity-50 pointer-events-none"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{background:'#131b2e',color:'#7c839b'}}>
                    <span className="material-symbols-outlined" style={{fontVariationSettings:"'FILL' 1"}}>psychology</span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2" style={{fontFamily:'Geist,sans-serif'}}>AI Reasoning Engine</h3>
                  <p className="text-[#45464d] text-base mb-6 max-w-lg">
                    Advanced contextual comprehension that extracts intent, action items, and implicit knowledge from raw transcripts.
                  </p>
                </div>
                <div className="rounded-lg p-4 border border-[#c6c6cd]/20 flex gap-4 items-center" style={{background:'#f7f9fb'}}>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 rounded bg-[#c6c6cd]/30" style={{width:'75%'}}></div>
                    <div className="h-2 rounded bg-[#c6c6cd]/30" style={{width:'50%'}}></div>
                  </div>
                  <span className="material-symbols-outlined text-[#4648d4]">arrow_forward</span>
                  <div className="px-3 py-1.5 rounded text-xs font-bold" style={{background:'rgba(70,72,212,0.1)',color:'#4648d4',fontFamily:'Geist,monospace'}}>
                    Entity Extraction Active
                  </div>
                </div>
              </div>
            </div>

            {/* Persistence Node — 8 cols */}
            <div className="bg-white rounded-xl border border-[#c6c6cd]/30 p-8 shadow-sm hover:border-[#4648d4]/30 transition-colors" style={{gridColumn:'span 8'}}>
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{background:'#eceef0'}}>
                  <span className="material-symbols-outlined text-[#4648d4]" style={{fontVariationSettings:"'FILL' 1"}}>database</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-2" style={{fontFamily:'Geist,sans-serif'}}>Hybrid Persistence Architecture</h3>
                  <p className="text-[#45464d] text-base mb-6">A tri-layer database system designed for rapid retrieval and complex relationship mapping.</p>
                  <div className="grid grid-cols-3 gap-4">
                    {[{icon:'data_array',label:'Vector DB',desc:'Semantic search & embeddings'},{icon:'hub',label:'Graph DB',desc:'Entity relationship mapping'},{icon:'table_view',label:'Relational DB',desc:'Structured metadata & auth'}].map(db=>(
                      <div key={db.label} className="p-4 rounded-lg border border-[#c6c6cd]/20" style={{background:'#f7f9fb'}}>
                        <span className="material-symbols-outlined mb-2 block" style={{color:'#000'}}>{ db.icon }</span>
                        <h4 className="text-xs font-bold uppercase tracking-wide mb-1" style={{fontFamily:'Geist,sans-serif'}}>{db.label}</h4>
                        <p className="text-xs text-[#45464d]">{db.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contradiction Node — 4 cols */}
            <div className="rounded-xl border border-[#c6c6cd]/30 p-8 shadow-sm relative" style={{gridColumn:'span 4',background:'#fdfaf5'}}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{background:'#f0e6d2',color:'#93000a'}}>
                <span className="material-symbols-outlined" style={{fontVariationSettings:"'FILL' 1"}}>warning</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2" style={{fontFamily:'Geist,sans-serif'}}>Contradiction Detection</h3>
              <p className="text-[#45464d] text-sm mb-6">
                Continuous cross-referencing algorithms instantly flag conflicting statements against the organizational memory baseline.
              </p>
              <div className="bg-white border border-[#ffdad6] rounded-lg p-3 flex items-start gap-3 shadow-sm">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 animate-pulse" style={{background:'#ba1a1a'}}></div>
                <div>
                  <span className="text-xs font-bold text-[#ba1a1a] block mb-1 uppercase tracking-wide">Conflicting Data Detected</span>
                  <p className="text-xs text-[#45464d]">&quot;Q3 launch moved to November&quot; conflicts with previously stated &quot;October deadline&quot;.</p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#c6c6cd]/30 py-12 px-6" style={{maxWidth:'100%'}}>
        <div className="flex flex-col md:flex-row justify-between items-center mx-auto" style={{maxWidth:'1440px'}}>
          <div className="mb-6 md:mb-0">
            <span className="text-2xl font-bold block mb-1" style={{fontFamily:'Geist,sans-serif',color:'#000'}}>Continuum</span>
            <span className="text-xs text-[#45464d]">© 2024 Continuum Engine. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {['Privacy Policy','Terms of Service','Security','Status','Contact'].map(l=>(
              <Link key={l} href="#" className="text-sm text-[#45464d] hover:text-[#4648d4] transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
