import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { addonsService } from '../services/addonsService';
import { ApiError } from '../services/apiClient';
import { useCheckout } from '../context/CheckoutContext';
import { ErrorBanner } from '../components/ErrorBanner';
import { formatMoney } from '../utils/formatters';
import type { AddOn, AddonVariant } from '../types/checkout';
import { globalStyles as styles } from '../theme/globalStyles';

export function CheckoutAddonsScreen({ route, navigation }: any) {
  const { eventId } = route.params as { eventId: string };
  const { items, addonItems, setAddonQuantity, subtotalCents } = useCheckout();

  const [addons, setAddons] = useState<AddOn[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, AddonVariant>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    addonsService.getByEvent(eventId)
      .then(setAddons)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Error cargando adicionales.'))
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!loading && items.length === 0) {
      navigation.replace('CheckoutCategories', { eventId });
    }
  }, [loading, items, eventId, navigation]);

  const quantityOf = (addon: AddOn, variant: AddonVariant | null) =>
    addonItems.find((i) => i.addon.id === addon.id && (i.variant?.id ?? null) === (variant?.id ?? null))?.quantity ?? 0;

  const totalAddons = addonItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleContinue = () => navigation.navigate('CheckoutSummary', { eventId });

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

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={styles.checkoutStep}>Paso 2 de 3</Text>
        <Text style={styles.title}>Sumá adicionales</Text>
        <Text style={styles.checkoutSubtitle}>Decorá tu experiencia — es opcional, podés continuar sin elegir nada.</Text>

        {addons.length === 0 ? (
          <Text style={styles.checkoutEmpty}>Este evento no tiene adicionales configurados.</Text>
        ) : (
          addons.map((addon) => {
            const variant = addon.hasVariants ? selectedVariant[addon.id] ?? addon.variants[0] : null;
            const qty = quantityOf(addon, variant);
            return (
              <View style={styles.checkoutItem} key={addon.id}>
                <View style={styles.checkoutItemInfo}>
                  <Text style={styles.checkoutItemName}>{addon.name}</Text>
                  {addon.description && <Text style={styles.checkoutItemDesc}>{addon.description}</Text>}
                  <Text style={styles.checkoutItemPrice}>{formatMoney(addon.priceCents, addon.currency)}</Text>

                  {addon.hasVariants && addon.variants.length > 0 && (
                    <View style={styles.checkoutVariants}>
                      {addon.variants.map((v) => (
                        <Pressable
                          key={v.id}
                          style={[styles.checkoutVariantChip, variant?.id === v.id && styles.checkoutVariantChipActive]}
                          onPress={() => setSelectedVariant((prev) => ({ ...prev, [addon.id]: v }))}
                        >
                          <Text style={[styles.checkoutVariantChipText, variant?.id === v.id && styles.checkoutVariantChipTextActive]}>
                            {v.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
                {qty === 0 ? (
                  <Pressable
                    style={{ backgroundColor: '#7C3AED', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10 }}
                    onPress={() => setAddonQuantity(addon, variant ?? null, 1)}
                  >
                    <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>Agregar</Text>
                  </Pressable>
                ) : (
                  <View style={styles.checkoutStepper}>
                    <Pressable
                      style={styles.checkoutStepperBtn}
                      onPress={() => setAddonQuantity(addon, variant ?? null, Math.max(0, qty - 1))}
                    >
                      <Text style={styles.checkoutStepperBtnText}>−</Text>
                    </Pressable>
                    <Text style={styles.checkoutStepperCount}>{qty}</Text>
                    <Pressable
                      style={styles.checkoutStepperBtn}
                      onPress={() => setAddonQuantity(addon, variant ?? null, qty + 1)}
                    >
                      <Text style={styles.checkoutStepperBtnText}>+</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.checkoutFooter}>
        <View style={styles.checkoutFooterTotalRow}>
          <Text style={styles.checkoutFooterTotalLabel}>
            {totalAddons > 0 ? `${totalAddons} adicional(es)` : 'Total'}
          </Text>
          <Text style={styles.checkoutFooterTotalValue}>{formatMoney(subtotalCents)}</Text>
        </View>
        <Pressable style={styles.primaryButton} onPress={handleContinue}>
          <Text style={styles.primaryButtonText}>Continuar</Text>
        </Pressable>
      </View>
    </View>
  );
}
