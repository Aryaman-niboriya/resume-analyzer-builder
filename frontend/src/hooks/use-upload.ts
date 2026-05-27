import { useState } from 'react';
import { useToast } from './use-toast';
import { apiFetch, apiUrl } from '@/lib/api';

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadResume = async (file: File, jobDescription: string, onComplete: (data: any) => void) => {
    setIsUploading(true);
    setProgress(0);

    try {
      // Simulate progress for UI feel since fetch doesn't support upload progress natively
      // In a real app we would use XMLHttpRequest to get actual upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      const formData = new FormData();
      formData.append('resume', file);
      formData.append('job_description', jobDescription);
      
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          formData.append('user_id', user.id);
        } catch(e) {}
      }

      const token = localStorage.getItem('auth_token');
      const response = await apiFetch('/api/upload', {
        method: 'POST',
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload resume');
      }

      const data = await response.json();
      
      toast({
        title: "Success",
        description: data.message,
      });
      
      onComplete(data);
    } catch (error: any) {
      setProgress(0);
      toast({
        title: "Error",
        description: error.message || "Failed to connect to the server",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, progress, uploadResume };
}
