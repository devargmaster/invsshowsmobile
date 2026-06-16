import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { globalStyles as styles } from '../theme/globalStyles';

export function ProfileScreen() {
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
