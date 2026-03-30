"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ContentTab from "@/components/builder/ContentTab";
import StyleTab from "@/components/builder/StyleTab";
import ImageTab from "@/components/builder/ImageTab";
import LivePreview from "@/components/builder/LivePreview";
import Icon from "@/components/ui/Icon";
import type { PortfolioCustomizations } from "@/lib/portfolio";

interface EditablePortfolio {
  id: string;
  title: string;
  isPublished: boolean;
  customizations: PortfolioCustomizations;
  template: {
    id: string;
    name: string;
    category: string;
  };
}

export default function PortfolioEditorPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"content" | "style" | "image">("content");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  
  const [portfolio, setPortfolio] = useState<EditablePortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const portfolioId = typeof params.id === "string" ? params.id : "";
  const tabs: Array<{ id: "content" | "style" | "image"; icon: string; label: string }> = [
    { id: "content", icon: "edit_document", label: "Content" },
    { id: "style", icon: "palette", label: "Style" },
    { id: "image", icon: "image", label: "Images" },
  ];

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch(`/api/portfolios/${portfolioId}`);
        if (!res.ok) throw new Error("Not found");
        const data = (await res.json()) as EditablePortfolio;
        setPortfolio(data);
      } catch (error) {
        console.error(error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    if (portfolioId) fetchPortfolio();
  }, [portfolioId, router]);

  // Simple auto-save implementation
  const savePortfolio = useCallback(async (data: EditablePortfolio) => {
    setSaving(true);
    try {
      await fetch(`/api/portfolios/${portfolioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          customizations: data.customizations,
          title: data.title,
          progress: calculateProgress(data.customizations)
        }),
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setSaving(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    if (!portfolio || loading) return;
    const timer = setTimeout(() => {
      savePortfolio(portfolio);
    }, 2000);
    return () => clearTimeout(timer);
  }, [portfolio, loading, savePortfolio]);

  const calculateProgress = (customizations: PortfolioCustomizations) => {
    // Simple logic for progress calculation based on filled fields
    let filled = 0;
    const total = 3;
    if (customizations?.content?.name) filled++;
    if (customizations?.content?.bio) filled++;
    if (customizations?.images?.avatar) filled++;
    return Math.round((filled / total) * 100);
  };

  const updateCustomizations = (
    section: keyof PortfolioCustomizations,
    data: PortfolioCustomizations[keyof PortfolioCustomizations]
  ) => {
    setPortfolio((prev) => (prev ? ({
      ...prev,
      customizations: {
        ...prev.customizations,
        [section]: data
      }
    }) : prev));
  };

  const exportPortfolio = () => {
    if (!portfolioId) {
      return;
    }

    window.location.href = `/api/portfolios/${portfolioId}/export`;
  };

  const togglePublish = async () => {
    if (!portfolioId || !portfolio) {
      return;
    }

    setPublishing(true);
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/publish`, { method: "POST" });
      if (!response.ok) {
        throw new Error("Unable to update publish state");
      }

      const updated = (await response.json()) as EditablePortfolio;
      setPortfolio((prev) => (prev ? { ...prev, isPublished: updated.isPublished } : prev));
    } catch (error) {
      console.error("Failed to publish", error);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-on-surface-variant">Loading editor...</div>;
  if (!portfolio) return null;

  return (
    <div className="flex flex-col h-screen bg-surface overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b border-outline-variant/20 bg-white px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-on-surface-variant hover:text-primary transition-colors flex items-center">
            <Icon name="arrow_back" className="text-xl" />
          </Link>
          <input 
            type="text" 
            value={portfolio.title}
            onChange={(e) => setPortfolio({...portfolio, title: e.target.value})}
            className="font-headline font-bold text-lg bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
          />
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex bg-surface-container-low rounded-md p-1">
            {(["desktop", "tablet", "mobile"] as const).map(d => (
              <button 
                key={d}
                onClick={() => setDevice(d)}
                type="button"
                className={`p-1.5 rounded flex items-center justify-center transition-colors ${device === d ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <Icon name={d === 'desktop' ? 'desktop_mac' : d === 'tablet' ? 'tablet_mac' : 'smartphone'} className="text-sm" />
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
            {saving ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span> Saving...</>
            ) : lastSaved ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Saved at {lastSaved.toLocaleTimeString()}</>
            ) : (
              <><span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span> Ready to save</>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={exportPortfolio}
              className="px-4 py-2 bg-surface-container-highest text-on-surface text-xs font-bold uppercase tracking-widest rounded-md hover:bg-surface-container-high transition-colors"
            >
              Export ZIP
            </button>
            <button
              onClick={togglePublish}
              disabled={publishing}
              className="px-4 py-2 signature-cta text-white text-xs font-bold uppercase tracking-widest rounded-md shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {publishing ? "Updating..." : portfolio.isPublished ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Sidebar */}
        <aside className="w-[350px] bg-white border-r border-outline-variant/20 flex flex-col shrink-0 relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          {/* Tabs */}
          <div className="flex border-b border-outline-variant/20 p-2 gap-1 bg-surface-container-lowest">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex flex-col items-center py-2 rounded-md transition-all ${
                  activeTab === t.id 
                    ? "bg-primary/5 text-primary" 
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                <Icon name={t.icon} className="mb-1 text-[20px]" />
                <span className="text-[10px] font-bold tracking-widest uppercase">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            {activeTab === "content" && (
               <ContentTab 
                 data={portfolio.customizations?.content || {}} 
                 onChange={(data) => updateCustomizations("content", data)} 
               />
            )}
            {activeTab === "style" && (
               <StyleTab 
                 data={portfolio.customizations?.styles || {}} 
                 onChange={(data) => updateCustomizations("styles", data)} 
                />
            )}
            {activeTab === "image" && (
               <ImageTab 
                 data={portfolio.customizations?.images || {}} 
                 onChange={(data) => updateCustomizations("images", data)} 
                />
            )}
          </div>
        </aside>

        {/* Live Preview Area */}
        <main className="flex-1 bg-surface-container-low flex flex-col items-center justify-center p-8 overflow-hidden relative">
          <div className="absolute inset-0 pattern-dots text-primary/5 opacity-50 z-0 bg-[length:24px_24px] pointer-events-none" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)' }}></div>
          
          <div className={`relative z-10 transition-all duration-500 ease-in-out bg-white shadow-2xl overflow-hidden rounded-md border border-outline-variant/20 flex flex-col ${
            device === "desktop" ? "w-full max-w-[1200px] h-full" : 
            device === "tablet" ? "w-[768px] h-[1024px] max-h-full" : 
            "w-[375px] h-[812px] max-h-full rounded-[2rem] border-[8px] border-slate-800 shadow-[0_0_0_2px_rgba(0,0,0,0.1)]"
          }`}>
             {/* Browser Chrome for Desktop/Tablet */}
            {device !== "mobile" && (
              <div className="h-10 bg-surface-container-lowest border-b border-outline-variant/20 flex items-center px-4 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-error"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </div>
                <div className="mx-auto bg-surface-container-low text-on-surface-variant text-[10px] font-medium px-6 py-1 rounded-full flex items-center gap-2">
                  <Icon name="lock" className="text-xs" />
                  myportfolio.com
                </div>
              </div>
            )}
            
            <LivePreview template={portfolio.template} customizations={portfolio.customizations} device={device} />
          </div>
        </main>
      </div>
    </div>
  );
}
