import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles as styles } from '../theme/globalStyles';

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.errorBox}>
      <Ionicons name="alert-circle" size={20} color="#EF4444" />
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} style={styles.retryBtn}>
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      )}
    </View>
  );
}
