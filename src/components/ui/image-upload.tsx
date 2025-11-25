import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface ImageUploadProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizeMB = 5,
  className,
  disabled = false,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check if it's an image type
    if (!file.type.startsWith('image/')) {
      return 'Invalid file type. Please upload an image file.';
    }

    // Check minimum file size (2KB)
    const minSizeBytes = 2 * 1024;
    if (file.size < minSizeBytes) {
      return 'File size is too small. Minimum size is 2KB.';
    }

    // Check maximum file size if specified
    if (maxSizeMB && maxSizeMB > 0) {
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return `File size exceeds ${maxSizeMB}MB limit.`;
      }
    }

    return null;
  };

  const createImageFile = (file: File): ImageFile => {
    return {
      file,
      preview: URL.createObjectURL(file),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const newImages: ImageFile[] = [];
      const errors: string[] = [];

      Array.from(files).forEach((file) => {
        if (images.length + newImages.length >= maxImages) {
          errors.push(`Maximum ${maxImages} images allowed.`);
          return;
        }

        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
          return;
        }

        newImages.push(createImageFile(file));
      });

      if (errors.length > 0) {
        // You can use toast here if needed
        console.warn('Image upload errors:', errors);
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }
    },
    [images, maxImages, onImagesChange]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (id: string) => {
    const imageToRemove = images.find((img) => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    onImagesChange(images.filter((img) => img.id !== id));
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Image Previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group w-20 h-20 rounded-lg overflow-hidden border-2 border-border bg-muted"
            >
              <img
                src={image.preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                disabled={disabled}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate">
                {(image.file.size / 1024).toFixed(0)}KB
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={openFileDialog}
        >
            <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            disabled={disabled}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="p-2 rounded-full bg-muted">
              {isDragging ? (
                <ImageIcon className="w-6 h-6 text-primary" />
              ) : (
                <Upload className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="text-sm">
              <span className="text-primary font-medium">
                Click to upload
              </span>{' '}
              or drag and drop
            </div>
            <p className="text-xs text-muted-foreground">
              All image types {maxSizeMB && maxSizeMB > 0 ? `up to ${maxSizeMB}MB` : '(any size, min 2KB)'}
            </p>
            {images.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {maxImages - images.length} more image{maxImages - images.length !== 1 ? 's' : ''} allowed
              </p>
            )}
          </div>
        </div>
      )}

      {/* Quick Upload Button (Alternative) */}
      {images.length === 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openFileDialog}
          disabled={disabled}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Road Sign Photo
        </Button>
      )}
    </div>
  );
}

