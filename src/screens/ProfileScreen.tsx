import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { globalStyles as styles } from '../theme/globalStyles';
import type { AuthUser } from '../types/auth';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<AuthUser | null>(user);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      authService.getMe()
        .then(data => setProfile(data))
        .catch(() => setProfile(user))
        .finally(() => setLoading(false));
    }, [user])
  );

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que querés salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Perfil</Text>

      {loading ? (
        <ActivityIndicator color="#A78BFA" style={{ marginVertical: 20 }} />
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.meta}>Nombre</Text>
            <Text style={styles.cardTitle}>{profile?.fullName ?? '—'}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.meta}>Email</Text>
            <Text style={styles.cardTitle}>{profile?.email ?? '—'}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.meta}>Rol</Text>
            <Text style={styles.badge}>{profile?.role ?? '—'}</Text>
          </View>
        </>
      )}

      <Pressable style={styles.dangerButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#EF4444" />
        <Text style={styles.dangerButtonText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}
