import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/ErrorBanner';
import { eventsService } from '../services/eventsService';
import { ticketsService } from '../services/ticketsService';
import { streamingService } from '../services/streamingService';
import { ApiError } from '../services/apiClient';
import type { Event } from '../types/events';
import type { Recording, StreamingTokenResponse, RecordingTokenResponse } from '../types/streaming';
import { formatDate, modeLabel } from '../utils/formatters';
import { globalStyles as styles } from '../theme/globalStyles';

export function EventDetailScreen({ route, navigation }: any) {
  const { eventId } = route.params as { eventId: string };
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamData, setStreamData] = useState<StreamingTokenResponse | RecordingTokenResponse | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);

  const [hasTicket, setHasTicket] = useState(false);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    eventsService.getById(eventId)
      .then(setEvent)
      .catch(e => setError(e instanceof ApiError ? e.message : 'Error cargando evento.'))
      .finally(() => setLoading(false));

    ticketsService.getTicketForEvent(eventId)
      .then(t => setHasTicket(!!t))
      .catch(() => setHasTicket(false));
  }, [eventId]);

  useEffect(() => {
    if (!event) return;
    const canWatch = event.mode === 'STREAMING' || event.mode === 'HIBRIDO';
    if (canWatch && !event.isLive) {
      streamingService.getRecordingsByEvent(eventId)
        .then(setRecordings)
        .catch(() => setRecordings([]));
    }
  }, [event, eventId]);

  const handleWatchLive = async () => {
    setStreamLoading(true);
    setStreamError(null);
    try {
      const data = await streamingService.getLiveToken(eventId);
      setStreamData(data);
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 403) {
        setStreamError('Necesitás una suscripción activa para ver este evento.');
      } else {
        setStreamError(e instanceof ApiError ? e.message : 'Error al obtener el stream.');
      }
    } finally {
      setStreamLoading(false);
    }
  };

  const handleWatchRecording = async (recordingId: string) => {
    setStreamLoading(true);
    setStreamError(null);
    try {
      const data = await streamingService.getRecordingToken(recordingId);
      setStreamData(data);
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 403) {
        setStreamError('Necesitás una suscripción activa para ver esta grabación.');
      } else {
        setStreamError(e instanceof ApiError ? e.message : 'Error al obtener la grabación.');
      }
    } finally {
      setStreamLoading(false);
    }
  };

  const handleBuyTicket = async () => {
    setBuying(true);
    setError(null);
    try {
      await ticketsService.createTicket(eventId);
      setHasTicket(true);
      Alert.alert('¡Éxito!', 'Entrada obtenida correctamente. Podés verla en la pestaña Entrada.');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al obtener la entrada.');
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#A78BFA" size="large" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.screen}>
        <ErrorBanner message={error ?? 'Evento no encontrado.'} />
      </View>
    );
  }

  const canWatch = event.mode === 'STREAMING' || event.mode === 'HIBRIDO';
  const canGetTicket = event.mode === 'PRESENCIAL' || event.mode === 'HIBRIDO';

  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={{ paddingBottom: 40 }}>
      <Image 
        source={{ uri: `https://picsum.photos/seed/${event.id}/800/400` }} 
        style={styles.detailImage} 
      />
      
      <View style={styles.eventHeader}>
        {event.isLive && (
          <View style={styles.livePill}>
            <Text style={styles.livePillText}>● EN VIVO AHORA</Text>
          </View>
        )}
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.meta}>{formatDate(event.date)}</Text>
        {event.location && <Text style={styles.meta}>📍 {event.location}</Text>}
        <Text style={styles.badge}>{modeLabel(event.mode)}</Text>
      </View>

      <Text style={styles.description}>{event.description}</Text>

      {canWatch && (
        <View style={{ marginTop: 24 }}>
          {streamData ? (
            <View style={styles.streamInfo}>
              <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
              <Text style={styles.streamInfoText}>
                {event.isLive ? 'Stream listo' : 'Grabación lista'} — URL válida por 1 hora
              </Text>
              <Text style={styles.streamUrl} numberOfLines={1}>{(streamData as any).hlsUrl}</Text>
            </View>
          ) : event.isLive ? (
            <Pressable
              style={[styles.primaryButton, streamLoading && styles.buttonDisabled]}
              onPress={handleWatchLive}
              disabled={streamLoading}
            >
              {streamLoading
                ? <ActivityIndicator color="#FFF" />
                : (
                  <View style={styles.btnRow}>
                    <Ionicons name="radio" size={20} color="#FFF" />
                    <Text style={styles.primaryButtonText}>Ver en vivo</Text>
                  </View>
                )
              }
            </Pressable>
          ) : recordings.length > 0 ? (
            <View style={{ gap: 10 }}>
              {recordings.map((rec) => (
                <Pressable
                  key={rec.id}
                  style={[styles.primaryButton, streamLoading && styles.buttonDisabled]}
                  onPress={() => handleWatchRecording(rec.id)}
                  disabled={streamLoading}
                >
                  {streamLoading
                    ? <ActivityIndicator color="#FFF" />
                    : (
                      <View style={styles.btnRow}>
                        <Ionicons name="play-circle" size={20} color="#FFF" />
                        <Text style={styles.primaryButtonText}>{rec.title}</Text>
                      </View>
                    )
                  }
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.errorText}>Este evento no tiene streaming configurado.</Text>
            </View>
          )}
          {streamError && <ErrorBanner message={streamError} />}
        </View>
      )}

      {canGetTicket && (
        hasTicket ? (
          <Pressable
            style={[styles.secondaryButton, { marginTop: 14 }]}
            onPress={() => navigation.navigate('Tabs', { screen: 'Entrada', params: { eventId } })}
          >
            <View style={styles.btnRow}>
              <Ionicons name="qr-code" size={20} color="#A78BFA" />
              <Text style={styles.secondaryButtonText}>Mi entrada QR</Text>
            </View>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.primaryButton, { marginTop: 14, backgroundColor: '#10B981' }, buying && styles.buttonDisabled]}
            onPress={handleBuyTicket}
            disabled={buying}
          >
            {buying ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <View style={styles.btnRow}>
                <Ionicons name="ticket" size={20} color="#FFF" />
                <Text style={styles.primaryButtonText}>Obtener Entrada</Text>
              </View>
            )}
          </Pressable>
        )
      )}
    </ScrollView>
  );
}
