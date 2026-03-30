"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useState } from "react";
import { getPriceIdForTier } from "@/lib/subscriptions";
import Icon from "@/components/ui/Icon";

const faqs = [
  { q: "Can I change my plan later?", a: "Yes, you can upgrade or downgrade your plan at any time from your account settings. If you upgrade, the new features will be available immediately and your billing will be adjusted proportionally." },
  { q: "Do you offer student discounts?", a: "Our Scholar Starter plan is completely free for all students. We also offer special institutional pricing for university departments." },
  { q: "How does billing work for teams?", a: "Institutional plans are billed annually based on the number of student licenses. Contact our sales team for a custom quote." },
  { q: "What happens if I cancel?", a: "Your data is preserved for 30 days after cancellation. You can reactivate your account and access all your portfolios during this period." },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [loading, setLoading] = useState(false);
  const professionalPriceId = getPriceIdForTier("PROFESSIONAL");

  const handleUpgrade = async (priceId: string, tier: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === "Unauthorized") {
        window.location.href = "/login?callbackUrl=/pricing";
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20">
        {/* Header */}
        <header className="max-w-4xl mx-auto text-center px-6 mb-20">
          <h1 className="text-5xl md:text-6xl font-headline font-extrabold text-on-background tracking-tight mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-on-surface-variant leading-relaxed font-body">
            Whether you&apos;re presenting your first project or scaling a
            departmental archive, there&apos;s a plan crafted for your academic journey.
          </p>
        </header>

        {/* Pricing Tiers */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Scholar Starter */}
            <div className="flex flex-col bg-surface-container-low p-8 rounded-xl transition-all duration-300 hover:translate-y-[-4px]">
              <div className="mb-8">
                <h3 className="text-on-surface-variant font-label text-xs font-bold tracking-[0.1em] uppercase mb-4">Scholar Starter</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-headline font-extrabold">$0</span>
                  <span className="text-on-surface-variant font-body">/month</span>
                </div>
                <p className="text-on-surface-variant text-sm mt-4">For students just getting started on their digital presence.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {["Basic Academic Templates", "1 Active Portfolio", "Scholar Subdomain"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-on-surface">
                    <Icon name="check_circle" className="text-[18px] text-primary" />
                    {f}
                  </li>
                ))}
                <li className="flex items-center gap-3 text-sm text-on-surface opacity-40">
                  <Icon name="cancel" className="text-[18px]" />
                  Custom Domain
                </li>
              </ul>
              <Link href="/signup" className="w-full py-3 bg-surface-container-highest text-on-surface font-label text-sm font-bold rounded-md hover:bg-surface-variant transition-colors tracking-wider uppercase text-center block">
                Get Started
              </Link>
            </div>

            {/* Professional Curator */}
            <div className="flex flex-col bg-surface-container-lowest p-8 rounded-xl relative shadow-xl shadow-primary/5 border border-primary/10 transition-all duration-300 hover:translate-y-[-4px] ring-2 ring-primary">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 gradient-primary text-white text-[10px] font-bold px-4 py-1 rounded-full tracking-widest uppercase shadow-md">
                Recommended
              </div>
              <div className="mb-8">
                <h3 className="text-primary font-label text-xs font-bold tracking-[0.1em] uppercase mb-4">Professional Curator</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-headline font-extrabold text-on-background">$12</span>
                  <span className="text-on-surface-variant font-body">/month</span>
                </div>
                <p className="text-on-surface-variant text-sm mt-4">For ambitious students building a lasting academic legacy.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {["All Premium Templates", "Unlimited Portfolios", "Custom Domain Integration", "Advanced Analytics", "Priority Support"].map((f, i) => (
                  <li key={f} className={`flex items-center gap-3 text-sm text-on-surface ${i === 2 ? "font-semibold text-primary" : ""}`}>
                    <Icon name="verified" filled className="text-[18px] text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => professionalPriceId && handleUpgrade(professionalPriceId, "PROFESSIONAL")}
                disabled={loading || !professionalPriceId}
                className="w-full py-3 gradient-primary text-white font-label text-sm font-bold rounded-md hover:scale-[0.98] transition-transform tracking-wider uppercase text-center block disabled:opacity-50"
              >
                {!professionalPriceId ? "Pricing Unavailable" : loading ? "Processing..." : "Choose Professional"}
              </button>
            </div>

            {/* Institutional */}
            <div className="flex flex-col bg-surface-container-low p-8 rounded-xl transition-all duration-300 hover:translate-y-[-4px]">
              <div className="mb-8">
                <h3 className="text-on-surface-variant font-label text-xs font-bold tracking-[0.1em] uppercase mb-4">Institutional Excellence</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-headline font-extrabold text-on-background">Custom</span>
                </div>
                <p className="text-on-surface-variant text-sm mt-4">Scalable solutions for universities and research departments.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  { icon: "groups", text: "Bulk Student Licenses" },
                  { icon: "vpn_key", text: "SSO & SAML Authentication" },
                  { icon: "palette", text: "Institutional Branding" },
                  { icon: "headset_mic", text: "Dedicated Account Manager" },
                ].map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-sm text-on-surface">
                    <Icon name={f.icon} className="text-[18px] text-primary" />
                    {f.text}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 bg-surface-container-highest text-on-surface font-label text-sm font-bold rounded-md hover:bg-surface-variant transition-colors tracking-wider uppercase">
                Contact Sales
              </button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 mb-32">
          <h2 className="text-3xl font-headline font-bold text-center mb-12">Common Inquiries</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-surface-container-low rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex justify-between items-center cursor-pointer hover:bg-surface-container transition-colors text-left"
                  type="button"
                >
                  <span className="font-headline font-semibold text-on-surface">{faq.q}</span>
                  <Icon name="expand_more" className={`text-on-surface-variant transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-on-surface-variant text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6">
          <div className="gradient-primary rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-white mb-6 relative z-10">Ready to build your legacy?</h2>
            <p className="text-primary-fixed text-lg mb-10 max-w-2xl mx-auto relative z-10 opacity-90">
              Join thousands of students who are already curating their academic achievements with professional precision.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center relative z-10">
              <Link href="/signup" className="px-10 py-4 bg-surface-container-lowest text-primary font-label font-bold text-sm tracking-widest uppercase rounded-md shadow-lg hover:scale-105 transition-transform">
                Get Started for Free
              </Link>
              <button className="px-10 py-4 border border-white/30 text-white font-label font-bold text-sm tracking-widest uppercase rounded-md hover:bg-white/10 transition-colors">
                Book a Demo
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
