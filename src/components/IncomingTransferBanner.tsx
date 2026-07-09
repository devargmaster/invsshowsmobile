import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ticketsService } from '../services/ticketsService';
import type { IncomingTransfer } from '../types/tickets';
import { ENV } from '../config/env';
import { globalStyles as styles } from '../theme/globalStyles';

/**
 * Banner de "te compartieron una entrada". Aceptarla siempre se resuelve en
 * la web (no hay deep linking nativo configurado en v1) — este banner solo
 * avisa y abre el link de aceptación en el navegador del dispositivo.
 */
export function IncomingTransferBanner() {
  const [transfers, setTransfers] = useState<IncomingTransfer[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    ticketsService.getIncomingTransfers().then(setTransfers).catch(() => setTransfers([]));
  }, []);

  const visible = transfers.filter((t) => !dismissed.includes(t.id));
  if (visible.length === 0) return null;

  const transfer = visible[0];

  return (
    <View style={styles.incomingBanner}>
      <Ionicons name="mail-unread-outline" size={20} color="#A78BFA" />
      <Text style={styles.incomingBannerText}>
        <Text style={{ fontWeight: '800' }}>{transfer.fromUser.fullName}</Text> te compartió una entrada para {transfer.ticket.event.title}
      </Text>
      <Pressable
        style={styles.incomingBannerAction}
        onPress={() => Linking.openURL(`${ENV.WEB_BASE_URL}/transfers/${transfer.token}`)}
      >
        <Text style={styles.incomingBannerActionText}>Ver</Text>
      </Pressable>
      <Pressable onPress={() => setDismissed((prev) => [...prev, transfer.id])} hitSlop={8}>
        <Ionicons name="close" size={18} color="#8F8FA3" />
      </Pressable>
    </View>
  );
}
