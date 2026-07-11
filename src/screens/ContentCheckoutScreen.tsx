import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { contentPurchasesService } from '../services/contentPurchasesService';
import { ApiError } from '../services/apiClient';
import { ErrorBanner } from '../components/ErrorBanner';
import { formatMoney } from '../utils/formatters';
import type { ContentPaymentMethod } from '../types/content';
import { globalStyles as styles } from '../theme/globalStyles';

export function ContentCheckoutScreen({ route, navigation }: any) {
  const { type, id, title, priceCents, currency } = route.params as {
    type: 'recording' | 'event'; id: string; title: string; priceCents: number; currency: string;
  };

  const [paymentMethod, setPaymentMethod] = useState<ContentPaymentMethod>('CARD_OPENPAY');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const purchase = await contentPurchasesService.create({
        recordingId: type === 'recording' ? id : undefined,
        eventId: type === 'event' ? id : undefined,
        paymentMethod,
      });
      navigation.replace(
        paymentMethod === 'CARD_OPENPAY' ? 'ContentPaymentCard' : 'ContentTransfer',
        { purchaseId: purchase.id },
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al iniciar la compra.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.checkoutStep}>Comprar contenido</Text>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.checkoutSummaryTotal}>
        <Text style={styles.checkoutSummaryTotalLabel}>Precio</Text>
        <Text style={styles.checkoutSummaryTotalValue}>{formatMoney(priceCents, currency)}</Text>
      </View>

      <Text style={styles.checkoutFieldLabel}>Método de pago</Text>

      <Pressable
        style={[styles.checkoutPaymentOption, paymentMethod === 'CARD_OPENPAY' && styles.checkoutPaymentOptionActive]}
        onPress={() => setPaymentMethod('CARD_OPENPAY')}
      >
        <Ionicons name="card" size={20} color="#A78BFA" />
        <View style={{ flex: 1 }}>
          <Text style={styles.checkoutPaymentOptionLabel}>Tarjeta de crédito/débito</Text>
          <Text style={styles.checkoutPaymentOptionSub}>Vía Openpay — acreditación inmediata</Text>
        </View>
      </Pressable>

      <Pressable
        style={[styles.checkoutPaymentOption, paymentMethod === 'BANK_TRANSFER' && styles.checkoutPaymentOptionActive]}
        onPress={() => setPaymentMethod('BANK_TRANSFER')}
      >
        <Ionicons name="business" size={20} color="#A78BFA" />
        <View style={{ flex: 1 }}>
          <Text style={styles.checkoutPaymentOptionLabel}>Transferencia bancaria</Text>
          <Text style={styles.checkoutPaymentOptionSub}>El acceso queda pendiente hasta validar el pago</Text>
        </View>
      </Pressable>

      {error && <ErrorBanner message={error} />}

      <Pressable
        style={[styles.primaryButton, submitting && styles.buttonDisabled, { marginTop: 20 }]}
        onPress={handleConfirm}
        disabled={submitting}
      >
        {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Confirmar compra</Text>}
      </Pressable>
    </ScrollView>
  );
}
