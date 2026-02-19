import React from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { Text, TextInput, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LargeButton } from '@/components/ui/LargeButton';
import { useProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  unitPrice: z.string().min(1, 'Price is required'),
  unit: z.string().optional(),
  category: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { data: product, isLoading } = useProduct(Number(id));
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: product
      ? {
          name: product.name,
          description: product.description ?? '',
          unitPrice: String(product.unitPrice),
          unit: product.unit ?? '',
          category: product.category ?? '',
        }
      : undefined,
  });

  const onSave = async (data: FormData) => {
    await updateProduct.mutateAsync({
      id: Number(id),
      data: {
        name: data.name,
        description: data.description || undefined,
        unitPrice: parseFloat(data.unitPrice),
        unit: data.unit || undefined,
        category: data.category || undefined,
      },
    });
    router.dismiss();
  };

  const onDelete = () => {
    Alert.alert('Delete Product', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteProduct.mutateAsync(Number(id));
          router.dismiss();
        },
      },
    ]);
  };

  if (isLoading || !product) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Product' }} />
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: product.name }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Name" mode="outlined" value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Description" mode="outlined" multiline value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        <Controller
          control={control}
          name="unitPrice"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Unit Price" mode="outlined" keyboardType="decimal-pad" left={<TextInput.Affix text="$" />} value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        <Controller
          control={control}
          name="unit"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Unit (e.g. hour, each)" mode="outlined" value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Category" mode="outlined" value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />

        <LargeButton label="Save Changes" onPress={handleSubmit(onSave)} loading={updateProduct.isPending} style={styles.saveButton} />
        <Divider style={styles.divider} />
        <LargeButton label="Delete Product" onPress={onDelete} mode="outlined" textColor={theme.colors.error} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, gap: 12 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  saveButton: { marginTop: 8 },
  divider: { marginVertical: 8 },
});
