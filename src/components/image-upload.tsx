"use client";

import { Upload, X, File as FileIcon, FileText } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { upload } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import CircularProgress from "@/components/circular-progress";

type FileType = "image" | "document" | "unknown";

const getFileType = (url: string): FileType => {
  const extension = url.split(".").pop()?.toLowerCase();
  const imageExtensions = ["png", "jpg", "jpeg", "svg", "webp", "avif", "gif"];
  const documentExtensions = ["pdf", "doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx"];

  if (extension && imageExtensions.includes(extension)) return "image";
  if (extension && documentExtensions.includes(extension)) return "document";
  return "unknown";
};

const getFileIcon = (fileType: FileType) => {
  switch (fileType) {
    case "document":
      return <FileText className="w-8 h-8 text-muted-foreground" />;
    case "image":
      return null; // Will use Image component
    default:
      return <FileIcon className="w-8 h-8 text-muted-foreground" />;
  }
};

const getFileName = (url: string): string => {
  const parts = url.split("/");
  return parts[parts.length - 1] || "file";
};

const ImageUpload = ({
  onImageUpload,
  defaultValue = "",
  imageCount,
  maxSize,
}: {
  onImageUpload: (urls: string[] | string) => void;
  defaultValue?: string | string[];
  imageCount: number;
  maxSize: number;
}) => {
  const [files, setFiles] = useState<string[]>(
	Array.isArray(defaultValue)
	  ? defaultValue
	  : defaultValue
	  ? [defaultValue]
	  : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Progress simulation
  useEffect(() => {
	let timer: NodeJS.Timeout;
	if (isLoading) {
	  setProgress(0);
	  timer = setInterval(() => {
		setProgress((prev) => {
		  if (prev >= 95) return prev;
		  return prev + 5;
		});
	  }, 150);
	}
	return () => clearInterval(timer);
  }, [isLoading]);

  const { getRootProps, getInputProps } = useDropzone({
	accept: {
	  "image/png": [".png"],
	  "image/jpg": [".jpg", ".jpeg"],
	  "image/svg+xml": [".svg"],
	  "image/webp": [".webp"],
	  "image/avif": [".avif"],
	  "image/gif": [".gif"],
	  "application/pdf": [".pdf"],
	  "application/msword": [".doc"],
	  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
	  "text/plain": [".txt"],
	  "application/vnd.ms-excel": [".xls"],
	  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
	  "application/vnd.ms-powerpoint": [".ppt"],
	  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
	},
	maxFiles: imageCount,
	onDrop: async (acceptedFiles) => {
	  if (acceptedFiles.length > imageCount) {
		toast.error(`You can only upload ${imageCount} file(s).`);
		return;
	  }

	  const validFiles = acceptedFiles.filter(
		(file) => file.size <= maxSize * 1024 * 1024
	  );

	  if (validFiles.length === 0) {
		toast.error(`Please upload a smaller file (max ${maxSize}MB).`);
		return;
	  }

	  setIsLoading(true);
	  const toastId = toast.loading("Uploading file...");

	  try {
		const urls: string[] = [];
		for (const file of validFiles) {
		  // rename file
		  const fileExtension = file.name.split(".").pop();
		  const now = new Date();
		  const formattedTimestamp = `${String(now.getMonth() + 1).padStart(
			2,
			"0"
		  )}-${String(now.getDate()).padStart(2, "0")}-${now.getFullYear()}-${String(
			now.getHours()
		  ).padStart(2, "0")}-${String(now.getMinutes()).padStart(
			2,
			"0"
		  )}-${String(now.getSeconds()).padStart(2, "0")}`;
		  const newFileName = `${formattedTimestamp}.${fileExtension}`;
		  const renamedFile = new File([file], newFileName, { type: file.type });

		  await new Promise((resolve) => setTimeout(resolve, 500));
		  const { url } = await upload(renamedFile);
		  urls.push(url);
		}

		setProgress(100);
		await new Promise((resolve) => setTimeout(resolve, 300));

		toast.dismiss(toastId);
		toast.success("File(s) uploaded successfully!");

		const newFiles =
		  imageCount === 1 ? [urls[0]] : [...files, ...urls].slice(0, imageCount);

		setFiles(newFiles);
		onImageUpload(imageCount === 1 ? newFiles[0] : newFiles);
	  } catch (error) {
		toast.dismiss(toastId);
		toast.error("File upload failed.");
		console.error(error);
	  } finally {
		setIsLoading(false);
	  }
	},
  });

  const handleRemoveFile = (url: string) => {
	const updated = files.filter((file) => file !== url);
	setFiles(updated);
	onImageUpload(imageCount === 1 ? updated[0] || "" : updated);
	toast.info("File removed.");
  };

  return (
	<div className="rounded-xl w-full">
	  <div
		{...getRootProps({
		  className:
			"border-dashed border-[2px] rounded-xl cursor-pointer py-8 flex justify-center items-center flex-col relative",
		})}
	  >
		<input {...getInputProps()} />
		{isLoading ? (
		  <div className="flex flex-col items-center justify-center gap-2">
			<CircularProgress
			  value={progress}
			  size={120}
			  strokeWidth={10}
			  showLabel
			  labelClassName="text-xl font-bold"
			  renderLabel={(val) => `${val}%`}
			/>
			<p className="font-medium">Uploading...</p>
			<p className="text-sm text-muted-foreground">
			  Please wait while we process your image
			</p>
		  </div>
		) : files.length > 0 ? (
		  <div
			className={`${
			  imageCount === 1
				? "flex flex-col items-center gap-2"
				: "flex flex-wrap gap-4 justify-center"
			}`}
		  >
			{files.map((url, idx) => {
			  const fileType = getFileType(url);
			  const fileName = getFileName(url);
			  const isImage = fileType === "image";

			  return (
				<div key={idx} className="relative">
				  {isImage ? (
					<Image
					  src={url}
					  alt={`Uploaded Image ${idx}`}
					  width={100}
					  height={100}
					  className="rounded-md object-cover"
					/>
				  ) : (
					<div className="flex flex-col items-center justify-center w-[100px] h-[100px] border rounded-md bg-muted">
					  {getFileIcon(fileType)}
					  <p className="text-xs text-muted-foreground mt-1 px-1 text-center truncate w-full">
						{fileName}
					  </p>
					</div>
				  )}
				  <button
					type="button"
					className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
					onClick={() => handleRemoveFile(url)}
				  >
					<X className="w-4 h-4" />
				  </button>
				</div>
			  );
			})}
		  </div>
		) : (
		  <>
			<div className="flex items-center justify-center size-12 rounded-full border">
			  <Upload className="w-5 h-5 text-muted-foreground" />
			</div>
			<p className="mt-2 font-medium">Drag & drop files here</p>
			<p className="mt-2 mb-4 text-sm text-muted-foreground">
			  (max {imageCount || 1} file(s), up to{" "}
			  {maxSize || 4}MB each)
			</p>
			<Button type="button" variant="secondary">
			  Browse files
			</Button>
		  </>
		)}
	  </div>
	</div>
  );
};

export default ImageUpload;
