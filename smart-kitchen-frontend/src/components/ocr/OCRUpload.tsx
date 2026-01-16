'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Camera, Receipt, Package } from 'lucide-react';

interface OCRUploadProps {
  type: 'receipt' | 'inventory';
  onResult?: (result: any) => void;
}

export function OCRUpload({ type, onResult }: OCRUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = type === 'receipt' ? '/ocr/receipt' : '/ocr/inventory';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace('/graphql', '')}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setResult(data);
      onResult?.(data);
    } catch (error) {
      console.error('OCR processing failed:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      handleFileUpload(imageFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          {type === 'receipt' ? <Receipt className="w-4 h-4 sm:w-5 sm:h-5" /> : <Package className="w-4 h-4 sm:w-5 sm:h-5" />}
          {type === 'receipt' ? 'Scan Receipt' : 'Scan Item'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 transition-colors relative"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="space-y-2">
            <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center">
              {uploading ? (
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
              ) : (
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-[10px] sm:text-sm font-medium">
                {uploading ? 'Processing...' : 'Drop image here or click to upload'}
              </p>
              <p className="text-[9px] sm:text-xs text-gray-500">
                Supports JPG, PNG, WebP
              </p>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 sm:h-10 text-[10px] sm:text-sm"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.capture = 'environment';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFileUpload(file);
              };
              input.click();
            }}
            disabled={uploading}
          >
            <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Camera
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 sm:h-10 text-[10px] sm:text-sm"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFileUpload(file);
              };
              input.click();
            }}
            disabled={uploading}
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Gallery
          </Button>
        </div>

        {result && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-1 sm:mb-2 text-[10px] sm:text-sm">
              {type === 'receipt' ? 'Receipt Processed!' : 'Item Identified!'}
            </h4>
            <pre className="text-[8px] sm:text-xs text-green-700 overflow-auto max-h-24 sm:max-h-32">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}