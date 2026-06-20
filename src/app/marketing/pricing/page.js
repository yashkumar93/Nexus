import Link from 'next/link';

export const metadata = {
  title: 'Pricing — Continuum',
  description: 'Simple, transparent pricing for teams of all sizes.',
};

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'per user / month',
      desc: 'For small teams exploring organizational memory.',
      features: ['Up to 5 users','10 hours of meeting capture / mo','Basic knowledge graph','Email support'],
      cta: 'Start Free',
      href: '/auth/register',
      highlighted: false,
    },
    {
      name: 'Team',
      price: '$29',
      period: 'per user / month',
      desc: 'For growing teams that need real-time intelligence.',
      features: ['Unlimited users','Unlimited meeting capture','Full knowledge graph + contradiction detection','Priority support','Custom integrations'],
      cta: 'Get Started',
      href: '/auth/register',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      desc: 'For large orgs with complex compliance requirements.',
      features: ['Everything in Team','SSO & SCIM provisioning','Dedicated customer success','On-prem deployment option','SLA guarantee'],
      cta: 'Contact Sales',
      href: '#',
      highlighted: false,
    },
  ];

  return (
    <div className="marketing min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#c6c6cd]/20 shadow-sm" style={{background:'rgba(247,249,251,0.8)',backdropFilter:'blur(24px)'}}>
        <div className="flex justify-between items-center h-20 px-6 mx-auto" style={{maxWidth:'1440px'}}>
          <Link href="/marketing" className="text-3xl font-bold tracking-tight" style={{fontFamily:'Geist,sans-serif',color:'#000'}}>Continuum</Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link href="/marketing" className="text-[#45464d] hover:text-[#4648d4] transition-colors text-base">Product</Link>
            <Link href="/marketing/solutions" className="text-[#45464d] hover:text-[#4648d4] transition-colors text-base">Solutions</Link>
            <Link href="/marketing/engine" className="text-[#45464d] hover:text-[#4648d4] transition-colors text-base">Engine</Link>
            <Link href="/marketing/pricing" className="text-[#4648d4] font-bold border-b-2 border-[#4648d4] text-base">Pricing</Link>
          </div>
          <Link href="/auth/register" className="bg-black text-white px-6 py-2 rounded-full text-xs font-bold tracking-widest hidden md:block hover:bg-black/90 transition-colors">Get Started</Link>
        </div>
      </nav>

      <main className="flex-grow" style={{paddingTop:'80px'}}>
        {/* Hero */}
        <section className="py-16 px-6 text-center mx-auto" style={{maxWidth:'1440px'}}>
          <h1 className="text-5xl font-bold tracking-tight mb-4" style={{fontFamily:'Geist,sans-serif',color:'#000',letterSpacing:'-0.02em',lineHeight:'56px'}}>
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-[#45464d] max-w-xl mx-auto" style={{lineHeight:'28px'}}>
            No hidden fees. Scale up as your team grows.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="px-6 pb-16 mx-auto" style={{maxWidth:'1440px'}}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div
                key={plan.name}
                className="rounded-xl p-8 flex flex-col border"
                style={{
                  background: plan.highlighted ? '#131b2e' : '#ffffff',
                  color: plan.highlighted ? '#ffffff' : '#191c1e',
                  borderColor: plan.highlighted ? '#4648d4' : '#e0e3e5',
                  boxShadow: plan.highlighted ? '0 8px 40px rgba(70,72,212,0.18)' : '0 2px 12px rgba(0,0,0,0.04)',
                }}
              >
                {plan.highlighted && (
                  <div className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{background:'#4648d4',color:'#fff',width:'fit-content'}}>Most Popular</div>
                )}
                <h3 className="text-2xl font-bold mb-1" style={{fontFamily:'Geist,sans-serif'}}>{plan.name}</h3>
                <div className="mb-1">
                  <span className="text-4xl font-bold" style={{fontFamily:'Geist,sans-serif'}}>{plan.price}</span>
                  <span className="text-sm ml-2" style={{color: plan.highlighted ? '#bec6e0' : '#45464d'}}>{plan.period}</span>
                </div>
                <p className="text-sm mb-6" style={{color: plan.highlighted ? '#bec6e0' : '#45464d'}}>{plan.desc}</p>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-base" style={{color: plan.highlighted ? '#4cd7f6' : '#4648d4', fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className="w-full py-3 rounded-full text-sm font-bold tracking-wide text-center block transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: plan.highlighted ? '#4648d4' : '#000',
                    color: '#ffffff',
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 mx-auto" style={{maxWidth:'800px'}}>
          <h2 className="text-3xl font-bold text-center mb-12" style={{fontFamily:'Geist,sans-serif',color:'#000'}}>Frequently Asked Questions</h2>
          {[{q:'Is there a free trial?',a:'Yes, the Starter plan is free forever. You can upgrade at any time.'},{q:'Can I change plans?',a:'Absolutely. You can upgrade or downgrade at any time with prorated billing.'},{q:'What payment methods do you accept?',a:'We accept all major credit cards and ACH bank transfers for annual contracts.'},{q:'Is my data secure?',a:'Yes. All data is encrypted at rest and in transit. We are SOC 2 Type II compliant.'}].map(faq=>(
            <details key={faq.q} className="border-b border-[#c6c6cd]/50 py-4 group cursor-pointer">
              <summary className="text-base font-semibold text-[#191c1e] flex justify-between items-center" style={{fontFamily:'Geist,sans-serif',listStyle:'none'}}>
                {faq.q}
                <span className="material-symbols-outlined text-[#45464d] group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <p className="text-[#45464d] text-sm mt-3">{faq.a}</p>
            </details>
          ))}
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
