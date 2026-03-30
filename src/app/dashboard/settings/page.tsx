"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Unable to open billing portal");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-8">
        Account Settings
      </h1>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm p-8 mb-8">
        <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
          <Icon name="credit_card" className="text-primary" />
          Subscription & Billing
        </h2>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-surface-container-low p-6 rounded-lg border border-outline-variant/30">
          <div>
            <p className="font-label font-bold text-xs tracking-widest uppercase text-on-surface-variant mb-1">Current Plan</p>
            <h3 className="text-2xl font-bold text-on-surface">Scholar Starter (Free)</h3>
            <p className="text-sm text-on-surface-variant mt-2 max-w-md">
              You are currently on the free tier. Upgrade to Professional to unlock premium templates, custom domains, and unlimited portfolios.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <a 
              href="/pricing"
              className="px-6 py-3 gradient-primary text-white font-label font-bold text-sm tracking-widest uppercase rounded-lg shadow-md hover:shadow-lg transition-all text-center"
            >
              Upgrade Plan
            </a>
            <button 
              onClick={handleManageBilling}
              disabled={loading}
              className="px-6 py-3 bg-surface-container-highest text-on-surface font-label font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-surface-variant transition-colors disabled:opacity-50 text-center"
            >
              {loading ? "Loading..." : "Manage Billing"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm p-8">
        <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
          <Icon name="person" className="text-tertiary" />
          Profile Details
        </h2>
        <p className="text-on-surface-variant text-sm mb-6">Manage your public scholarly profile information from the dashboard settings.</p>
        <div className="space-y-4">
          <button className="px-6 py-3 bg-surface-container-highest text-on-surface font-label font-bold text-xs tracking-widest uppercase rounded-lg hover:bg-surface-variant transition-colors">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
