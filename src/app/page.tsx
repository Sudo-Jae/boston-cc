import Image from 'next/image';
import QuoteForm from '@/components/QuoteForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071226] via-[#021018] to-black text-white antialiased">
      <header className="sticky top-0 bg-black/40 backdrop-blur border-b border-white/5">
        <div className="container mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-400 to-sky-400 flex items-center justify-center font-bold text-black">CB</div>
            <div className="font-semibold">Canopy Bots</div>
          </div>
          <nav className="hidden md:flex gap-6 text-white/80">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#process">Process</a>
            <a href="#faq">FAQ</a>
            <a href="#contact">Get a quote</a>
          </nav>
          <div className="flex items-center gap-3">
            <a className="px-4 py-2 rounded-full bg-teal-400 text-black text-sm" href="#contact">Get a Quote</a>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-6 py-12">
        <section className="grid md:grid-cols-2 items-center gap-8 py-12">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-white/5 text-teal-300 text-sm mb-4">Queensland canopy cleaning</div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">Canopy Bots — Robotic canopy & gutter cleaning across Queensland</h1>
            <p className="text-white/80 max-w-2xl mb-6">Fast, safe and compliant canopy cleaning for commercial, council and large residential sites — Brisbane, Gold Coast, Sunshine Coast and regional QLD.</p>
            <div className="flex gap-3">
              <a href="#contact" className="px-4 py-2 rounded-full bg-teal-400 text-black">Request a quote</a>
              <a href="#services" className="px-4 py-2 rounded-full bg-transparent border border-white/10">See services</a>
            </div>
            <div className="text-sm text-white/60 mt-4">Rated 5.0 • Trusted by local councils & commercial clients</div>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-[420px] rounded-xl p-6 bg-gradient-to-b from-[#052033] to-[#021018] border border-white/5 shadow-xl">
              {/* Simple visual placeholder */}
              <div className="h-56 bg-gradient-to-tr from-teal-900 to-sky-900 rounded-lg flex items-center justify-center"> 
                <div className="text-white/80">[Robot visual placeholder]</div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="py-8">
          <div className="text-sm text-white/60">Services</div>
          <h2 className="text-2xl font-semibold mt-2 mb-3">What we do</h2>
          <p className="text-white/70 mb-6">Robotic canopy and gutter cleaning for commercial, council and large residential sites — we prioritise safety, speed and documentation.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/3"> 
              <strong>Robot canopy wash</strong>
              <p className="text-white/60 mt-2">Soft-touch robotic cleaning, safe for commercial canopies.</p>
            </div>
            <div className="p-4 rounded-lg bg-white/3"> 
              <strong>Gutter & downpipe clearing</strong>
              <p className="text-white/60 mt-2">Debris extraction and flushing to prevent blockages and water damage.</p>
            </div>
            <div className="p-4 rounded-lg bg-white/3"> 
              <strong>Commercial site cleans</strong>
              <p className="text-white/60 mt-2">Fast crews with robotic reach for warehouses, carparks and large canopies.</p>
            </div>
            <div className="p-4 rounded-lg bg-white/3"> 
              <strong>Safety compliance checks</strong>
              <p className="text-white/60 mt-2">Inspection photos and compliance reporting included.</p>
            </div>
          </div>
        </section>

        <section id="about" className="py-8">
          <div className="text-sm text-white/60">About</div>
          <h2 className="text-2xl font-semibold mt-2 mb-3">Who we are</h2>
          <p className="text-white/70">Canopy Bots are a QLD-based team bringing robotic precision to canopy & gutter cleaning. We offer documented, insured and compliant services for councils and commercial sites.</p>
        </section>

        <section id="process" className="py-8">
          <div className="text-sm text-white/60">Process</div>
          <h2 className="text-2xl font-semibold mt-2 mb-3">How we work</h2>
          <p className="text-white/70">We assess, plan and deliver canopy cleans using robots and safe, eco-friendly detergents. Post-work inspection and reporting is standard.</p>
        </section>

        <section id="faq" className="py-8">
          <div className="text-sm text-white/60">FAQ</div>
          <h2 className="text-2xl font-semibold mt-2 mb-3">Frequently asked questions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/3 rounded-lg p-4"> 
              <strong>Are robots safe for commercial canopies?</strong>
              <p className="text-white/60 mt-2">Yes — soft-contact pads, controlled pressure, and trained technicians.</p>
            </div>
            <div className="bg-white/3 rounded-lg p-4"> 
              <strong>How do you price a job?</strong>
              <p className="text-white/60 mt-2">Estimates are based on canopy area, height and accessibility — request a free site quote.</p>
            </div>
          </div>
        </section>

        <section id="contact" className="py-8">
          <div className="text-sm text-white/60">Get a quote</div>
          <h2 className="text-2xl font-semibold mt-2 mb-3">Tell us about your project</h2>
          <p className="text-white/70 mb-4">We’ll reply within 1 business day. No spam, no weird lists.</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/3 p-6 rounded-lg">
              <QuoteForm endpoint={process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || 'http://localhost:3002/api/contact'} />
            </div>
            <aside className="bg-white/3 p-6 rounded-lg">
              <strong>Need priority help?</strong>
              <div className="text-white/60 mt-2">Call us: 07 5555 5555 · Mon–Fri 8am–5pm</div>
              <p className="text-white/60 mt-3">If your project is urgent include a short note above and we'll prioritise within business hours.</p>
            </aside>
          </div>
        </section>

        <footer className="mt-12 border-t border-white/5 pt-6 text-white/60 text-sm"> 
          <div className="flex justify-between items-center">
            <div>© {new Date().getFullYear()} Canopy Bots — All rights reserved</div>
            <div><a className="underline" href="#top">Back to top</a> · <a className="underline" href="#faq">FAQ</a></div>
          </div>
        </footer>
      </main>
    </div>
  );
}
