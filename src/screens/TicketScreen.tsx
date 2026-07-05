import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { ErrorBanner } from '../components/ErrorBanner';
import { ticketsService } from '../services/ticketsService';
import { ApiError } from '../services/apiClient';
import type { Ticket } from '../types/tickets';
import { formatDate } from '../utils/formatters';
import { globalStyles as styles } from '../theme/globalStyles';

import { useIsFocused } from '@react-navigation/native';

export function TicketScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Ticket | null>(null);

  const isFocused = useIsFocused();

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await ticketsService.getMyTickets();
      setTickets(data);
      setSelected((prev) => {
        if (data.length === 0) return null;
        if (!prev) return data[0];
        const prevInData = data.find(t => t.id === prev.id);
        if (!prevInData) return data[0];
        // Si hay un ticket nuevo (data[0]) sin usar y estábamos viendo uno usado, seleccionamos el nuevo
        if (!data[0].used && prev.used) return data[0];
        return prevInData;
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error cargando tickets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    if (isFocused) {
      load();
    }
  }, [isFocused, load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#A78BFA" size="large" />
        <Text style={styles.loadingText}>Cargando entradas...</Text>
      </View>
    );
  }

  if (error) {
    return <View style={styles.screen}><ErrorBanner message={error} onRetry={load} /></View>;
  }

  if (tickets.length === 0) {
    return (
      <View style={styles.centerScreen}>
        <Ionicons name="ticket-outline" size={64} color="#3D3D5C" />
        <Text style={styles.emptyText}>No tenés entradas activas.</Text>
        <Text style={styles.note}>Comprá un ticket desde el detalle de un evento presencial.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Mis Entradas</Text>

      {tickets.length > 1 && (
        <FlatList
          data={tickets}
          horizontal
          keyExtractor={t => t.id}
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.tabChip, selected?.id === item.id && styles.tabChipActive]}
              onPress={() => setSelected(item)}
            >
              <Text style={[styles.tabChipText, selected?.id === item.id && styles.tabChipTextActive]}>
                {item.event?.title ?? item.eventId}
                {item.used ? ' (Usada)' : ''}
              </Text>
            </Pressable>
          )}
        />
      )}

      {selected && (
        <View>
          {selected.event && (
            <View style={styles.card}>
              <Image 
                source={{ uri: `https://picsum.photos/seed/${selected.event.id}/400/200` }} 
                style={styles.cardImage} 
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{selected.event.title}</Text>
                <Text style={styles.meta}>{formatDate(selected.event.date)}</Text>
                {selected.event.location && <Text style={styles.meta}>📍 {selected.event.location}</Text>}
              </View>
            </View>
          )}

          <View style={styles.qrWrapper}>
            {selected.used ? (
              <View style={styles.usedOverlay}>
                <Ionicons name="close-circle" size={48} color="#EF4444" />
                <Text style={styles.usedText}>ENTRADA UTILIZADA</Text>
                {selected.usedAt && (
                  <Text style={styles.meta}>{formatDate(selected.usedAt)}</Text>
                )}
              </View>
            ) : (
              <View style={styles.qrBox}>
                <QRCode value={selected.qrPayload} size={220} />
              </View>
            )}
          </View>

          <Text style={styles.noteCenter}>
            {selected.used
              ? 'Esta entrada ya fue utilizada.'
              : `Válida hasta: ${formatDate(selected.expiresAt)}`
            }
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
