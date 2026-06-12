/**
 * Configuración de entorno para INVS Mobile
 *
 * Para dispositivo físico (iPhone con Expo Go):
 * Cambiar LAN_IP por la IP de tu Mac en la red local.
 * Ejemplo: ifconfig | grep "inet " → buscar la IP 192.168.x.x
 */

// IP de tu Mac en la red local (solo para dispositivo físico)
const LAN_IP = '192.168.1.9';

// Detectar plataforma para elegir la URL correcta
import { Platform } from 'react-native';

function getApiBaseUrl(): string {
  // En web → localhost funciona
  if (Platform.OS === 'web') {
    return 'http://localhost:3001/api/v1';
  }
  // En simulador Android → 10.0.2.2 apunta al host
  if (Platform.OS === 'android') {
    return `http://${LAN_IP}:3001/api/v1`;
  }
  // En simulador iOS → localhost funciona
  // return 'http://localhost:3001/api/v1';

  // En dispositivo físico → usar IP LAN de la Mac
  return `http://${LAN_IP}:3001/api/v1`; // iPhone físico / simulador iOS
}

export const ENV = {
  API_BASE_URL: getApiBaseUrl(),
  TOKEN_STORAGE_KEY: 'invs_access_token',
};
