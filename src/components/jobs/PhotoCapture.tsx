import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Menu, Dialog, Portal, RadioButton } from 'react-native-paper';
import { LargeButton } from '@/components/ui/LargeButton';
import { takePhoto, pickFromLibrary } from '@/lib/camera';
import { useOfflineQueueStore } from '@/stores/offlineQueueStore';
import { useAuthStore } from '@/stores/authStore';
import { useAppSettingsStore } from '@/stores/appSettingsStore';
import { jobPhotosApi } from '@/api/endpoints/job-photos';
import { touchTargets } from '@/constants/theme';
import type { JobPhoto } from '@/types/job';

type PhotoCategory = 'before' | 'during' | 'after';

interface PhotoCaptureProps {
  jobId: string;
  onPhotoAdded?: (photo: JobPhoto) => void;
}

export function PhotoCapture({ jobId, onPhotoAdded }: PhotoCaptureProps) {
  const userId = String(useAuthStore((s) => s.user?.id) ?? '');
  const useMockData = useAppSettingsStore((s) => s.useMockData);
  const enqueue = useOfflineQueueStore((s) => s.enqueue);
  const [menuVisible, setMenuVisible] = useState(false);
  const [categoryDialogVisible, setCategoryDialogVisible] = useState(false);
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const [category, setCategory] = useState<PhotoCategory>('during');
  const [isUploading, setIsUploading] = useState(false);

  const handleCapture = async (source: 'camera' | 'library') => {
    setMenuVisible(false);
    const result = source === 'camera' ? await takePhoto() : await pickFromLibrary();
    if (!result) return;

    setPendingUri(result.uri);
    setCategoryDialogVisible(true);
  };

  const handleConfirmCategory = async () => {
    if (!pendingUri) return;
    setCategoryDialogVisible(false);
    setIsUploading(true);

    const photo: Omit<JobPhoto, 'id' | 'createdAt'> = {
      uri: pendingUri,
      category,
      createdBy: userId,
    };

    try {
      if (useMockData) {
        // Simulate upload
        await new Promise((r) => setTimeout(r, 500));
        const mockPhoto: JobPhoto = {
          ...photo,
          id: `photo_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        onPhotoAdded?.(mockPhoto);
      } else {
        try {
          const saved = await jobPhotosApi.addPhoto(jobId, pendingUri, category);
          onPhotoAdded?.(saved as unknown as JobPhoto);
        } catch {
          await enqueue('add-photo', { jobId, uri: pendingUri, category, userId });
        }
      }
    } finally {
      setIsUploading(false);
      setPendingUri(null);
    }
  };

  return (
    <View style={styles.container}>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <LargeButton
            label="Add Photo"
            icon="camera"
            onPress={() => setMenuVisible(true)}
            mode="outlined"
            loading={isUploading}
            disabled={isUploading}
          />
        }
      >
        <Menu.Item
          onPress={() => handleCapture('camera')}
          title="Take Photo"
          leadingIcon="camera"
          style={{ minHeight: touchTargets.minimum }}
        />
        <Menu.Item
          onPress={() => handleCapture('library')}
          title="Choose from Library"
          leadingIcon="image"
          style={{ minHeight: touchTargets.minimum }}
        />
      </Menu>

      <Portal>
        <Dialog visible={categoryDialogVisible} onDismiss={() => setCategoryDialogVisible(false)}>
          <Dialog.Title>Photo Category</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
              What stage is this photo from?
            </Text>
            <RadioButton.Group
              value={category}
              onValueChange={(val) => setCategory(val as PhotoCategory)}
            >
              <RadioButton.Item label="Before" value="before" style={styles.radioItem} />
              <RadioButton.Item label="During" value="during" style={styles.radioItem} />
              <RadioButton.Item label="After" value="after" style={styles.radioItem} />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <LargeButton
              label="Cancel"
              mode="text"
              onPress={() => {
                setCategoryDialogVisible(false);
                setPendingUri(null);
              }}
              compact
            />
            <LargeButton
              label="Save Photo"
              onPress={handleConfirmCategory}
              loading={isUploading}
              compact
            />
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  radioItem: {
    minHeight: touchTargets.minimum,
  },
});
