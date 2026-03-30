"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreatePortfolioButtonProps {
  templateId: string;
  defaultTitle: string;
}

export default function CreatePortfolioButton({
  templateId,
  defaultTitle,
}: CreatePortfolioButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          title: defaultTitle,
        }),
      });

      const payload = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !payload.id) {
        throw new Error(payload.error || "Unable to create portfolio");
      }

      router.push(`/dashboard/portfolio/${payload.id}/edit`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create portfolio");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleCreate}
        disabled={loading}
        className="w-full py-3 gradient-primary text-white text-xs font-bold uppercase tracking-widest rounded-md shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all disabled:opacity-50"
      >
        {loading ? "Creating..." : "Use This Template"}
      </button>

      {error && (
        <p className="text-xs text-error font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
