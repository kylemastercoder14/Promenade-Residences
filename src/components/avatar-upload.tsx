"use client";

import { useState, useRef } from "react";
import { Camera, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { upload } from "@/lib/upload";
import { toast } from "sonner";
import { deleteFromS3 } from "@/lib/upload";
import CircularProgress from "@/components/circular-progress";

interface AvatarUploadProps {
  value?: string;
  onChange: (url: string) => void;
  name?: string;
  disabled?: boolean;
}

export default function AvatarUpload({
  value,
  onChange,
  name,
  disabled = false,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (PNG, JPG, or WEBP)");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Delete old image if exists
      if (value) {
        try {
          await deleteFromS3(value);
        } catch (error) {
          console.warn("Failed to delete old image:", error);
        }
      }

      // Upload new image
      const result = await upload(file, (progress) => {
        setUploadProgress(progress);
      });

      if (result.url) {
        onChange(result.url);
        toast.success("Profile picture uploaded successfully");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      await deleteFromS3(value);
      onChange("");
      toast.success("Profile picture removed");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to remove image. Please try again.");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || "U";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-32 w-32 border-4 border-border">
          <AvatarImage src={value} alt="Profile" />
          <AvatarFallback className="text-3xl bg-muted">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
            <CircularProgress value={uploadProgress} size={64} showLabel renderLabel={(val) => `${val}%`} />
          </div>
        )}

        {value && !isUploading && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
          id="avatar-upload"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="gap-2"
        >
          <Camera className="h-4 w-4" />
          {value ? "Change Photo" : "Upload Photo"}
        </Button>
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          JPG, PNG or WEBP. Max size 5MB
        </p>
      </div>
    </div>
  );
}

