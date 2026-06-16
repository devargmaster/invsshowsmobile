import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ErrorBanner } from '../components/ErrorBanner';
import { eventsService } from '../services/eventsService';
import { ApiError } from '../services/apiClient';
import type { Event } from '../types/events';
import { formatDate, modeLabel } from '../utils/formatters';
import { globalStyles as styles } from '../theme/globalStyles';

export function EventsScreen({ navigation }: any) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await eventsService.getAll({ upcoming: true });
      setEvents(data.filter(e => e.status === 'PUBLISHED'));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los eventos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

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
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => load(true)} 
            tintColor="#A78BFA"
            colors={['#A78BFA']}
          />
        }
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
