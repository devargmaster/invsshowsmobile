import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { EventsScreen } from './src/screens/EventsScreen';
import { EventDetailScreen } from './src/screens/EventDetailScreen';
import { TicketScreen } from './src/screens/TicketScreen';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
  EventDetail: { eventId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function Tabs() {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#0B0B12' },
        headerTintColor: '#FFFFFF',
        tabBarStyle: { backgroundColor: '#0B0B12', borderTopColor: '#181827' },
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#8F8FA3',
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, string> = {
            Eventos: 'calendar',
            Entrada: 'qr-code',
            Staff: 'scan',
            Perfil: 'person',
          };
          return <Ionicons name={(iconMap[route.name] ?? 'ellipse') as any} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Eventos" component={EventsScreen} />
      <Tab.Screen name="Entrada" component={TicketScreen} />
      {isStaff && <Tab.Screen name="Staff" component={ScannerScreen} />}
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#0B0B12' },
            headerTintColor: '#FFFFFF',
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Evento' }} />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </AuthProvider>
  );
}
