import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { contentPurchasesService } from '../services/contentPurchasesService';
import { ApiError } from '../services/apiClient';
import { ErrorBanner } from '../components/ErrorBanner';
import type { ContentPurchase } from '../types/content';
import { globalStyles as styles } from '../theme/globalStyles';

export function ContentPurchaseConfirmationScreen({ route, navigation }: any) {
  const { purchaseId } = route.params as { purchaseId: string };

  const [purchase, setPurchase] = useState<ContentPurchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    contentPurchasesService.getById(purchaseId)
      .then(setPurchase)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Error cargando la compra.'))
      .finally(() => setLoading(false));
  }, [purchaseId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#A78BFA" size="large" />
      </View>
    );
  }

  if (error || !purchase) {
    return <View style={styles.screen}><ErrorBanner message={error ?? 'Compra no encontrada.'} /></View>;
  }

  const isPaid = purchase.status === 'PAID';
  const contentTitle = purchase.recording?.title ?? purchase.event?.title ?? 'este contenido';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[styles.checkoutConfirmIcon, isPaid ? styles.checkoutConfirmIconSuccess : styles.checkoutConfirmIconPending]}>
        <Ionicons name={isPaid ? 'checkmark' : 'time-outline'} size={44} color={isPaid ? '#4ADE80' : '#FBBF24'} />
      </View>

      <Text style={styles.checkoutConfirmTitle}>
        {isPaid ? '¡Compra confirmada!' : 'Comprobante recibido'}
      </Text>
      <Text style={styles.checkoutConfirmText}>
        {isPaid
          ? `Ya podés ver "${contentTitle}" desde la sección Streaming.`
          : `Tu comprobante para "${contentTitle}" quedó pendiente de validación — te avisamos por mail apenas lo confirmemos.`}
      </Text>

      <Pressable
        style={[styles.primaryButton, { marginTop: 28 }]}
        onPress={() => navigation.navigate('Tabs', { screen: 'Streaming' })}
      >
        <Text style={styles.primaryButtonText}>Volver a Streaming</Text>
      </Pressable>
    </ScrollView>
  );
}
