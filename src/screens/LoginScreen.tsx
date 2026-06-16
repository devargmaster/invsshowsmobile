import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/ErrorBanner';
import { globalStyles as styles } from '../theme/globalStyles';

export function LoginScreen({ navigation }: any) {
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
