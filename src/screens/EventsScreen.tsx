import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Image } from 'react-native';
import { ErrorBanner } from '../components/ErrorBanner';
import { eventsService } from '../services/eventsService';
import { ApiError } from '../services/apiClient';
import type { Event } from '../types/events';
import { formatDate, modeLabel } from '../utils/formatters';
import { globalStyles as styles } from '../theme/globalStyles';

export function EventsScreen({ navigation }: any) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventsService.getAll({ upcoming: true });
      setEvents(data.filter(e => e.status === 'PUBLISHED'));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los eventos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#A78BFA" size="large" />
        <Text style={styles.loadingText}>Cargando eventos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Eventos INVS</Text>

      {error && <ErrorBanner message={error} onRetry={load} />}

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !error ? <Text style={styles.emptyText}>No hay eventos disponibles.</Text> : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
          >
            <Image 
              source={{ uri: `https://picsum.photos/seed/${item.id}/400/200` }} 
              style={styles.cardImage} 
            />
            <View style={styles.cardContent}>
              <View style={styles.cardRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.isLive && (
                  <View style={styles.livePill}>
                    <Text style={styles.livePillText}>● EN VIVO</Text>
                  </View>
                )}
              </View>
              <Text style={styles.meta}>{formatDate(item.date)}</Text>
              {item.location && <Text style={styles.meta}>{item.location}</Text>}
              <Text style={styles.badge}>{modeLabel(item.mode)}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
