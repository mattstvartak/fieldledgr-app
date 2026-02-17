import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Modal, Dimensions } from 'react-native';
import { Text, IconButton, useTheme, Chip } from 'react-native-paper';
import { Image } from 'expo-image';
import type { JobPhoto } from '@/types/job';
import { formatRelative } from '@/lib/formatting';
import { touchTargets } from '@/constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const THUMB_SIZE = (SCREEN_WIDTH - 48 - 16) / 3; // 3 columns, 16px padding, 8px gaps

type CategoryFilter = 'all' | 'before' | 'during' | 'after';

interface PhotoGalleryProps {
  photos: JobPhoto[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const theme = useTheme();
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [viewingPhoto, setViewingPhoto] = useState<JobPhoto | null>(null);

  const filtered = filter === 'all' ? photos : photos.filter((p) => p.category === filter);

  if (photos.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
        Photos ({photos.length})
      </Text>

      <View style={styles.filters}>
        <Chip
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          compact
          style={styles.chip}
        >
          All ({photos.length})
        </Chip>
        {(['before', 'during', 'after'] as const).map((cat) => {
          const count = photos.filter((p) => p.category === cat).length;
          if (count === 0) return null;
          return (
            <Chip
              key={cat}
              selected={filter === cat}
              onPress={() => setFilter(cat)}
              compact
              style={styles.chip}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
            </Chip>
          );
        })}
      </View>

      <View style={styles.grid}>
        {filtered.map((photo) => (
          <Pressable
            key={photo.id}
            onPress={() => setViewingPhoto(photo)}
            style={{ minHeight: touchTargets.minimum }}
          >
            <Image
              source={{ uri: photo.uri }}
              style={[styles.thumbnail, { backgroundColor: theme.colors.surfaceVariant }]}
              contentFit="cover"
            />
          </Pressable>
        ))}
      </View>

      {/* Full-screen photo viewer */}
      <Modal visible={!!viewingPhoto} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalHeader}>
            <View>
              {viewingPhoto && (
                <>
                  <Text style={styles.modalCategory}>
                    {viewingPhoto.category.toUpperCase()}
                  </Text>
                  {viewingPhoto.caption && (
                    <Text style={styles.modalCaption}>{viewingPhoto.caption}</Text>
                  )}
                  <Text style={styles.modalDate}>
                    {formatRelative(viewingPhoto.createdAt)}
                  </Text>
                </>
              )}
            </View>
            <IconButton
              icon="close"
              iconColor="#FFFFFF"
              size={28}
              onPress={() => setViewingPhoto(null)}
              style={{ minWidth: touchTargets.minimum, minHeight: touchTargets.minimum }}
            />
          </View>
          {viewingPhoto && (
            <Image
              source={{ uri: viewingPhoto.uri }}
              style={styles.fullImage}
              contentFit="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  title: {
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    height: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  thumbnail: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
  },
  modalCategory: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modalCaption: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 4,
  },
  modalDate: {
    color: '#AAAAAA',
    fontSize: 13,
    marginTop: 2,
  },
  fullImage: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
});
