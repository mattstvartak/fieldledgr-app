import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import SignatureCanvas, { type SignatureViewRef } from 'react-native-signature-canvas';
import { useSignatureStore } from '@/stores/signatureStore';

export default function SignScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { customerName } = useLocalSearchParams<{ customerName: string }>();
  const signatureRef = useRef<SignatureViewRef>(null);
  const setSignature = useSignatureStore((s) => s.setSignature);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  const handleDone = () => {
    signatureRef.current?.readSignature();
  };

  const handleOK = (signature: string) => {
    setSignature(signature, customerName ?? '');
    router.back();
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar hidden />
      <View style={styles.canvasWrapper}>
        <SignatureCanvas
          ref={signatureRef}
          onOK={handleOK}
          webStyle={`
            .m-signature-pad { box-shadow: none; border: none; }
            .m-signature-pad--body { border: none; }
            .m-signature-pad--footer { display: none; }
            body,html { width: 100%; height: 100%; }
          `}
          backgroundColor="white"
          penColor="black"
          style={styles.canvas}
        />
      </View>
      <View style={styles.actions}>
        <Button mode="outlined" onPress={handleCancel} style={styles.button}>
          Cancel
        </Button>
        <Button mode="outlined" onPress={handleClear} style={styles.button}>
          Clear
        </Button>
        <Button mode="contained" onPress={handleDone} style={styles.button}>
          Done
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  canvasWrapper: {
    flex: 1,
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  canvas: {
    flex: 1,
  },
  actions: {
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  button: {
    minWidth: 100,
  },
});
