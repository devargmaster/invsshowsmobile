import React, { useState, useMemo } from 'react';
import { Modal, View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ticketsService } from '../services/ticketsService';
import { ApiError } from '../services/apiClient';
import { globalStyles as styles } from '../theme/globalStyles';

interface ShareTicketModalProps {
  visible: boolean;
  ticketId: string;
  ticketLabel: string;
  onClose: () => void;
  onSent: () => void;
}

export function ShareTicketModal({ visible, ticketId, ticketLabel, onClose, onSent }: ShareTicketModalProps) {
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedA = email.trim().toLowerCase();
  const normalizedB = confirmEmail.trim().toLowerCase();
  const bothFilled = normalizedA.length > 0 && normalizedB.length > 0;
  const emailsMatch = bothFilled && normalizedA === normalizedB;

  const canSubmit = useMemo(() => emailsMatch && /\S+@\S+\.\S+/.test(normalizedA), [emailsMatch, normalizedA]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await ticketsService.createTransfer(ticketId, normalizedA);
      setEmail('');
      setConfirmEmail('');
      onSent();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al compartir la entrada.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          <Text style={styles.modalTitle}>Compartir {ticketLabel}</Text>
          <Text style={styles.modalDesc}>
            Enviamos la entrada al email indicado. La persona la acepta desde su cuenta INVS.
          </Text>

          <Text style={styles.modalLabel}>Email del destinatario</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="lucia.perez@gmail.com"
            placeholderTextColor="#5A5A72"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.modalLabel}>Confirmar email</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Repetí el email"
            placeholderTextColor="#5A5A72"
            value={confirmEmail}
            onChangeText={setConfirmEmail}
          />

          {bothFilled && (
            <Text style={emailsMatch ? styles.modalMatchOk : styles.modalMatchError}>
              {emailsMatch ? '✓ Los emails coinciden' : '✗ Los emails no coinciden'}
            </Text>
          )}

          {error && <Text style={styles.modalMatchError}>{error}</Text>}

          <Pressable
            style={[styles.modalSubmit, (!canSubmit || submitting) && styles.buttonDisabled]}
            disabled={!canSubmit || submitting}
            onPress={handleSubmit}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={18} color="#FFF" />
                <Text style={styles.modalSubmitText}>Enviar entrada</Text>
              </>
            )}
          </Pressable>

          <Pressable style={styles.modalCancel} onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
