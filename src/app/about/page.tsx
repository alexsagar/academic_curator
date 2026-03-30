import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import type { Metadata } from "next";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "About Us | The Academic Curator",
  description: "Empowering students to showcase their academic achievements with editorial-grade digital portfolios.",
};

const team = [
  { name: "Julian Thorne", role: "Founder & CEO", bio: "Ex-Academic Director with a passion for digital storytelling and student advocacy." },
  { name: "Elena Rodriguez", role: "Head of Design", bio: "Award-winning editorial designer bringing high-fashion aesthetics to educational tools." },
  { name: "Marcus Chen", role: "CTO", bio: "Full-stack architect focused on building scalable, accessible web experiences for all." },
  { name: "Sarah Jenkins", role: "Head of Growth", bio: "Expert in student career pathways and partnership development with global universities." },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20">
        {/* Mission Statement Hero */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">
                Our Mission
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold font-headline tracking-tighter text-on-surface mb-8 leading-[1.1]">
                Empowering students to showcase their{" "}
                <span className="text-primary">academic achievements</span>.
              </h1>
              <p className="text-xl text-on-surface-variant leading-relaxed max-w-2xl">
                We believe that every academic journey is a masterpiece in
                progress. The Academic Curator provides the high-end digital
                stage students deserve to transition from learners to leaders.
              </p>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/5] bg-surface-container-low rounded-xl overflow-hidden shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary-container/10 flex items-center justify-center">
                  <Icon name="school" className="text-8xl text-primary/20" />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-surface-container-lowest p-8 shadow-xl hidden md:block max-w-[240px]">
                <p className="text-primary font-bold text-4xl font-headline mb-1">15k+</p>
                <p className="text-on-surface-variant text-sm font-medium">
                  Portfolios curated by students globally this year.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="bg-surface-container-low py-24 mb-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <div>
                <h2 className="text-3xl font-bold font-headline mb-6">Our Vision</h2>
                <div className="space-y-6 text-on-surface-variant leading-relaxed">
                  <p>
                    Founded in 2022, The Academic Curator emerged from a simple
                    observation: student work is often hidden behind login screens
                    or trapped in uninspiring PDFs. We set out to build a platform
                    that treats a thesis, a design project, or a code repository
                    with the same reverence as a professional portfolio.
                  </p>
                  <p>
                    Our vision is to bridge the gap between academia and the
                    professional world, providing a seamless transition through
                    beautiful, authoritative storytelling.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="grid grid-cols-1 gap-8">
                  {[
                    { icon: "palette", title: "Curated Aesthetics", desc: "Every template is designed with editorial precision, ensuring your work remains the focus." },
                    { icon: "auto_awesome", title: "Effortless Creation", desc: "Automated project syncing and intuitive drag-and-drop interfaces for busy students." },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <Icon name={item.icon} className="text-3xl text-primary" />
                      <div>
                        <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                        <p className="text-on-surface-variant text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="mb-16">
            <h2 className="text-4xl font-extrabold font-headline tracking-tight mb-4">
              The Minds Behind the Curation
            </h2>
            <p className="text-on-surface-variant max-w-2xl">
              A diverse group of designers, educators, and engineers dedicated to
              redefining the student digital presence.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {team.map((member) => (
              <div key={member.name} className="group">
                <div className="aspect-square bg-surface-container-high mb-6 overflow-hidden rounded-lg">
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <Icon name="person" className="text-5xl text-on-surface-variant/30" />
                  </div>
                </div>
                <h3 className="text-xl font-bold font-headline mb-1">{member.name}</h3>
                <p className="text-primary font-medium text-xs tracking-widest uppercase mb-3">{member.role}</p>
                <p className="text-on-surface-variant text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="signature-cta rounded-2xl p-12 lg:p-20 text-center text-white">
            <h2 className="text-4xl lg:text-5xl font-extrabold font-headline mb-6 tracking-tight">
              Ready to curate your future?
            </h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Join the community of students who are turning their hard work into
              career-defining opportunities.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup" className="bg-surface-container-lowest text-primary px-8 py-4 rounded-md font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform">
                Get Started for Free
              </Link>
              <Link href="/templates" className="border border-white/30 text-white px-8 py-4 rounded-md font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-colors">
                View Templates
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
