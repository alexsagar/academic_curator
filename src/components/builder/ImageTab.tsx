"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { PortfolioImages } from "@/lib/portfolio";
import Icon from "@/components/ui/Icon";
import LoadingIndicator from "@/components/ui/LoadingIndicator";

interface ImageTabProps {
  data: PortfolioImages;
  onChange: (data: PortfolioImages) => void;
}

export default function ImageTab({ data, onChange }: ImageTabProps) {
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File, kind: "avatar" | "banner") => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("kind", kind);

    const response = await fetch("/api/uploads/images", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !payload.url) {
      throw new Error(payload.error || "Upload failed");
    }

    return payload.url;
  }, []);

  const onDropAvatar = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      return;
    }

    setAvatarUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file, "avatar");
      onChange({ ...data, avatar: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  }, [data, onChange, uploadImage]);

  const onDropBanner = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      return;
    }

    setBannerUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file, "banner");
      onChange({ ...data, banner: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload banner");
    } finally {
      setBannerUploading(false);
    }
  }, [data, onChange, uploadImage]);

  const { getRootProps: getAvatarProps, getInputProps: getAvatarInputProps, isDragActive: isAvatarDrag } = useDropzone({
    onDrop: onDropAvatar,
    accept: { "image/*": [".jpeg", ".png", ".webp"] },
    maxFiles: 1,
  });

  const { getRootProps: getBannerProps, getInputProps: getBannerInputProps, isDragActive: isBannerDrag } = useDropzone({
    onDrop: onDropBanner,
    accept: { "image/*": [".jpeg", ".png", ".webp"] },
    maxFiles: 1,
  });

  return (
    <div className="space-y-8">
      {error && (
        <p className="text-sm text-error font-medium" role="alert">
          {error}
        </p>
      )}

      {/* Profile Avatar */}
      <div>
        <h3 className="text-sm font-headline font-bold mb-4 text-on-surface">Profile Avatar</h3>
        
        {data.avatar ? (
          <div className="relative group rounded-full overflow-hidden w-32 h-32 mx-auto border-4 border-surface-container-lowest shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.avatar} alt="Avatar" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => onChange({ ...data, avatar: "" })}
                className="text-white text-xs font-bold uppercase tracking-wider hover:text-error transition-colors"
                title="Remove"
              >
                <Icon name="delete" />
              </button>
            </div>
          </div>
        ) : (
          <div 
            {...getAvatarProps()} 
            className={`w-32 h-32 mx-auto rounded-full border-2 border-dashed flex flex-col flex-1 items-center justify-center p-4 text-center cursor-pointer transition-colors ${
              isAvatarDrag ? "border-primary bg-primary/5 text-primary" : "border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
            }`}
          >
            <input {...getAvatarInputProps()} />
            {avatarUploading ? (
              <LoadingIndicator iconClassName="text-3xl text-primary" className="mb-1 gap-0" label="" />
            ) : (
              <Icon name="account_circle" className="mb-1 text-3xl" />
            )}
            <span className={`text-[10px] uppercase font-bold tracking-widest leading-tight ${avatarUploading ? "animate-pulse" : ""}`}>
              {avatarUploading ? "Uploading..." : "Upload"}
              <br />
              Avatar
            </span>
          </div>
        )}
      </div>

      {/* Hero Banner */}
      <div className="border-t border-outline-variant/20 pt-6">
        <h3 className="text-sm font-headline font-bold mb-4 text-on-surface">Hero Banner</h3>
        
        {data.banner ? (
          <div className="relative group rounded-xl overflow-hidden aspect-video w-full border border-surface-container-lowest shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.banner} alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => onChange({ ...data, banner: "" })}
                className="text-white text-xs font-bold uppercase tracking-wider hover:text-error transition-colors bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm"
              >
                Remove Image
              </button>
            </div>
          </div>
        ) : (
          <div 
            {...getBannerProps()} 
            className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors ${
              isBannerDrag ? "border-primary bg-primary/5 text-primary" : "border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
            }`}
          >
            <input {...getBannerInputProps()} />
            {bannerUploading ? (
              <LoadingIndicator iconClassName="text-4xl text-primary" className="mb-2 gap-0 opacity-70" label="" />
            ) : (
              <Icon name="landscape" className="mb-2 text-4xl opacity-50" />
            )}
            <span className="text-sm font-medium">
              {bannerUploading ? "Uploading image..." : "Drag & drop an image here"}
            </span>
            <span className="text-xs opacity-70 mt-1">or click to browse (JPEG, PNG, WebP)</span>
          </div>
        )}
      </div>

      {/* Project Images (Placeholder) */}
      <div className="border-t border-outline-variant/20 pt-6">
        <h3 className="text-sm font-headline font-bold mb-4 text-on-surface">Gallery Assets</h3>
        <p className="text-xs text-on-surface-variant mb-4">
          Images for specific projects can be uploaded within the Content tab.
        </p>
      </div>
    </div>
  );
}
