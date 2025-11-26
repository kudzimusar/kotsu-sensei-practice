import { useState, useRef } from 'react';
import { ImageIcon, Plus, Camera, Folder, Image as ImageMultiple, X } from 'lucide-react';
import { Button } from './button';
import { ImageFile } from './image-upload';
import { toast } from 'sonner';

interface ImageUploadMenuProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  maxImages?: number;
  disabled?: boolean;
  trigger?: 'icon' | 'plus';
}

export function ImageUploadMenu({
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
  trigger = 'icon',
}: ImageUploadMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: ImageFile[] = [];
    Array.from(files).forEach((file) => {
      if (images.length + newImages.length >= maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }
      // Minimum size check (2KB)
      if (file.size < 2 * 1024) {
        toast.error(`${file.name} is too small. Minimum size is 2KB`);
        return;
      }
      // Check if it's an image type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return;
      }
      newImages.push({
        file,
        preview: URL.createObjectURL(file),
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      });
    });

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }
    setIsOpen(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    e.target.value = ''; // Reset to allow selecting same file again
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleFilesClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoLibraryClick = () => {
    // For mobile, use capture="environment" to open camera
    // For desktop, it will open file picker
    fileInputRef.current?.click();
  };

  const handleGoogleDriveClick = () => {
    toast.info('Google Drive integration coming soon!');
    setIsOpen(false);
  };

  const removeImage = (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    onImagesChange(images.filter(img => img.id !== imageId));
  };

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || images.length >= maxImages}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || images.length >= maxImages}
      />

      {/* Trigger Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && images.length < maxImages && setIsOpen(!isOpen)}
          disabled={disabled || images.length >= maxImages}
          className={`flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer flex-shrink-0 ${
            disabled || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title={images.length >= maxImages ? `Maximum ${maxImages} images` : 'Upload road sign image(s)'}
        >
          {trigger === 'plus' ? (
            <Plus className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Upload Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <div className="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-lg shadow-lg border border-border p-2 min-w-[200px]">
              <div className="grid grid-cols-2 gap-2">
                {/* Single Upload */}
                <button
                  type="button"
                  onClick={handleFilesClick}
                  className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-primary"
                >
                  <ImageIcon className="w-6 h-6 text-primary mb-1" />
                  <span className="text-xs text-gray-700">Single Image</span>
                </button>

                {/* Bulk Upload */}
                <button
                  type="button"
                  onClick={handleFilesClick}
                  className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-primary"
                >
                  <ImageMultiple className="w-6 h-6 text-primary mb-1" />
                  <span className="text-xs text-gray-700">Bulk Upload</span>
                </button>

                {/* Camera */}
                <button
                  type="button"
                  onClick={handleCameraClick}
                  className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-primary"
                >
                  <Camera className="w-6 h-6 text-primary mb-1" />
                  <span className="text-xs text-gray-700">Camera</span>
                </button>

                {/* Photo Library */}
                <button
                  type="button"
                  onClick={handlePhotoLibraryClick}
                  className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-primary"
                >
                  <Folder className="w-6 h-6 text-primary mb-1" />
                  <span className="text-xs text-gray-700">Photo Library</span>
                </button>

                {/* Google Drive */}
                <button
                  type="button"
                  onClick={handleGoogleDriveClick}
                  className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-primary col-span-2"
                >
                  <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.71 2.5L2.5 7.71l5.21 5.21L13.21 2.5H7.71zm8.79 0L12.5 7.71l5.21 5.21L21.5 2.5h-5zm-8.79 18.79L2.5 16.29l5.21-5.21L13.21 18.5H7.71zm8.79 0L12.5 16.29l5.21-5.21L21.5 18.5h-5z"/>
                  </svg>
                  <span className="text-xs text-gray-700">Google Drive</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 pb-2 border-b">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.preview}
                alt="Preview"
                className="w-12 h-12 object-cover rounded-md border border-border"
              />
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                disabled={disabled}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}


