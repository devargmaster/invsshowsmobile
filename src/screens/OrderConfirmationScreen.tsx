import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ordersService } from '../services/ordersService';
import { ApiError } from '../services/apiClient';
import { ErrorBanner } from '../components/ErrorBanner';
import type { Order } from '../types/checkout';
import { globalStyles as styles } from '../theme/globalStyles';

export function OrderConfirmationScreen({ route, navigation }: any) {
  const { orderId } = route.params as { orderId: string };

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ordersService.getById(orderId)
      .then(setOrder)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Error cargando la orden.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#A78BFA" size="large" />
      </View>
    );
  }

  if (error || !order) {
    return <View style={styles.screen}><ErrorBanner message={error ?? 'Orden no encontrada.'} /></View>;
  }

  const isPaid = order.status === 'PAID';

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
          ? 'Ya generamos tus entradas con su código QR. Las vas a encontrar en "Mis Entradas".'
          : 'Tu comprobante quedó pendiente de validación. En cuanto lo confirmemos vas a poder ver tus entradas activas — te avisamos por mail.'}
      </Text>

      {!isPaid && (
        <View style={styles.checkoutNote}>
          <Ionicons name="alert-circle-outline" size={18} color="#FBBF24" />
          <Text style={styles.checkoutNoteText}>
            Podés seguir el estado de tu pago desde "Mis Entradas" en cualquier momento.
          </Text>
        </View>
      )}

      <Pressable
        style={[styles.primaryButton, { marginTop: 28 }]}
        onPress={() => navigation.navigate('Tabs', { screen: 'Entrada' })}
      >
        <Text style={styles.primaryButtonText}>Ver mis entradas</Text>
      </Pressable>
    </ScrollView>
  );
}
