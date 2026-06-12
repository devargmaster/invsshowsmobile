import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { WebView } from 'react-native-webview';
import type { ProviderType } from '../types/streaming';

interface StreamPlayerProps {
  playbackUrl: string;
  providerType?: ProviderType;
  type: 'live' | 'replay';
  title?: string;
}

/**
 * Player de video que soporta múltiples proveedores:
 *
 * - Mux / HLS: usa expo-video con streaming HLS nativo
 * - YouTube: usa WebView con embed de YouTube
 * - Vimeo: usa WebView con embed de Vimeo (futuro)
 *
 * El providerType viene del backend en la respuesta de playback.
 * La app nunca decide qué proveedor usar — solo renderiza lo que el backend indica.
 */
export function StreamPlayer({ playbackUrl, providerType = 'mux', type, title }: StreamPlayerProps) {
  const isEmbed = providerType === 'youtube' || providerType === 'vimeo';

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <View style={[styles.badge, type === 'live' ? styles.badgeLive : styles.badgeReplay]}>
            <Text style={styles.badgeText}>{type === 'live' ? '● EN VIVO' : '▶ REPLAY'}</Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </View>
      )}

      {isEmbed ? (
        <YouTubeEmbed url={playbackUrl} />
      ) : (
        <HlsPlayer url={playbackUrl} type={type} />
      )}

      <View style={styles.footer}>
        <Text style={styles.provider}>
          {providerType === 'mux' ? '⚡ Mux Video'
            : providerType === 'youtube' ? '▶ YouTube'
            : providerType === 'vimeo' ? '🎞 Vimeo'
            : providerType}
        </Text>
      </View>
    </View>
  );
}

// ─── HLS Player (Mux / Vimeo HLS) ────────────────────────────────────────────
function HlsPlayer({ url, type }: { url: string; type: 'live' | 'replay' }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = type === 'live';
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.video}
      allowsFullscreen
      allowsPictureInPicture
    />
  );
}

// ─── YouTube Embed Player ─────────────────────────────────────────────────────
function YouTubeEmbed({ url }: { url: string }) {
  // Asegurar que la URL tenga los parámetros correctos para embed
  const embedUrl = url.includes('youtube.com/embed')
    ? `${url}&autoplay=1&rel=0&modestbranding=1&playsinline=1`
    : url;

  return (
    <WebView
      style={styles.video}
      source={{ uri: embedUrl }}
      allowsFullscreenVideo
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
    />
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    backgroundColor: '#0B0B12',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeLive: { backgroundColor: '#EF4444' },
  badgeReplay: { backgroundColor: '#7C3AED' },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  title: { color: '#FFF', fontSize: 14, fontWeight: '600', flex: 1 },
  video: { width: '100%', aspectRatio: 16 / 9 },
  footer: {
    backgroundColor: '#0B0B12',
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'flex-end',
  },
  provider: { color: '#8F8FA3', fontSize: 11 },
});
