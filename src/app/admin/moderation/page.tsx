"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending");

  const queue = [
    { id: "req_1", type: "Portfolio Review", user: "John Doe", title: "Structural Engineering Thesis", status: "pending", date: "2 hours ago" },
    { id: "req_2", type: "Flagged Content", user: "Jane Smith", title: "Inappropriate Images Reported", status: "pending", date: "5 hours ago", severity: "high" },
    { id: "req_3", type: "Template Approval", user: "Agency X", title: "Minimalist Developer Theme", status: "pending", date: "1 day ago" },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 text-3xl font-headline font-extrabold tracking-tight text-on-surface">Moderation Queue</h1>
          <p className="text-sm text-on-surface-variant">
            Review flagged content, approve template submissions, and enforce platform guidelines.
          </p>
        </div>
      </div>

      <div className="mb-6 flex gap-4 border-b border-outline-variant/20">
        <button
          onClick={() => setActiveTab("pending")}
          className={`relative pb-3 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === "pending" ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
          type="button"
        >
          Requires Action
          <span className="ml-2 rounded-full bg-error px-1.5 py-0.5 text-[10px] text-white">3</span>
          {activeTab === "pending" && <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-t-full bg-primary"></span>}
        </button>
        <button
          onClick={() => setActiveTab("resolved")}
          className={`relative pb-3 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === "resolved" ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
          type="button"
        >
          Resolved Log
          {activeTab === "resolved" && <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-t-full bg-primary"></span>}
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === "pending" ? (
          queue.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-6 rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm transition-all hover:shadow-md md:flex-row md:items-center"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex shrink-0 items-center justify-center rounded-lg p-3 ${
                    item.severity === "high"
                      ? "bg-error-container text-error"
                      : item.type.includes("Template")
                        ? "bg-primary-container text-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  <Icon
                    name={item.severity === "high" ? "warning" : item.type.includes("Template") ? "code" : "article"}
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{item.type}</span>
                    <span className="text-[10px] text-outline">{"•"} {item.date}</span>
                    {item.severity === "high" ? (
                      <span className="rounded-full bg-error/10 px-2 text-[10px] font-bold uppercase text-error">High Priority</span>
                    ) : null}
                  </div>
                  <h3 className="text-base font-headline font-bold text-on-surface">{item.title}</h3>
                  <p className="text-sm text-on-surface-variant">
                    Submitted by: <span className="font-semibold text-on-surface">{item.user}</span>
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <button className="rounded bg-surface-container-low px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-container-high" type="button">
                  Review Case
                </button>
                <div className="hidden h-8 w-px bg-outline-variant/30 md:block"></div>
                <button className="rounded p-2 text-emerald-600 transition-colors hover:bg-emerald-50" title="Approve/Resolve" type="button">
                  <Icon name="check_circle" />
                </button>
                <button className="rounded p-2 text-error transition-colors hover:bg-error-container/50" title="Reject/Remove" type="button">
                  <Icon name="cancel" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-outline-variant/30 bg-surface-container-lowest p-12 text-center">
            <p className="text-on-surface-variant">No resolved items to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}
