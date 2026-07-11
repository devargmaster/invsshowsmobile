import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StreamPlayer } from '../components/StreamPlayer';
import { ErrorBanner } from '../components/ErrorBanner';
import { streamingService } from '../services/streamingService';
import { ApiError } from '../services/apiClient';
import { formatMoney } from '../utils/formatters';
import type { RecordingWithAccess } from '../types/content';
import type { RecordingTokenResponse } from '../types/streaming';
import { globalStyles as styles } from '../theme/globalStyles';

export function StreamingHubScreen({ navigation }: any) {
  const [recordings, setRecordings] = useState<RecordingWithAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [playing, setPlaying] = useState<{ recording: RecordingWithAccess; data: RecordingTokenResponse } | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playError, setPlayError] = useState<string | null>(null);

  const load = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    streamingService.getRecordings()
      .then(setRecordings)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Error cargando el catálogo.'))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleWatch = async (rec: RecordingWithAccess) => {
    setPlayingId(rec.id);
    setPlayError(null);
    try {
      const data = await streamingService.getRecordingToken(rec.id);
      setPlaying({ recording: rec, data });
    } catch (e) {
      setPlayError(e instanceof ApiError ? e.message : 'Error al reproducir el contenido.');
    } finally {
      setPlayingId(null);
    }
  };

  const handleBuy = (rec: RecordingWithAccess) => {
    if (!rec.availableAccess.purchase) return;
    navigation.navigate('ContentCheckout', {
      type: 'recording', id: rec.id, title: rec.title,
      priceCents: rec.availableAccess.purchase.priceCents, currency: rec.availableAccess.purchase.currency,
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#A78BFA" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#A78BFA" colors={['#A78BFA']} />}
      >
        <Text style={styles.title}>Streaming</Text>
        <Text style={styles.streamingSubtitle}>
          Transmisiones y videos de INVS — algunos son gratis, otros incluidos en tu suscripción o para comprar sueltos.
        </Text>

        {error && <ErrorBanner message={error} onRetry={() => load()} />}
        {playError && <ErrorBanner message={playError} />}

        {recordings.length === 0 ? (
          <Text style={styles.emptyText}>Todavía no hay contenido disponible.</Text>
        ) : (
          recordings.map((rec) => {
            const canBuy = !rec.granted && !!rec.availableAccess.purchase;
            const subscriptionOnly = !rec.granted && !canBuy && rec.availableAccess.subscription;

            return (
              <View style={styles.contentCard} key={rec.id}>
                <View style={styles.contentCardMedia}>
                  {rec.thumbnailUrl && <Image source={{ uri: rec.thumbnailUrl }} style={{ width: '100%', height: '100%' }} />}
                  {rec.isFree && (
                    <View style={styles.contentCardBadge}>
                      <Text style={styles.contentCardBadgeText}>GRATIS</Text>
                    </View>
                  )}
                </View>
                <View style={styles.contentCardBody}>
                  <Text style={styles.contentCardTitle}>{rec.title}</Text>
                  {rec.event && <Text style={styles.contentCardMeta}>De: {rec.event.title}</Text>}
                  {rec.description && <Text style={styles.contentCardDesc}>{rec.description}</Text>}

                  {rec.granted ? (
                    <Pressable
                      style={[styles.contentCardCta, styles.contentCardCtaPrimary]}
                      onPress={() => handleWatch(rec)}
                      disabled={playingId === rec.id}
                    >
                      {playingId === rec.id ? <ActivityIndicator color="#FFF" /> : (
                        <>
                          <Ionicons name="play" size={16} color="#FFF" />
                          <Text style={styles.contentCardCtaText}>Ver</Text>
                        </>
                      )}
                    </Pressable>
                  ) : canBuy ? (
                    <Pressable style={[styles.contentCardCta, styles.contentCardCtaBuy]} onPress={() => handleBuy(rec)}>
                      <Text style={styles.contentCardCtaTextBuy}>
                        Comprar {formatMoney(rec.availableAccess.purchase!.priceCents, rec.availableAccess.purchase!.currency)}
                      </Text>
                    </Pressable>
                  ) : subscriptionOnly ? (
                    <Text style={styles.contentCardNote}>Incluido con una suscripción activa.</Text>
                  ) : (
                    <Text style={styles.contentCardNote}>No disponible por el momento.</Text>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {playing && (
        <View style={styles.playerOverlay}>
          <Pressable style={styles.playerClose} onPress={() => setPlaying(null)}>
            <Ionicons name="close" size={22} color="#FFF" />
          </Pressable>
          <StreamPlayer
            playbackUrl={playing.data.hlsUrl ?? playing.data.playbackUrl}
            providerType={playing.data.providerType}
            type="replay"
            title={playing.recording.title}
          />
        </View>
      )}
    </View>
  );
}
