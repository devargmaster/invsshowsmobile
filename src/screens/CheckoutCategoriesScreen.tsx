import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { categoriesService } from '../services/categoriesService';
import { addonsService } from '../services/addonsService';
import { ApiError } from '../services/apiClient';
import { useCheckout } from '../context/CheckoutContext';
import { ErrorBanner } from '../components/ErrorBanner';
import { formatMoney } from '../utils/formatters';
import type { TicketCategory } from '../types/checkout';
import { globalStyles as styles } from '../theme/globalStyles';

export function CheckoutCategoriesScreen({ route, navigation }: any) {
  const { eventId } = route.params as { eventId: string };
  const { items, setCategoryQuantity, startCheckout, subtotalCents } = useCheckout();

  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [hasAddons, setHasAddons] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      categoriesService.getByEvent(eventId),
      addonsService.getByEvent(eventId).catch(() => []),
    ])
      .then(([cats, addons]) => {
        setCategories(cats);
        setHasAddons(addons.length > 0);
        startCheckout(eventId);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Error cargando categorías.'))
      .finally(() => setLoading(false));
  }, [eventId, startCheckout]);

  useEffect(() => { load(); }, [load]);

  const quantityOf = (categoryId: string) => items.find((i) => i.category.id === categoryId)?.quantity ?? 0;
  const totalTickets = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleContinue = () => {
    navigation.navigate(hasAddons ? 'CheckoutAddons' : 'CheckoutSummary', { eventId });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#A78BFA" size="large" />
      </View>
    );
  }

  if (error) {
    return <View style={styles.screen}><ErrorBanner message={error} onRetry={load} /></View>;
  }

  if (categories.length === 0) {
    return (
      <View style={styles.screen}>
        <Text style={styles.checkoutEmpty}>Este evento todavía no tiene categorías de entrada configuradas.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={styles.checkoutStep}>Paso 1 de {hasAddons ? '3' : '2'}</Text>
        <Text style={styles.title}>Elegí tus entradas</Text>
        <Text style={styles.checkoutSubtitle}>Podés combinar varias categorías en la misma compra.</Text>

        {categories.map((cat) => {
          const available = cat.maxCapacity - cat.reservedCount;
          const qty = quantityOf(cat.id);
          const atMax = qty >= available;
          return (
            <View style={styles.checkoutItem} key={cat.id}>
              <View style={styles.checkoutItemInfo}>
                <Text style={styles.checkoutItemName}>{cat.name}</Text>
                {cat.description && <Text style={styles.checkoutItemDesc}>{cat.description}</Text>}
                {cat.accessStartsAt && (
                  <Text style={styles.checkoutItemMeta}>
                    Ingreso: {new Date(cat.accessStartsAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                )}
                <Text style={styles.checkoutItemPrice}>{formatMoney(cat.priceCents, cat.currency)}</Text>
                <Text style={[
                  styles.checkoutItemAvailable,
                  available <= 0 ? styles.checkoutItemAvailableNone : available <= 5 ? styles.checkoutItemAvailableLow : null,
                ]}>
                  {available <= 0 ? 'Sin cupo disponible' : `${available} disponibles`}
                </Text>
              </View>
              <View style={styles.checkoutStepper}>
                <Pressable
                  style={[styles.checkoutStepperBtn, qty === 0 && styles.checkoutStepperBtnDisabled]}
                  onPress={() => setCategoryQuantity(cat, Math.max(0, qty - 1))}
                  disabled={qty === 0}
                >
                  <Text style={styles.checkoutStepperBtnText}>−</Text>
                </Pressable>
                <Text style={styles.checkoutStepperCount}>{qty}</Text>
                <Pressable
                  style={[styles.checkoutStepperBtn, atMax && styles.checkoutStepperBtnDisabled]}
                  onPress={() => setCategoryQuantity(cat, qty + 1)}
                  disabled={atMax}
                >
                  <Text style={styles.checkoutStepperBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {totalTickets > 0 && (
        <View style={styles.checkoutFooter}>
          <View style={styles.checkoutFooterTotalRow}>
            <Text style={styles.checkoutFooterTotalLabel}>{totalTickets} entrada{totalTickets !== 1 ? 's' : ''}</Text>
            <Text style={styles.checkoutFooterTotalValue}>{formatMoney(subtotalCents)}</Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>Continuar</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
