import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/ErrorBanner';
import { ENV } from '../config/env';
import { globalStyles as styles } from '../theme/globalStyles';

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen({ navigation }: any) {
  const { login, loginWithGoogle, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sin GOOGLE_CLIENT_ID configurado el botón directamente no se muestra
  // (mismo criterio que el pago con tarjeta cuando falta Openpay) — el
  // hook igual se llama siempre (regla de hooks), solo no se usa.
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: ENV.GOOGLE_CLIENT_ID || 'not-configured',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        loginWithGoogle(idToken)
          .then(() => navigation.replace('Tabs'))
          .catch(() => {
            // error ya seteado en el context
          });
      }
    }
  }, [response]);

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

      {!!ENV.GOOGLE_CLIENT_ID && (
        <>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>
          <Pressable
            style={[styles.googleButton, !request && styles.buttonDisabled]}
            onPress={() => promptAsync()}
            disabled={!request || isLoading}
          >
            <Ionicons name="logo-google" size={18} color="#FFF" />
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
