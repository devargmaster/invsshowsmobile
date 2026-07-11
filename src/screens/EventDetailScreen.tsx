import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/ErrorBanner';
import { eventsService } from '../services/eventsService';
import { ticketsService } from '../services/ticketsService';
import { streamingService } from '../services/streamingService';
import { ApiError } from '../services/apiClient';
import type { Event } from '../types/events';
import type { StreamingTokenResponse, RecordingTokenResponse } from '../types/streaming';
import type { RecordingWithAccess, AvailableAccess } from '../types/content';
import { formatDate, modeLabel, formatMoney } from '../utils/formatters';
import { globalStyles as styles } from '../theme/globalStyles';

/** Arma un mensaje a partir del `availableAccess` que manda el backend en
 * el 403 — reemplaza el viejo mensaje fijo de "necesitás suscripción". */
function describeAccessDenial(availableAccess: AvailableAccess | undefined): { message: string; canBuy: boolean } {
  if (!availableAccess) return { message: 'No tenés acceso a este contenido.', canBuy: false };
  const parts: string[] = [];
  if (availableAccess.subscription) parts.push('suscribirte');
  if (availableAccess.purchase) parts.push(`comprarlo por ${formatMoney(availableAccess.purchase.priceCents, availableAccess.purchase.currency)}`);
  if (parts.length === 0) return { message: 'Este contenido no está disponible por el momento.', canBuy: false };
  return { message: `Para acceder podés ${parts.join(' o ')}.`, canBuy: !!availableAccess.purchase };
}

export function EventDetailScreen({ route, navigation }: any) {
  const { eventId } = route.params as { eventId: string };
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recordings, setRecordings] = useState<RecordingWithAccess[]>([]);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamData, setStreamData] = useState<StreamingTokenResponse | RecordingTokenResponse | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [streamBuyOption, setStreamBuyOption] = useState<{ type: 'recording' | 'event'; id: string; title: string; priceCents: number; currency: string } | null>(null);

  const [hasTickets, setHasTickets] = useState(false);

  useEffect(() => {
    eventsService.getById(eventId)
      .then(setEvent)
      .catch(e => setError(e instanceof ApiError ? e.message : 'Error cargando evento.'))
      .finally(() => setLoading(false));

    ticketsService.getTicketsForEvent(eventId)
      .then(tickets => setHasTickets(tickets.length > 0))
      .catch(() => setHasTickets(false));
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
    if (!event) return;
    setStreamLoading(true);
    setStreamError(null);
    setStreamBuyOption(null);
    try {
      const data = await streamingService.getLiveToken(eventId);
      setStreamData(data);
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 403) {
        const availableAccess = (e.body as { availableAccess?: AvailableAccess })?.availableAccess;
        const { message, canBuy } = describeAccessDenial(availableAccess);
        setStreamError(message);
        if (canBuy && availableAccess?.purchase) {
          setStreamBuyOption({
            type: 'event', id: eventId, title: event.title,
            priceCents: availableAccess.purchase.priceCents, currency: availableAccess.purchase.currency,
          });
        }
      } else {
        setStreamError(e instanceof ApiError ? e.message : 'Error al obtener el stream.');
      }
    } finally {
      setStreamLoading(false);
    }
  };

  const handleWatchRecording = async (recording: RecordingWithAccess) => {
    setStreamLoading(true);
    setStreamError(null);
    setStreamBuyOption(null);
    try {
      const data = await streamingService.getRecordingToken(recording.id);
      setStreamData(data);
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 403) {
        const availableAccess = (e.body as { availableAccess?: AvailableAccess })?.availableAccess;
        const { message, canBuy } = describeAccessDenial(availableAccess);
        setStreamError(message);
        if (canBuy && availableAccess?.purchase) {
          setStreamBuyOption({
            type: 'recording', id: recording.id, title: recording.title,
            priceCents: availableAccess.purchase.priceCents, currency: availableAccess.purchase.currency,
          });
        }
      } else {
        setStreamError(e instanceof ApiError ? e.message : 'Error al obtener la grabación.');
      }
    } finally {
      setStreamLoading(false);
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
                  onPress={() => handleWatchRecording(rec)}
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
          {streamBuyOption && (
            <Pressable
              style={[styles.secondaryButton, { marginTop: 10 }]}
              onPress={() => navigation.navigate('ContentCheckout', streamBuyOption)}
            >
              <Text style={styles.secondaryButtonText}>
                Comprar acceso — {formatMoney(streamBuyOption.priceCents, streamBuyOption.currency)}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {canGetTicket && (
        <>
          {hasTickets && (
            <Pressable
              style={[styles.secondaryButton, { marginTop: 14 }]}
              onPress={() => navigation.navigate('Tabs', { screen: 'Compras' })}
            >
              <View style={styles.btnRow}>
                <Ionicons name="qr-code" size={20} color="#A78BFA" />
                <Text style={styles.secondaryButtonText}>Ver mis entradas</Text>
              </View>
            </Pressable>
          )}
          <Pressable
            style={[styles.primaryButton, { marginTop: 14, backgroundColor: '#10B981' }]}
            onPress={() => navigation.navigate('CheckoutCategories', { eventId })}
          >
            <View style={styles.btnRow}>
              <Ionicons name="ticket" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>Comprar entradas</Text>
            </View>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
