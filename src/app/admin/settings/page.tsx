"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";

const DEFAULT_SETTINGS = {
  allowRegistration: true,
  requireEmailVerification: false,
  autoApprovePortfolios: true,
  maintenanceMode: false,
  maxFreePortfolios: 1,
  defaultLanguage: "en",
  supportEmail: "support@academiccurator.com",
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const mergeSettings = (value: unknown) => {
    if (!value || typeof value !== "object") {
      return DEFAULT_SETTINGS;
    }

    const incoming = value as Record<string, unknown>;
    return {
      allowRegistration:
        typeof incoming.allowRegistration === "boolean"
          ? incoming.allowRegistration
          : DEFAULT_SETTINGS.allowRegistration,
      requireEmailVerification:
        typeof incoming.requireEmailVerification === "boolean"
          ? incoming.requireEmailVerification
          : DEFAULT_SETTINGS.requireEmailVerification,
      autoApprovePortfolios:
        typeof incoming.autoApprovePortfolios === "boolean"
          ? incoming.autoApprovePortfolios
          : DEFAULT_SETTINGS.autoApprovePortfolios,
      maintenanceMode:
        typeof incoming.maintenanceMode === "boolean"
          ? incoming.maintenanceMode
          : DEFAULT_SETTINGS.maintenanceMode,
      maxFreePortfolios:
        typeof incoming.maxFreePortfolios === "number" && Number.isFinite(incoming.maxFreePortfolios)
          ? Math.min(10, Math.max(1, Math.trunc(incoming.maxFreePortfolios)))
          : DEFAULT_SETTINGS.maxFreePortfolios,
      defaultLanguage:
        typeof incoming.defaultLanguage === "string" && incoming.defaultLanguage.trim()
          ? incoming.defaultLanguage.trim()
          : DEFAULT_SETTINGS.defaultLanguage,
      supportEmail:
        typeof incoming.supportEmail === "string" && incoming.supportEmail.trim()
          ? incoming.supportEmail.trim()
          : DEFAULT_SETTINGS.supportEmail,
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Unable to save settings");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (!response.ok) {
          throw new Error("Unable to load settings");
        }

        const payload = await response.json();
        setSettings(mergeSettings(payload));
      } catch (error) {
        console.error(error);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setInitializing(false);
      }
    };

    void fetchSettings();
  }, []);

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
            Platform Settings
          </h1>
          <p className="text-on-surface-variant text-sm">
            Configure global variables and site-wide behaviors.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* General Settings */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm p-8">
          <h2 className="text-lg font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
            <Icon name="public" className="text-primary" />
            Global Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 border border-outline-variant/30 rounded-lg bg-surface-container-low cursor-pointer hover:border-primary/50 transition-colors">
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Allow Registration</h4>
                  <p className="text-xs text-on-surface-variant">Enable new user signups</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.allowRegistration}
                  onChange={(e) => setSettings({...settings, allowRegistration: e.target.checked})}
                  className="w-5 h-5 accent-primary" 
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-outline-variant/30 rounded-lg bg-surface-container-low cursor-pointer hover:border-primary/50 transition-colors">
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Auto-Approve Portfolios</h4>
                  <p className="text-xs text-on-surface-variant">Publish without review</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.autoApprovePortfolios}
                  onChange={(e) => setSettings({...settings, autoApprovePortfolios: e.target.checked})}
                  className="w-5 h-5 accent-primary" 
                />
              </label>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 border border-error/30 bg-error-container/10 rounded-lg cursor-pointer hover:border-error transition-colors">
                <div>
                  <h4 className="font-bold text-sm text-error">Maintenance Mode</h4>
                  <p className="text-xs text-error/70">Disable public access</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                  className="w-5 h-5 accent-error" 
                />
              </label>

              <div className="p-3 border border-outline-variant/30 rounded-lg bg-surface-container-low">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Support Email</label>
                <input 
                  type="email" 
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                  className="w-full text-sm bg-transparent border-b border-outline-variant/50 pb-1 focus:border-primary outline-none transition-colors text-on-surface" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plan Limits */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm p-8">
          <h2 className="text-lg font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
            <Icon name="diamond" className="text-tertiary" />
            Usage Limits
          </h2>
          
          <div className="max-w-sm">
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Max Free Portfolios</label>
            <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/30">
              <input 
                type="number" 
                min="1" max="10"
                value={settings.maxFreePortfolios}
                onChange={(e) => setSettings({...settings, maxFreePortfolios: parseInt(e.target.value)})}
                className="bg-transparent border-none outline-none font-bold text-on-surface w-12" 
              />
              <span className="text-sm text-on-surface-variant border-l border-outline-variant/30 pl-4 w-full">Portfolios per Free Tier user</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button 
            type="submit" 
            disabled={loading || initializing}
            className="px-8 py-3 signature-cta text-white font-label font-bold text-sm tracking-widest uppercase rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {initializing ? "Loading..." : loading ? "Saving..." : "Save Configuration"}
          </button>
          
          {success && (
            <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-md flex items-center gap-2">
              <Icon name="check_circle" className="text-[18px]" />
              Settings updated successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
