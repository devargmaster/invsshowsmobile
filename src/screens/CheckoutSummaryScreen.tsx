import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCheckout } from '../context/CheckoutContext';
import { ordersService } from '../services/ordersService';
import { ApiError } from '../services/apiClient';
import { ErrorBanner } from '../components/ErrorBanner';
import { formatMoney } from '../utils/formatters';
import type { PaymentMethod } from '../types/checkout';
import { globalStyles as styles } from '../theme/globalStyles';

export function CheckoutSummaryScreen({ route, navigation }: any) {
  const { eventId } = route.params as { eventId: string };
  const { items, addonItems, subtotalCents, clear } = useCheckout();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD_OPENPAY');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      navigation.replace('CheckoutCategories', { eventId });
    }
  }, [items, eventId, navigation]);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const order = await ordersService.create({
        eventId,
        items: items.map((i) => ({ categoryId: i.category.id, quantity: i.quantity })),
        addons: addonItems.map((i) => ({
          addonId: i.addon.id,
          variantId: i.variant?.id,
          quantity: i.quantity,
        })),
        paymentMethod,
      });
      clear();
      navigation.replace(
        paymentMethod === 'CARD_OPENPAY' ? 'CheckoutPaymentCard' : 'CheckoutTransfer',
        { orderId: order.id },
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al crear la orden.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.checkoutStep}>Paso 3 de 3</Text>
      <Text style={styles.title}>Resumen y pago</Text>

      {items.map((i) => (
        <View style={styles.checkoutSummaryLine} key={i.category.id}>
          <Text style={styles.checkoutSummaryLineLabel}>{i.quantity}× {i.category.name}</Text>
          <Text style={styles.checkoutSummaryLineValue}>{formatMoney(i.category.priceCents * i.quantity, i.category.currency)}</Text>
        </View>
      ))}
      {addonItems.map((i) => (
        <View style={styles.checkoutSummaryLine} key={`${i.addon.id}:${i.variant?.id ?? ''}`}>
          <Text style={styles.checkoutSummaryLineLabel}>
            {i.quantity}× {i.addon.name}{i.variant ? ` (${i.variant.label})` : ''}
          </Text>
          <Text style={styles.checkoutSummaryLineValue}>{formatMoney(i.addon.priceCents * i.quantity, i.addon.currency)}</Text>
        </View>
      ))}

      <View style={styles.checkoutSummaryTotal}>
        <Text style={styles.checkoutSummaryTotalLabel}>Total</Text>
        <Text style={styles.checkoutSummaryTotalValue}>{formatMoney(subtotalCents)}</Text>
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
          <Text style={styles.checkoutPaymentOptionSub}>Tus entradas quedan pendientes hasta validar el pago</Text>
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
