import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LargeButton } from '@/components/ui/LargeButton';
import { useCreateProduct } from '@/hooks/useProducts';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  unitPrice: z.string().min(1, 'Price is required'),
  unit: z.string().optional(),
  category: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProductCreateScreen() {
  const theme = useTheme();
  const router = useRouter();
  const createProduct = useCreateProduct();

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      unitPrice: '',
      unit: '',
      category: '',
    },
  });

  const onSave = async (data: FormData) => {
    await createProduct.mutateAsync({
      name: data.name,
      description: data.description || undefined,
      unitPrice: parseFloat(data.unitPrice),
      unit: data.unit || undefined,
      category: data.category || undefined,
    });
    router.dismiss();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: 'New Product' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextInput label="Name" mode="outlined" value={value} onChangeText={onChange} onBlur={onBlur} error={!!error} />
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
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextInput label="Unit Price" mode="outlined" keyboardType="decimal-pad" left={<TextInput.Affix text="$" />} value={value} onChangeText={onChange} onBlur={onBlur} error={!!error} />
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

        <LargeButton label="Create Product" onPress={handleSubmit(onSave)} loading={createProduct.isPending} style={styles.saveButton} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, gap: 12 },
  saveButton: { marginTop: 8 },
});
