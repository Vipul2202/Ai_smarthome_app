'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { GET_AVATAR_UPLOAD_URL_MUTATION } from '@/lib/graphql/mutations';
import { apiClient } from '@/lib/api-client';

export interface AvatarUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export function useAvatarUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [getUploadUrl] = useMutation(GET_AVATAR_UPLOAD_URL_MUTATION);

  const uploadAvatar = async (file: File): Promise<AvatarUploadResult> => {
    try {
      setUploading(true);
      setProgress(0);

      // Validate file
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Please select an image file' };
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        return { success: false, error: 'Image must be smaller than 5MB' };
      }

      setProgress(20);

      // Upload directly to the avatar endpoint
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('kitchen_auth_token');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      setProgress(50);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL?.replace('/graphql', '') || 'http://localhost:4000'}/upload/avatar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      setProgress(80);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: errorData.error || `Upload failed with status ${response.status}` 
        };
      }

      const result = await response.json();
      setProgress(100);

      return {
        success: true,
        url: result.url,
      };
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload avatar',
      };
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000); // Reset progress after delay
    }
  };

  const selectAndUploadAvatar = (): Promise<AvatarUploadResult> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const result = await uploadAvatar(file);
          resolve(result);
        } else {
          resolve({ success: false, error: 'No file selected' });
        }
      };
      input.click();
    });
  };

  return {
    uploadAvatar,
    selectAndUploadAvatar,
    uploading,
    progress,
  };
}