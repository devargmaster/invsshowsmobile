import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ordersService } from '../services/ordersService';
import type { BankTransferInfo, PickedProofFile } from '../services/ordersService';
import { ApiError } from '../services/apiClient';
import { ErrorBanner } from '../components/ErrorBanner';
import { globalStyles as styles } from '../theme/globalStyles';

export function CheckoutTransferScreen({ route, navigation }: any) {
  const { orderId } = route.params as { orderId: string };

  const [bankInfo, setBankInfo] = useState<BankTransferInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<PickedProofFile | null>(null);
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ordersService.getBankTransferInfo()
      .then(setBankInfo)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Error cargando datos bancarios.'))
      .finally(() => setLoading(false));
  }, []);

  const handlePickFile = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tus fotos para subir el comprobante.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || result.assets.length === 0) return;
    const asset = result.assets[0];
    const name = asset.fileName ?? asset.uri.split('/').pop() ?? 'comprobante.jpg';
    const type = asset.mimeType ?? 'image/jpeg';
    setFile({ uri: asset.uri, name, type });
  };

  const handleSubmit = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      await ordersService.uploadTransferProof(orderId, file, reference || undefined);
      navigation.replace('OrderConfirmation', { orderId });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al subir el comprobante.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#A78BFA" size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.checkoutStep}>Pago por transferencia</Text>
      <Text style={styles.title}>Datos para transferir</Text>
      <Text style={styles.checkoutSubtitle}>
        Tus entradas quedan pendientes hasta que validemos el pago — te avisamos por mail.
      </Text>

      {bankInfo && (
        <View style={styles.checkoutBankInfo}>
          <View style={styles.checkoutBankRow}>
            <Text style={styles.checkoutBankRowLabel}>Banco</Text>
            <Text style={styles.checkoutBankRowValue}>{bankInfo.bankName}</Text>
          </View>
          <View style={styles.checkoutBankRow}>
            <Text style={styles.checkoutBankRowLabel}>Titular</Text>
            <Text style={styles.checkoutBankRowValue}>{bankInfo.accountHolder}</Text>
          </View>
          <View style={styles.checkoutBankRow}>
            <Text style={styles.checkoutBankRowLabel}>CBU</Text>
            <Text style={styles.checkoutBankRowValue}>{bankInfo.cbu}</Text>
          </View>
          <View style={styles.checkoutBankRow}>
            <Text style={styles.checkoutBankRowLabel}>Alias</Text>
            <Text style={styles.checkoutBankRowValue}>{bankInfo.alias}</Text>
          </View>
          <View style={styles.checkoutBankRow}>
            <Text style={styles.checkoutBankRowLabel}>CUIT</Text>
            <Text style={styles.checkoutBankRowValue}>{bankInfo.cuit}</Text>
          </View>
        </View>
      )}

      <Text style={styles.checkoutFieldLabel}>Comprobante de transferencia</Text>
      <Pressable style={[styles.checkoutFileInput, file && styles.checkoutFileInputFilled]} onPress={handlePickFile}>
        <Ionicons name="cloud-upload-outline" size={22} color={file ? '#A78BFA' : '#8F8FA3'} />
        <Text style={styles.checkoutFileInputText}>{file ? file.name : 'Tocá para elegir una foto del comprobante'}</Text>
      </Pressable>

      <Text style={styles.checkoutFieldLabel}>Número de operación (opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 000123456789"
        placeholderTextColor="#5A5A72"
        value={reference}
        onChangeText={setReference}
      />

      {error && <ErrorBanner message={error} />}

      <Pressable
        style={[styles.primaryButton, (submitting || !file) && styles.buttonDisabled, { marginTop: 16 }]}
        onPress={handleSubmit}
        disabled={submitting || !file}
      >
        {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Enviar comprobante</Text>}
      </Pressable>
    </ScrollView>
  );
}
