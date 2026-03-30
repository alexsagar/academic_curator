"use client";

import type { PortfolioContent } from "@/lib/portfolio";
import Icon from "@/components/ui/Icon";

interface ContentTabProps {
  data: PortfolioContent;
  onChange: (data: PortfolioContent) => void;
}

export default function ContentTab({ data, onChange }: ContentTabProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-headline font-bold mb-4 text-on-surface">Basic Info</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Name</label>
            <input 
              name="name"
              value={data.name || ""} 
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              className="w-full text-sm py-2 px-3 bg-surface-container-lowest border border-outline-variant/30 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Professional Title</label>
            <input 
              name="title"
              value={data.title || ""} 
              onChange={handleChange}
              placeholder="e.g. Computer Science Researcher"
              className="w-full text-sm py-2 px-3 bg-surface-container-lowest border border-outline-variant/30 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Bio</label>
            <textarea 
              name="bio"
              value={data.bio || ""} 
              onChange={handleChange}
              placeholder="Write a short biography..."
              rows={4}
              className="w-full text-sm py-2 px-3 bg-surface-container-lowest border border-outline-variant/30 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-outline-variant/20 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-headline font-bold text-on-surface">Experience</h3>
          <button className="text-primary hover:text-primary-container p-1 rounded transition-colors" type="button">
            <Icon name="add" className="text-[18px]" />
          </button>
        </div>
        <div className="text-center p-6 border border-dashed border-outline-variant/40 rounded-lg bg-surface-container-lowest">
          <p className="text-xs text-on-surface-variant">No experiences added yet.</p>
        </div>
      </div>
      
      <div className="border-t border-outline-variant/20 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-headline font-bold text-on-surface">Projects</h3>
          <button className="text-primary hover:text-primary-container p-1 rounded transition-colors" type="button">
            <Icon name="add" className="text-[18px]" />
          </button>
        </div>
        <div className="text-center p-6 border border-dashed border-outline-variant/40 rounded-lg bg-surface-container-lowest">
          <p className="text-xs text-on-surface-variant">No projects added yet.</p>
        </div>
      </div>
    </div>
  );
}
