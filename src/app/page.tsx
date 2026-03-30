import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden px-6 lg:px-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="z-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold tracking-widest uppercase mb-6">
                Elevate Your Narrative
              </span>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-headline font-extrabold tracking-tight text-on-surface leading-[1.1] mb-8">
                Your Future, <br />
                <span className="text-primary italic">Curated.</span>
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed">
                Transform your academic journey into a professional visual
                gallery. The high-end portfolio builder designed specifically for
                the modern student.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="px-8 py-4 signature-cta text-white font-label font-bold tracking-wider uppercase rounded-md shadow-xl shadow-primary/25 hover:opacity-90 transition-all text-center"
                >
                  Start Building Your Portfolio
                </Link>
                <Link
                  href="/templates"
                  className="px-8 py-4 bg-surface-container-highest text-on-surface font-label font-bold tracking-wider uppercase rounded-md hover:bg-surface-container-high transition-all text-center"
                >
                  View Examples
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl rotate-3 translate-x-12 translate-y-6 bg-surface-container-low">
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary-container/20 flex items-center justify-center">
                  <Icon name="auto_awesome" className="text-9xl text-primary/30" />
                </div>
              </div>
              <div className="absolute inset-0 aspect-[4/5] rounded-xl overflow-hidden shadow-2xl -rotate-6 bg-surface-container-low p-8 flex flex-col justify-end border-white/20 border-8 backdrop-blur-sm -translate-x-12 -translate-y-6">
                <div className="space-y-4">
                  <div className="h-2 w-12 bg-primary rounded-full"></div>
                  <div className="h-8 w-48 bg-on-surface rounded-sm"></div>
                  <div className="h-4 w-full bg-on-surface-variant/20 rounded-sm"></div>
                  <div className="h-4 w-2/3 bg-on-surface-variant/20 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-32 bg-surface-container-low" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6">
                Master Your Presentation
              </h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">
                Three simple steps to transition from student projects to a
                professional legacy.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: "person_add",
                  title: "Create Account",
                  desc: "Secure your unique domain and set up your student profile in seconds. Your journey begins with identity.",
                },
                {
                  icon: "dashboard_customize",
                  title: "Pick Template",
                  desc: "Select from our editorial-grade library. Each template is engineered for impact and visual storytelling.",
                },
                {
                  icon: "public",
                  title: "Share with the World",
                  desc: "Publish your site with one click. High-speed global hosting ensures your work loads instantly for recruiters.",
                },
              ].map((step) => (
                <div
                  key={step.title}
                  className="flex h-full flex-col rounded-xl bg-surface-container-lowest p-10 ghost-border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="w-14 h-14 rounded-full signature-cta flex items-center justify-center text-white mb-8">
                    <Icon name={step.icon} className="text-3xl" />
                  </div>
                  <h3 className="text-xl font-headline font-bold mb-4">
                    {step.title}
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-32 bg-surface" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div className="max-w-xl">
                <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6">
                  Built for Excellence
                </h2>
                <p className="text-on-surface-variant">
                  We provide the architectural foundation; you provide the
                  vision. Our features prioritize the content above all else.
                </p>
              </div>
              <div className="flex gap-2 pb-2">
                <span className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-full">
                  Visionary
                </span>
                <span className="px-4 py-2 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-full">
                  Mobile-First
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 grid-rows-2 gap-6 h-auto md:h-[800px]">
              {/* Editorial Customization */}
              <div className="md:col-span-8 md:row-span-1 bg-surface-container-low rounded-xl overflow-hidden relative group p-12 flex flex-col justify-between">
                <div className="relative z-10">
                  <h3 className="text-3xl font-headline font-bold mb-4">
                    Editorial Customization
                  </h3>
                  <p className="text-on-surface-variant max-w-sm">
                    No rigid boxes. Use our intuitive canvas to drag, drop, and
                    scale your achievements with precision and style.
                  </p>
                </div>
                <div className="absolute bottom-0 right-0 w-2/3 h-2/3 translate-y-12 translate-x-12 opacity-20 group-hover:opacity-40 transition-opacity">
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary-container rounded-tl-3xl"></div>
                </div>
              </div>

              {/* Mobile First */}
              <div className="md:col-span-4 md:row-span-2 bg-primary-container text-on-primary-container rounded-xl p-12 flex flex-col justify-end relative overflow-hidden">
                <div className="absolute top-12 left-12 w-full">
                  <Icon name="smartphone" className="text-8xl opacity-20" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-headline font-bold mb-4">
                    Mobile First <br />
                    Philosophy
                  </h3>
                  <p className="opacity-80 leading-relaxed">
                    Your portfolio will look stunning whether viewed on a
                    desktop in a boardroom or a smartphone on the train.
                  </p>
                </div>
              </div>

              {/* Pro Templates */}
              <div className="md:col-span-4 md:row-span-1 bg-surface-container-highest rounded-xl p-12 flex flex-col justify-between border-t border-white/10">
                <div className="w-12 h-12 bg-surface flex items-center justify-center rounded-lg shadow-sm mb-6">
                  <Icon name="auto_awesome" className="text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-headline font-bold mb-2">
                    Pro Templates
                  </h3>
                  <p className="text-on-surface-variant text-sm">
                    Curated by top design agencies to ensure your work meets
                    industry standards.
                  </p>
                </div>
              </div>

              {/* Insights */}
              <div className="md:col-span-4 md:row-span-1 bg-on-surface text-surface rounded-xl p-12 flex items-center justify-between group overflow-hidden">
                <div>
                  <h3 className="text-2xl font-headline font-bold mb-2">
                    Insights
                  </h3>
                  <p className="text-surface/60 text-sm">
                    Track who is viewing your work and which projects are most
                    popular.
                  </p>
                </div>
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform">
                  <Icon name="insights" className="text-4xl text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Templates */}
        <section className="py-32 bg-surface-container-lowest" id="templates">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-16">
              <h2 className="text-4xl font-headline font-bold">
                Featured Layouts
              </h2>
              <Link
                href="/templates"
                className="text-primary font-bold hover:underline flex items-center gap-2"
              >
                Browse all templates{" "}
                <Icon name="arrow_forward" />
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar mb-12">
              {[
                "All Disciplines",
                "Visual Arts",
                "Engineering",
                "Business & Strategy",
                "Humanities",
                "Medical Science",
              ].map((cat, i) => (
                <button
                  key={cat}
                  className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    i === 0
                      ? "bg-primary text-white"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[
                {
                  title: "The Minimalist Architect",
                  desc: "Perfect for showcasing structured data, blueprints, and process-heavy projects.",
                },
                {
                  title: "Digital Journal",
                  desc: "Ideal for storytellers, researchers, and long-form case studies.",
                },
              ].map((template) => (
                <div key={template.title} className="group">
                  <div className="aspect-video bg-surface-container-low rounded-xl mb-8 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-surface-container-high to-surface-container flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <Icon name="web" className="text-6xl text-on-surface-variant/30" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-headline font-bold mb-2">
                    {template.title}
                  </h4>
                  <p className="text-on-surface-variant">{template.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-6xl font-headline font-extrabold mb-8 tracking-tighter">
              Ready to define your legacy?
            </h2>
            <p className="text-xl opacity-90 mb-12 font-light">
              Join over 10,000+ students from top universities globally.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/signup"
                className="px-12 py-5 bg-white text-primary font-bold tracking-widest uppercase rounded-md shadow-2xl hover:bg-surface-bright transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/templates"
                className="px-12 py-5 border border-white/30 text-white font-bold tracking-widest uppercase rounded-md hover:bg-white/10 transition-colors"
              >
                View Demo
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
