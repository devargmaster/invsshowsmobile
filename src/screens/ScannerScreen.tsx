import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ticketsService } from '../services/ticketsService';
import { ApiError } from '../services/apiClient';
import { globalStyles as styles } from '../theme/globalStyles';

export function ScannerScreen() {
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
