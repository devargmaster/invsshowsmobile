import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ticketsService } from '../services/ticketsService';
import { ApiError } from '../services/apiClient';
import type { RedeemableAddon } from '../types/tickets';
import { globalStyles as styles } from '../theme/globalStyles';

export function ScannerScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; detail?: string } | null>(null);
  const [addons, setAddons] = useState<RedeemableAddon[]>([]);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

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
      setAddons(res.addons ?? []);
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
    setAddons([]);
  };

  const handleRedeem = async (orderAddonId: string) => {
    setRedeemingId(orderAddonId);
    try {
      const updated = await ticketsService.redeemAddon(orderAddonId);
      setAddons((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (e) {
      if (e instanceof ApiError) {
        // Otro staff pudo haber entregado en simultáneo.
        setAddons((prev) => prev.map((a) => (a.id === orderAddonId ? { ...a, pending: 0, redeemedCount: a.quantity } : a)));
      }
    } finally {
      setRedeemingId(null);
    }
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

          {result.ok && addons.length > 0 && (
            <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderColor: '#2D2D45', alignSelf: 'stretch' }}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14, marginBottom: 8 }}>
                🎁 Adicionales de la compra
              </Text>
              {addons.map((a) => (
                <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 6 }}>
                  <Text style={{ color: '#D1D1E0', fontSize: 13, flex: 1 }}>
                    {a.name}
                    {a.variant ? ` — ${a.variant}` : ''}
                    <Text style={{ color: '#8F8FA3', fontSize: 12 }}>
                      {a.pending > 0 ? `  ·  ${a.pending} de ${a.quantity} sin entregar` : '  ·  todo entregado'}
                    </Text>
                  </Text>
                  {a.pending > 0 && (
                    <Pressable
                      style={{ backgroundColor: '#7C3AED', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, opacity: redeemingId === a.id ? 0.6 : 1 }}
                      onPress={() => handleRedeem(a.id)}
                      disabled={redeemingId === a.id}
                    >
                      <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 12 }}>
                        {redeemingId === a.id ? 'Entregando...' : 'Entregar 1'}
                      </Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          )}

          <Pressable style={[styles.primaryButton, { marginTop: 20 }]} onPress={reset}>
            <Text style={styles.primaryButtonText}>Escanear otro</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
