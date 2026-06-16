import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View, Text, TextInput, Pressable, FlatList,
  StyleSheet, ActivityIndicator, ScrollView, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { eventsService } from './src/services/eventsService';
import { ticketsService } from './src/services/ticketsService';
import { streamingService } from './src/services/streamingService';
import { ApiError } from './src/services/apiClient';
import type { Event } from './src/types/events';
import type { Ticket } from './src/types/tickets';
import type { StreamingTokenResponse, RecordingTokenResponse, Recording } from './src/types/streaming';

// ─── Navigation types ────────────────────────────────────────────────────────
type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
  EventDetail: { eventId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function modeLabel(mode: string): string {
  return mode === 'PRESENCIAL' ? 'Presencial'
    : mode === 'STREAMING' ? 'Streaming'
    : 'Híbrido';
}

// ─── Componente: Error banner ────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.errorBox}>
      <Ionicons name="alert-circle" size={20} color="#EF4444" />
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} style={styles.retryBtn}>
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREENS
// ─────────────────────────────────────────────────────────────────────────────

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ navigation }: any) {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('demo@invs.app');
  const [password, setPassword] = useState('Demo123!');

  const handleLogin = async () => {
    try {
      await login(email, password);
      navigation.replace('Tabs');
    } catch {
      // error ya seteado en el context
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>INVS</Text>
      <Text style={styles.subtitle}>Experiencias, eventos y contenidos digitales.</Text>

      {error && <ErrorBanner message={error} />}

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor="#8F8FA3"
        editable={!isLoading}
      />

      <TextInput
        style={[styles.input, { marginTop: 12 }]}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Contraseña"
        placeholderTextColor="#8F8FA3"
        editable={!isLoading}
      />

      <Pressable
        style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading
          ? <ActivityIndicator color="#FFF" />
          : <Text style={styles.primaryButtonText}>Ingresar</Text>
        }
      </Pressable>
    </View>
  );
}

// ── Eventos ───────────────────────────────────────────────────────────────────
function EventsScreen({ navigation }: any) {
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

// ── Detalle de evento ──────────────────────────────────────────────────────────
function EventDetailScreen({ route, navigation }: any) {
  const { eventId } = route.params as { eventId: string };
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Grabaciones del evento
  const [recordings, setRecordings] = useState<Recording[]>([]);

  // Streaming (live o recording)
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

  // Cargar grabaciones cuando el evento está listo
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
      
      {/* Header del evento */}
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

      {/* Botón streaming / grabación */}
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
            // Evento EN VIVO
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
            // Grabaciones disponibles
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
            // Sin stream ni grabaciones
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.errorText}>Este evento no tiene streaming configurado.</Text>
            </View>
          )}
          {streamError && <ErrorBanner message={streamError} />}
        </View>
      )}

      {/* Botón ir a QR si el evento es presencial */}
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
                <Text style={styles.primaryButtonText}>Obtener Entrada Gratis</Text>
              </View>
            )}
          </Pressable>
        )
      )}
    </ScrollView>
  );
}

// ── Ticket QR ─────────────────────────────────────────────────────────────────
function TicketScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Ticket | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ticketsService.getMyTickets();
      setTickets(data);
      if (data.length > 0 && !selected) setSelected(data[0]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error cargando tickets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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

// ── Scanner Staff ──────────────────────────────────────────────────────────────
function ScannerScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; detail?: string } | null>(null);

  // Solo staff/admin pueden ver esto
  if (user && user.role === 'USER') {
    return (
      <View style={styles.centerScreen}>
        <Ionicons name="lock-closed" size={48} color="#3D3D5C" />
        <Text style={styles.title}>Acceso restringido</Text>
        <Text style={styles.noteCenter}>Esta sección es solo para personal de INVS.</Text>
      </View>
    );
  }

  const handleScan = async (data: string) => {
    if (scannedValue) return;
    setScannedValue(data);
    setValidating(true);
    setResult(null);
    try {
      const res = await ticketsService.validateQr(data);
      setResult({
        ok: true,
        message: '✅ ACCESO PERMITIDO',
        detail: res.ticket ? `${res.ticket.attendee} — ${res.ticket.event}` : undefined,
      });
    } catch (e) {
      if (e instanceof ApiError) {
        const isUsed = e.statusCode === 409;
        setResult({
          ok: false,
          message: isUsed ? '⛔ QR YA UTILIZADO' : '❌ ACCESO DENEGADO',
          detail: e.message,
        });
      } else {
        setResult({ ok: false, message: '❌ Error de conexión', detail: 'Verificá la red.' });
      }
    } finally {
      setValidating(false);
    }
  };

  const reset = () => {
    setScannedValue(null);
    setResult(null);
  };

  if (!permission) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator color="#A78BFA" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.title}>Permiso de cámara</Text>
        <Text style={styles.noteCenter}>INVS necesita usar la cámara para escanear códigos QR.</Text>
        <Pressable style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Permitir cámara</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Escáner Staff</Text>

      {!scannedValue && (
        <View style={styles.cameraBox}>
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => handleScan(data)}
          />
          <View style={styles.scanFrame} />
        </View>
      )}

      {validating && (
        <View style={styles.resultBox}>
          <ActivityIndicator color="#A78BFA" size="large" />
          <Text style={styles.noteCenter}>Validando contra el servidor...</Text>
        </View>
      )}

      {result && (
        <View style={[styles.resultBox, result.ok ? styles.resultOk : styles.resultFail]}>
          <Text style={[styles.resultTitle, { color: result.ok ? '#22C55E' : '#EF4444' }]}>
            {result.message}
          </Text>
          {result.detail && <Text style={styles.resultDetail}>{result.detail}</Text>}
          <Pressable style={[styles.primaryButton, { marginTop: 20 }]} onPress={reset}>
            <Text style={styles.primaryButtonText}>Escanear otro</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ── Perfil ────────────────────────────────────────────────────────────────────
function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que querés salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.card}>
        <Text style={styles.meta}>Nombre</Text>
        <Text style={styles.cardTitle}>{user?.fullName ?? '—'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.meta}>Email</Text>
        <Text style={styles.cardTitle}>{user?.email ?? '—'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.meta}>Rol</Text>
        <Text style={styles.badge}>{user?.role ?? '—'}</Text>
      </View>

      <Pressable style={styles.dangerButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#EF4444" />
        <Text style={styles.dangerButtonText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

// ─── Tabs (dinámicos según rol) ────────────────────────────────────────────────
function Tabs() {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#0B0B12' },
        headerTintColor: '#FFFFFF',
        tabBarStyle: { backgroundColor: '#0B0B12', borderTopColor: '#181827' },
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#8F8FA3',
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, string> = {
            Eventos: 'calendar',
            Entrada: 'qr-code',
            Staff: 'scan',
            Perfil: 'person',
          };
          return <Ionicons name={(iconMap[route.name] ?? 'ellipse') as any} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Eventos" component={EventsScreen} />
      <Tab.Screen name="Entrada" component={TicketScreen} />
      {isStaff && <Tab.Screen name="Staff" component={ScannerScreen} />}
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#0B0B12' },
            headerTintColor: '#FFFFFF',
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Evento' }} />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </AuthProvider>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0B0B12' },
  screen: { flex: 1, padding: 20, backgroundColor: '#0B0B12' },
  screenScroll: { flex: 1, backgroundColor: '#0B0B12', padding: 20 },
  centerScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#0B0B12' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0B12', gap: 12 },

  logo: { color: '#FFFFFF', fontSize: 52, fontWeight: '900', letterSpacing: 5 },
  subtitle: { color: '#B9B9C8', fontSize: 16, marginTop: 8, marginBottom: 32 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginBottom: 20 },
  loadingText: { color: '#8F8FA3', fontSize: 14 },
  emptyText: { color: '#8F8FA3', textAlign: 'center', marginTop: 40, fontSize: 15 },

  input: {
    backgroundColor: '#181827', borderRadius: 12, padding: 14,
    marginBottom: 0, color: '#FFF', borderWidth: 1, borderColor: '#2D2D45',
  },

  primaryButton: {
    backgroundColor: '#7C3AED', borderRadius: 12, padding: 16,
    alignItems: 'center', justifyContent: 'center', marginTop: 18,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },

  secondaryButton: {
    borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#7C3AED',
  },
  secondaryButtonText: { color: '#A78BFA', fontWeight: '700', fontSize: 15 },

  dangerButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 32, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#3D1515',
  },
  dangerButtonText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },

  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  note: { color: '#8F8FA3', fontSize: 12, marginTop: 16, lineHeight: 18 },
  noteCenter: { color: '#B9B9C8', textAlign: 'center', marginTop: 16, lineHeight: 20 },

  card: { backgroundColor: '#181827', borderRadius: 16, marginBottom: 14, overflow: 'hidden' },
  cardImage: { width: '100%', height: 160, backgroundColor: '#2D2D45' },
  cardContent: { padding: 18 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', flex: 1 },
  meta: { color: '#B9B9C8', marginTop: 5, fontSize: 13 },
  badge: { color: '#C4B5FD', marginTop: 10, fontWeight: '800' },
  description: { color: '#D1D1E0', fontSize: 15, lineHeight: 24, marginTop: 8 },

  detailImage: { width: '100%', height: 220, backgroundColor: '#2D2D45', marginBottom: 16, borderRadius: 16 },

  livePill: {
    backgroundColor: '#7F1D1D', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8,
  },
  livePillText: { color: '#FCA5A5', fontSize: 11, fontWeight: '800' },

  eventHeader: { marginBottom: 8 },

  qrWrapper: { alignItems: 'center', marginTop: 20 },
  qrBox: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 20 },

  usedOverlay: { alignItems: 'center', gap: 8, padding: 24 },
  usedText: { color: '#EF4444', fontWeight: '900', fontSize: 18, letterSpacing: 1 },

  tabChip: {
    marginRight: 10, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#181827',
  },
  tabChipActive: { backgroundColor: '#7C3AED' },
  tabChipText: { color: '#8F8FA3', fontSize: 13, fontWeight: '600' },
  tabChipTextActive: { color: '#FFF' },

  cameraBox: {
    height: 300, borderRadius: 20, overflow: 'hidden',
    backgroundColor: '#181827', position: 'relative', marginBottom: 20,
  },
  scanFrame: {
    position: 'absolute', top: '25%', left: '25%',
    width: '50%', height: '50%',
    borderWidth: 2, borderColor: '#A78BFA', borderRadius: 12,
  },

  resultBox: {
    backgroundColor: '#181827', padding: 24, borderRadius: 20,
    alignItems: 'center', marginTop: 8,
  },
  resultOk: { borderWidth: 1, borderColor: '#14532D' },
  resultFail: { borderWidth: 1, borderColor: '#7F1D1D' },
  resultTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  resultDetail: { color: '#B9B9C8', marginTop: 10, textAlign: 'center', fontSize: 14 },

  errorBox: {
    backgroundColor: '#1C0A0A', borderRadius: 12, padding: 14,
    flexDirection: 'column', gap: 6, marginBottom: 16, borderWidth: 1, borderColor: '#3D1515',
  },
  errorText: { color: '#FCA5A5', fontSize: 13, lineHeight: 18 },
  retryBtn: { alignSelf: 'flex-start', marginTop: 4 },
  retryText: { color: '#A78BFA', fontWeight: '700', fontSize: 13 },

  streamInfo: {
    backgroundColor: '#0A1F0A', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#14532D', gap: 6,
  },
  streamInfoText: { color: '#86EFAC', fontWeight: '700', fontSize: 14 },
  streamUrl: { color: '#6EE7B7', fontSize: 11 },
});
