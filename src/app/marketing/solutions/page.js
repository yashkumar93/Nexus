import Link from 'next/link';

export const metadata = {
  title: 'Solutions — Continuum',
  description: 'Continuum adapts to your role, providing the exact context you need, exactly when you need it.',
};

export default function SolutionsPage() {
  return (
    <div className="marketing min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#c6c6cd]/20 shadow-sm" style={{background:'rgba(247,249,251,0.8)',backdropFilter:'blur(24px)'}}>
        <div className="flex justify-between items-center h-20 px-6 mx-auto" style={{maxWidth:'1440px'}}>
          <Link href="/marketing" className="text-3xl font-bold tracking-tight" style={{fontFamily:'Geist,sans-serif',color:'#000'}}>Continuum</Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link href="/marketing" className="text-[#45464d] hover:text-[#4648d4] transition-colors text-base">Product</Link>
            <Link href="/marketing/solutions" className="text-[#4648d4] font-bold border-b-2 border-[#4648d4] text-base">Solutions</Link>
            <Link href="/marketing/engine" className="text-[#45464d] hover:text-[#4648d4] transition-colors text-base">Engine</Link>
            <Link href="/marketing/pricing" className="text-[#45464d] hover:text-[#4648d4] transition-colors text-base">Pricing</Link>
          </div>
          <Link href="/auth/register" className="bg-black text-white px-6 py-2 rounded-full text-xs font-bold tracking-widest hidden md:block hover:bg-black/90 transition-colors">Get Started</Link>
        </div>
      </nav>

      <main className="flex-grow flex flex-col" style={{paddingTop:'80px'}}>
        {/* Hero */}
        <section className="py-12 px-6 mx-auto w-full text-center mt-12" style={{maxWidth:'1440px'}}>
          <h1 className="text-5xl font-bold tracking-tight mb-4" style={{fontFamily:'Geist,sans-serif',color:'#000',letterSpacing:'-0.02em',lineHeight:'56px'}}>Solutions for Every Mind</h1>
          <p className="text-lg text-[#45464d] max-w-2xl mx-auto mb-12" style={{lineHeight:'28px'}}>
            Continuum adapts to your role, providing the exact context you need, exactly when you need it. Discover how our Organizational Memory Engine transforms daily workflows.
          </p>
        </section>

        {/* Role Benefits - Glass Bento Grid */}
        <section className="py-12 px-6 mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6" style={{maxWidth:'1440px'}}>
          {/* Engineering Manager */}
          <div className="glass-card rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#4648d4] text-2xl" style={{fontVariationSettings:"'FILL' 1"}}>engineering</span>
              <h3 className="text-2xl font-semibold" style={{fontFamily:'Geist,sans-serif',color:'#000'}}>Engineering Managers</h3>
            </div>
            <p className="text-[#45464d] text-base mb-4 flex-grow">
              Priya uses Continuum to maintain architectural governance without slowing down velocity. The engine automatically links PRs to historical technical decisions.
            </p>
            <div className="mt-auto">
              <span className="inline-flex items-center gap-1 text-[#4648d4] text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#4648d4] inline-block"></span> Governance &amp; Speed
              </span>
            </div>
          </div>

          {/* Product Manager */}
          <div className="glass-card rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#4648d4] text-2xl" style={{fontVariationSettings:"'FILL' 1"}}>view_kanban</span>
              <h3 className="text-2xl font-semibold" style={{fontFamily:'Geist,sans-serif',color:'#000'}}>Product Managers</h3>
            </div>
            <p className="text-[#45464d] text-base mb-4 flex-grow">
              Devon relies on real-time context during strategy meetings. Continuum surfaces relevant customer feedback and past feature experiments instantly.
            </p>
            <div className="mt-auto">
              <span className="inline-flex items-center gap-1 text-[#4648d4] text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#4cd7f6] inline-block"></span> Real-time Context
              </span>
            </div>
          </div>

          {/* New Hires */}
          <div className="glass-card rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#4648d4] text-2xl" style={{fontVariationSettings:"'FILL' 1"}}>school</span>
              <h3 className="text-2xl font-semibold" style={{fontFamily:'Geist,sans-serif',color:'#000'}}>New Hires</h3>
            </div>
            <p className="text-[#45464d] text-base mb-4 flex-grow">
              Nadia experiences a frictionless onboarding. The engine maps organizational knowledge dynamically, allowing her to acquire deep context rapidly.
            </p>
            <div className="mt-auto">
              <span className="inline-flex items-center gap-1 text-[#4648d4] text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#bec6e0] inline-block"></span> Rapid Acquisition
              </span>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="py-12 bg-[#f2f4f6] mt-12">
          <div className="px-6 mx-auto w-full" style={{maxWidth:'1440px'}}>
            <h2 className="text-3xl font-semibold mb-12 text-center" style={{fontFamily:'Geist,sans-serif',color:'#000',letterSpacing:'-0.01em'}}>How it Works</h2>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 space-y-6">
                {[{n:1,title:'Ingest',body:'Continuum quietly integrates with your existing tools, absorbing conversations, documents, and code.'},{n:2,title:'Synthesize',body:'The engine identifies patterns, resolving contradictions and mapping relationships across domains.'},{n:3,title:'Surface',body:'Context is delivered ambiently exactly when needed, tailored to the user\'s current task and role.'}].map(s=>(
                  <div key={s.n} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#4648d4] text-white flex items-center justify-center font-bold shrink-0" style={{fontSize:'14px'}}>{s.n}</div>
                    <div>
                      <h4 className="text-2xl font-semibold mb-1" style={{fontFamily:'Geist,sans-serif',color:'#000'}}>{s.title}</h4>
                      <p className="text-[#45464d] text-base">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex-1 relative w-full rounded-xl overflow-hidden border border-[#c6c6cd]/30 shadow-sm" style={{height:'320px'}}>
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgOqVN0BLl6g8xlV_ARp7evW5eBuRyC_WcfNVNU_NSx3su8S5fBTNfV131uWZuAMBFMwV21zOCxvX0b4yFWrld3_nOTEn10c_8R3r-Xs8dJHRVOXGx2pO1lekHIc1zayZvuSm_sxQpEyl-1qJUnGJOdtg2h3XF0BNIZ71WzASdGD1IOw3XzxUlHisY-7yPfMZcvFzn-k_kAfrQIEDAbHhAl5xdr_cUl3TicMh4TNxmmVwCdi4uARe-d9gusKU6Q68n6WwH2Rp_X38" alt="Continuum data flow visualization" className="object-cover w-full h-full" />
              </div>
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-12 px-6 mx-auto w-full mb-12" style={{maxWidth:'1440px'}}>
          <h2 className="text-3xl font-semibold mb-6" style={{fontFamily:'Geist,sans-serif',color:'#000',letterSpacing:'-0.01em'}}>Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group cursor-pointer">
              <div className="h-48 rounded-xl overflow-hidden mb-4 border border-[#c6c6cd]/30 relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGw6eUDdqR5scgw8gqbE8zzPGqlCBMtw2F1Svz40QZJfdLRlwLj_fabhuMK2sDAc7JwFIhwCEGMcVEzqEb_UTnVk5gKRDvRI6U_9QAWejvtRVdviDQ_NWwWleasfg3FsOp3d6e1UyuQeL4Mn205xbHoN8JEpjRVyWfyiRJpDQ4eJmrBcWx9FK5Kvoiv25oRiCq2fO36yjn1ZOVUlmMXZQpRMaRCJzxt9x7WDLJ9qykld5QnOgPRWgkzrvzowy5VFRgvVBnZCdMHlY" alt="Fintech Corp case study" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h4 className="text-2xl font-semibold mb-1 group-hover:text-[#4648d4] transition-colors" style={{fontFamily:'Geist,sans-serif',color:'#000'}}>Fintech Corp</h4>
              <p className="text-[#45464d] text-base">Reduced onboarding time by 40% and eliminated duplicate architectural research.</p>
            </div>
            <div className="group cursor-pointer">
              <div className="h-48 rounded-xl overflow-hidden mb-4 border border-[#c6c6cd]/30 relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEPRj_elWahpels7p6edmNJUvrD_go6jNPOdmDkfA_Aq_kfCC3EuSgn2O6F-6TmkE5WaG399yPZV99UO-sWx4gjkMXQ7VhqcW58dL7YQKKYKwUzK_xbODJRj3vVCkWiSZP2TOXRpEU8slzUSeY7QAn1Etl9LtoSWBrJxEsrN1kNwcxfMpIKco56Wf0c-hevTRupPKrMzqJ6GiubVsJ7B2kgNo7oW9YXqwBW1vrI9flBp7aN6MEMv8Xi7_246E85bfiWyM0pEyDoqs" alt="HealthTech case study" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h4 className="text-2xl font-semibold mb-1 group-hover:text-[#4648d4] transition-colors" style={{fontFamily:'Geist,sans-serif',color:'#000'}}>HealthTech Innovators</h4>
              <p className="text-[#45464d] text-base">Accelerated feature delivery by surfacing historical context during product strategy sessions.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#c6c6cd]/30">
        <div className="flex flex-col md:flex-row justify-between items-center py-12 px-6 mx-auto" style={{maxWidth:'1440px'}}>
          <div className="text-2xl font-bold mb-4 md:mb-0" style={{fontFamily:'Geist,sans-serif',color:'#000'}}>Continuum</div>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {['Privacy Policy','Terms of Service','Security','Status','Contact'].map(l=>(
              <Link key={l} href="#" className="text-[#45464d] hover:text-[#4648d4] transition-colors">{l}</Link>
            ))}
          </div>
          <div className="text-[#45464d] text-sm mt-4 md:mt-0">© 2024 Continuum Engine. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
