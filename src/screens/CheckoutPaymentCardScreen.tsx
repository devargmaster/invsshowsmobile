import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { ordersService } from '../services/ordersService';
import { tokenizeCard } from '../services/openpayClient';
import { ApiError } from '../services/apiClient';
import { ErrorBanner } from '../components/ErrorBanner';
import { ENV } from '../config/env';
import { globalStyles as styles } from '../theme/globalStyles';

export function CheckoutPaymentCardScreen({ route, navigation }: any) {
  const { orderId } = route.params as { orderId: string };

  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { cardToken, deviceSessionId } = await tokenizeCard({
        cardNumber,
        holderName,
        expirationMonth: expMonth,
        expirationYear: expYear,
        cvv2: cvv,
      });
      await ordersService.payCard(orderId, cardToken, deviceSessionId);
      navigation.replace('OrderConfirmation', { orderId });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Error al procesar el pago.');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !!cardNumber && !!holderName && !!expMonth && !!expYear && !!cvv;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.checkoutStep}>Pago con tarjeta</Text>
      <Text style={styles.title}>Datos de tu tarjeta</Text>

      {!ENV.OPENPAY_PUBLIC_KEY && (
        <ErrorBanner message="El pago con tarjeta todavía no está habilitado en este ambiente. Volvé atrás y elegí transferencia bancaria." />
      )}

      <Text style={styles.checkoutFieldLabel}>Número de tarjeta</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        placeholder="4111 1111 1111 1111"
        placeholderTextColor="#5A5A72"
        value={cardNumber}
        onChangeText={setCardNumber}
      />

      <Text style={styles.checkoutFieldLabel}>Nombre del titular</Text>
      <TextInput
        style={styles.input}
        placeholder="Como figura en la tarjeta"
        placeholderTextColor="#5A5A72"
        value={holderName}
        onChangeText={setHolderName}
      />

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.checkoutFieldLabel}>Mes</Text>
          <TextInput style={styles.input} placeholder="MM" placeholderTextColor="#5A5A72" maxLength={2} keyboardType="number-pad" value={expMonth} onChangeText={setExpMonth} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.checkoutFieldLabel}>Año</Text>
          <TextInput style={styles.input} placeholder="AA" placeholderTextColor="#5A5A72" maxLength={2} keyboardType="number-pad" value={expYear} onChangeText={setExpYear} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.checkoutFieldLabel}>CVV</Text>
          <TextInput style={styles.input} maxLength={4} keyboardType="number-pad" value={cvv} onChangeText={setCvv} />
        </View>
      </View>

      {error && <ErrorBanner message={error} />}

      <Pressable
        style={[styles.primaryButton, (submitting || !canSubmit) && styles.buttonDisabled, { marginTop: 16 }]}
        onPress={handlePay}
        disabled={submitting || !canSubmit}
      >
        {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Pagar ahora</Text>}
      </Pressable>
    </ScrollView>
  );
}
