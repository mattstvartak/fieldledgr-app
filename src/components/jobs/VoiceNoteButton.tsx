import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LargeButton } from '@/components/ui/LargeButton';
import { clockedInColor } from '@/constants/theme';

// Expo Voice is a third-party native module. For Expo Go, we use the
// browser-compatible SpeechRecognition API on web and ExpoSpeech on native.
// This component uses the device's built-in speech recognition via
// a lightweight platform bridge.

interface VoiceNoteButtonProps {
  onTranscript: (text: string) => void;
}

export function VoiceNoteButton({ onTranscript }: VoiceNoteButtonProps) {
  const theme = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // TODO: integrate with @react-native-voice/voice or expo-speech-recognition
  // For now, provide a UI stub that shows the interaction pattern.
  // The actual speech recognition requires a native module not available in Expo Go.

  const handleToggleListening = useCallback(() => {
    if (isListening) {
      setIsListening(false);
      if (transcript.trim()) {
        onTranscript(transcript.trim());
        setTranscript('');
      }
    } else {
      setError(null);
      setIsListening(true);
      setTranscript('');

      if (Platform.OS === 'web') {
        // Web Speech API
        startWebSpeechRecognition();
      } else {
        // Native speech recognition requires a dev build with native modules.
        // Show a helpful message for Expo Go users.
        setError('Voice notes require a development build. Use text notes in Expo Go.');
        setIsListening(false);
      }
    }
  }, [isListening, transcript, onTranscript]);

  const startWebSpeechRecognition = () => {
    const SpeechRecognition =
      (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.');
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      setTranscript(result[0].transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setError(`Speech error: ${event.error}`);
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <View style={styles.container}>
      <LargeButton
        label={isListening ? 'Stop Recording' : 'Voice Note'}
        icon={isListening ? 'stop' : 'microphone'}
        onPress={handleToggleListening}
        mode={isListening ? 'contained' : 'outlined'}
        buttonColor={isListening ? clockedInColor : undefined}
        textColor={isListening ? '#FFFFFF' : undefined}
      />

      {isListening && (
        <View style={[styles.transcriptBox, { borderColor: clockedInColor }]}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
            {transcript || 'Listening...'}
          </Text>
        </View>
      )}

      {error && (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  transcriptBox: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
  },
});
