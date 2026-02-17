import { apiClient } from '@/api/client';
import { config } from '@/constants/config';
import { useAuthStore } from '@/stores/authStore';
import type { JobPhoto } from '@/types/job';

interface PayloadListResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PayloadMedia {
  id: number;
  url: string;
}

async function uploadMedia(uri: string): Promise<PayloadMedia> {
  const token = useAuthStore.getState().token;
  const formData = new FormData();

  // React Native file upload via FormData
  const filename = uri.split('/').pop() ?? 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri,
    name: filename,
    type: mimeType,
  } as unknown as Blob);

  const response = await fetch(new URL('/api/media', config.apiUrl).toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Media upload failed: ${response.status}`);
  }

  return response.json() as Promise<PayloadMedia>;
}

export const jobPhotosApi = {
  addPhoto: async (
    jobId: string,
    uri: string,
    category: 'before' | 'during' | 'after',
    caption?: string,
  ): Promise<JobPhoto> => {
    // Step 1: Upload the image to media collection
    const media = await uploadMedia(uri);

    // Step 2: Create the job-photo record linking to the media
    return apiClient.post<JobPhoto>('/api/job-photos', {
      job: Number(jobId),
      photo: media.id,
      category,
      caption,
    });
  },

  getPhotos: (jobId: string) =>
    apiClient.get<PayloadListResponse<JobPhoto>>('/api/job-photos', {
      'where[job][equals]': jobId,
      sort: '-createdAt',
      depth: '1',
    }),
};
