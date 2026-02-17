import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { LargeButton } from '@/components/ui/LargeButton';
import { useAuthStore } from '@/stores/authStore';
import { useAppSettingsStore } from '@/stores/appSettingsStore';
import { useOfflineQueueStore } from '@/stores/offlineQueueStore';
import { jobNotesApi } from '@/api/endpoints/job-notes';
import { useQueryClient } from '@tanstack/react-query';
import type { JobNote } from '@/types/job';

interface AddNoteInputProps {
  jobId: string;
  onNoteAdded?: (note: JobNote) => void;
}

export function AddNoteInput({ jobId, onNoteAdded }: AddNoteInputProps) {
  const userId = String(useAuthStore((s) => s.user?.id) ?? '');
  const useMockData = useAppSettingsStore((s) => s.useMockData);
  const enqueue = useOfflineQueueStore((s) => s.enqueue);
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setIsSaving(true);

    try {
      if (useMockData) {
        await new Promise((r) => setTimeout(r, 300));
        const mockNote: JobNote = {
          id: `note_${Date.now()}`,
          text: trimmed,
          createdBy: userId,
          createdAt: new Date().toISOString(),
        };
        onNoteAdded?.(mockNote);
      } else {
        try {
          const saved = await jobNotesApi.addNote(jobId, trimmed);
          onNoteAdded?.(saved as unknown as JobNote);
        } catch {
          await enqueue('add-note', { jobId, text: trimmed, userId });
        }
      }
      setText('');
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label="Add a note..."
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={3}
        style={styles.input}
      />
      <LargeButton
        label="Save Note"
        icon="note-plus"
        onPress={handleSubmit}
        disabled={!text.trim() || isSaving}
        loading={isSaving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  input: {
    fontSize: 16,
  },
});
