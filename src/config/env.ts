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

const PROD_URL = 'https://invsshowsbackend-production.up.railway.app/api/v1';

function getApiBaseUrl(): string {
  // Usar siempre el backend en la nube (Railway) para todos los entornos
  // Esto te permite probar en dispositivos físicos sin depender del WiFi de la Mac
  return PROD_URL;
}

export const ENV = {
  API_BASE_URL: getApiBaseUrl(),
  TOKEN_STORAGE_KEY: 'invs_access_token',
  // Web de INVS — se usa para resolver ahí la aceptación de entradas
  // transferidas (no hay deep linking nativo configurado todavía).
  // TODO: reemplazar por la URL real de producción de invs-web una vez
  // desplegada (hoy no hay un valor confirmado).
  WEB_BASE_URL: 'https://invs-web.example.com',
  // Clave pública de Openpay Argentina (BBVA) para tokenizar tarjetas del
  // lado del cliente. Vacía hasta que exista la cuenta real — el pago con
  // tarjeta falla con un mensaje claro mientras tanto (ver openpayClient.ts).
  OPENPAY_PUBLIC_KEY: '',
};
