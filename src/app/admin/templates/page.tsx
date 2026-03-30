"use client";

import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import LoadingIndicator from "@/components/ui/LoadingIndicator";

interface Template {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
  isPremium: boolean;
  portfolios: Array<{ id: string }>;
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/templates");
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const toggleTemplate = async (id: string, field: "isActive" | "isPremium", currentValue: boolean) => {
    try {
      await fetch(`/api/admin/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentValue }),
      });
      void fetchTemplates();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
            Template Management
          </h1>
          <p className="text-on-surface-variant text-sm">
            Upload new designs and manage existing portfolio templates.
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 signature-cta text-white font-label font-bold text-sm tracking-wider uppercase rounded-md shadow-md hover:scale-105 transition-transform">
          <Icon name="add" className="text-[20px]" />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center">
            <LoadingIndicator label="Loading templates..." />
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-surface-container-lowest border border-dashed border-outline-variant/30 rounded-xl">
            <p className="text-on-surface-variant mb-4">No templates available. Create your first one to get started.</p>
            <button className="px-6 py-2 bg-surface-container-highest font-bold text-xs uppercase tracking-widest rounded text-on-surface hover:bg-surface-container-high transition-colors">
              Add Template
            </button>
          </div>
        ) : templates.map((t) => (
          <div key={t.id} className="group flex h-full flex-col rounded-xl border border-outline-variant/20 bg-surface-container-lowest overflow-hidden shadow-sm">
            <div className="aspect-[16/9] bg-surface-container w-full relative">
              <div className="absolute inset-0 bg-gradient-to-br from-surface-container to-surface-container-lowest flex items-center justify-center">
                <Icon name="design_services" className="text-5xl text-on-surface-variant/20 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="bg-primary px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white tracking-widest">{t.category}</span>
                {t.isPremium && (
                  <span className="bg-tertiary-container px-2 py-0.5 rounded text-[10px] uppercase font-bold text-on-tertiary-container tracking-widest flex items-center gap-1">
                    <Icon name="star" filled className="text-[10px]" /> Premium
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-1 flex-col p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-headline font-bold text-lg leading-tight mb-1">{t.name}</h3>
                  <p className="text-xs text-on-surface-variant">{t.portfolios?.length || 0} Portfolios built</p>
                </div>
                <div className="flex bg-surface-container-low rounded p-1">
                  <button 
                    onClick={() => toggleTemplate(t.id, "isActive", t.isActive)}
                    className={`p-1.5 rounded transition-colors ${t.isActive ? 'text-primary' : 'text-outline hover:text-on-surface'}`}
                    title={t.isActive ? "Hide Template" : "Publish Template"}
                  >
                    <Icon name={t.isActive ? "visibility" : "visibility_off"} className="text-[18px]" />
                  </button>
                  <button className="p-1.5 rounded text-outline hover:text-on-surface transition-colors" title="Edit Template">
                    <Icon name="edit" className="text-[18px]" />
                  </button>
                </div>
              </div>

              <div className="mt-auto border-t border-outline-variant/10 pt-4 flex gap-2">
                <button 
                  onClick={() => toggleTemplate(t.id, "isPremium", t.isPremium)}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all border ${
                    t.isPremium 
                      ? 'bg-tertiary-container/20 border-tertiary-container text-tertiary' 
                      : 'bg-transparent border-outline-variant/30 text-outline hover:bg-surface-container-lowest hover:border-outline'
                  }`}
                >
                  {t.isPremium ? "Make Free" : "Make Premium"}
                </button>
                <button className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded bg-error/10 text-error hover:bg-error/20 transition-all border border-transparent">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
