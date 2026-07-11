import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useIsFocused } from '@react-navigation/native';
import { ErrorBanner } from '../components/ErrorBanner';
import { ShareTicketModal } from '../components/ShareTicketModal';
import { IncomingTransferBanner } from '../components/IncomingTransferBanner';
import { ticketsService } from '../services/ticketsService';
import { ordersService } from '../services/ordersService';
import { ApiError } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import type { Ticket } from '../types/tickets';
import type { Order, OrderStatus } from '../types/checkout';
import { formatDate, formatMoney } from '../utils/formatters';
import { globalStyles as styles } from '../theme/globalStyles';

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: '(Pendiente)',
  USED: '(Usada)',
  CANCELLED: '(Cancelada)',
};

const ORDER_STATUS_LABEL: Record<OrderStatus, { label: string; color: string }> = {
  PAID: { label: 'Pagada', color: '#34D399' },
  PENDING_PAYMENT: { label: 'Pago pendiente', color: '#FBBF24' },
  FAILED: { label: 'Falló el pago', color: '#8F8FA3' },
  CANCELLED: { label: 'Cancelada', color: '#8F8FA3' },
};

export function TicketScreen() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [view, setView] = useState<'entradas' | 'pedidos'>('entradas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [sharingTicket, setSharingTicket] = useState<Ticket | null>(null);
  const [justSent, setJustSent] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const isFocused = useIsFocused();

  const load = useCallback(async () => {
    setError(null);
    try {
      const [data, ordersData] = await Promise.all([
        ticketsService.getMyTickets(),
        ordersService.getMyOrders(),
      ]);
      setTickets(data);
      setOrders(ordersData);
      setSelected((prev) => {
        if (data.length === 0) return null;
        if (!prev) return data[0];
        return data.find((t) => t.id === prev.id) ?? data[0];
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error cargando tickets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) load();
  }, [isFocused, load]);

  const handleCancelTransfer = async (transferId: string) => {
    setCancellingId(transferId);
    try {
      await ticketsService.cancelTransfer(transferId);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al cancelar el envío.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#A78BFA" size="large" />
        <Text style={styles.loadingText}>Cargando entradas...</Text>
      </View>
    );
  }

  if (error) {
    return <View style={styles.screen}><ErrorBanner message={error} onRetry={load} /></View>;
  }

  if (tickets.length === 0 && orders.length === 0) {
    return (
      <View style={styles.centerScreen}>
        <Ionicons name="ticket-outline" size={64} color="#3D3D5C" />
        <Text style={styles.emptyText}>No tenés entradas activas.</Text>
        <Text style={styles.note}>Comprá tus entradas desde el detalle de un evento presencial.</Text>
      </View>
    );
  }

  const pendingTransfer = selected?.transfers?.find((t) => t.status === 'PENDING') ?? null;
  const isMine = selected?.holderUserId === user?.id;
  const isUnassignedOfMine = !selected?.holderUserId && selected?.purchaserUserId === user?.id;
  // Se puede compartir una entrada comprada por mí, activa, que no tenga
  // otro dueño (sin asignar o asignada a mí mismo).
  const canShare =
    selected?.purchaserUserId === user?.id &&
    selected?.status === 'ACTIVE' &&
    (!selected?.holderUserId || selected?.holderUserId === user?.id);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Mis compras</Text>

      <IncomingTransferBanner />

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {(['entradas', 'pedidos'] as const).map((v) => (
          <Pressable
            key={v}
            style={[styles.tabChip, view === v && styles.tabChipActive]}
            onPress={() => setView(v)}
          >
            <Text style={[styles.tabChipText, view === v && styles.tabChipTextActive]}>
              {v === 'entradas' ? 'Entradas' : 'Pedidos'}
            </Text>
          </Pressable>
        ))}
      </View>

      {view === 'pedidos' && (
        orders.length === 0 ? (
          <Text style={styles.emptyText}>Todavía no hiciste ninguna compra.</Text>
        ) : (
          <View>
            {orders.map((o) => {
              const status = ORDER_STATUS_LABEL[o.status];
              const ticketCount = o.tickets?.length ?? 0;
              return (
                <View key={o.id} style={[styles.card, { padding: 16 }]}>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardTitle}>{o.event?.title ?? 'Evento'}</Text>
                    <Text style={{ color: status.color, fontWeight: '800', fontSize: 12 }}>
                      {status.label}
                    </Text>
                  </View>
                  <Text style={styles.meta}>Compra del {formatDate(o.createdAt)}</Text>
                  <View style={{ marginTop: 12, gap: 6 }}>
                    {ticketCount > 0 && (
                      <Text style={{ color: '#D1D1E0', fontSize: 14 }}>
                        {ticketCount}× {ticketCount === 1 ? 'Entrada' : 'Entradas'}
                      </Text>
                    )}
                    {o.addons?.map((a) => (
                      <View key={a.id} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                        <Text style={{ color: '#D1D1E0', fontSize: 14, flex: 1 }}>
                          {a.quantity}× {a.addon?.name ?? 'Adicional'}
                          {a.variant ? ` — ${a.variant.label}` : ''}
                        </Text>
                        <Text style={{ color: '#B9B9C8', fontSize: 14 }}>
                          {formatMoney(a.unitPriceCents * a.quantity, o.currency)}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#2D2D45' }}>
                    <Text style={{ color: '#B9B9C8', fontSize: 14 }}>Total</Text>
                    <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>
                      {formatMoney(o.totalCents, o.currency)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )
      )}

      {view === 'entradas' && tickets.length === 0 && (
        <Text style={styles.emptyText}>No tenés entradas activas.</Text>
      )}

      {view === 'entradas' && tickets.length > 1 && (
        <FlatList
          data={tickets}
          horizontal
          keyExtractor={(t) => t.id}
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          renderItem={({ item }) => {
            const tPending = item.transfers?.find((tr) => tr.status === 'PENDING');
            const label = STATUS_LABEL[item.status] ?? (tPending ? '(Enviada)' : !item.holderUserId ? '(Sin asignar)' : '');
            return (
              <Pressable
                style={[styles.tabChip, selected?.id === item.id && styles.tabChipActive]}
                onPress={() => setSelected(item)}
              >
                <Text style={[styles.tabChipText, selected?.id === item.id && styles.tabChipTextActive]}>
                  {item.event?.title ?? item.eventId} {label} · #{item.id.slice(0, 6).toUpperCase()}
                </Text>
              </Pressable>
            );
          }}
        />
      )}

      {view === 'entradas' && selected && (
        <View>
          {selected.event && (
            <View style={styles.card}>
              <Image source={{ uri: `https://picsum.photos/seed/${selected.event.id}/400/200` }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{selected.event.title}</Text>
                <Text style={styles.meta}>{formatDate(selected.event.date)}</Text>
                {selected.event.location && <Text style={styles.meta}>📍 {selected.event.location}</Text>}
              </View>
            </View>
          )}

          {selected.category && (
            <Text style={styles.meta}>Categoría: {selected.category.name}</Text>
          )}
          <Text style={[styles.meta, { marginBottom: 4 }]}>
            Comprada el {formatDate(selected.createdAt)} · #{selected.id.slice(0, 8).toUpperCase()}
          </Text>

          {canShare && pendingTransfer ? (
            <View style={styles.unassignedBox}>
              <View style={styles.pendingBadge}>
                <Ionicons name="mail-outline" size={18} color="#FBBF24" />
                <Text style={styles.pendingBadgeText}>
                  Enviada a {pendingTransfer.toEmail} · pendiente de aceptar
                </Text>
              </View>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => handleCancelTransfer(pendingTransfer.id)}
                disabled={cancellingId === pendingTransfer.id}
              >
                <Text style={styles.cancelBtnText}>
                  {cancellingId === pendingTransfer.id ? 'Cancelando...' : 'Cancelar envío'}
                </Text>
              </Pressable>
            </View>
          ) : isUnassignedOfMine && selected.status === 'ACTIVE' ? (
            <View style={styles.unassignedBox}>
              <Text style={styles.unassignedText}>Esta entrada todavía no está asignada.</Text>
              <Pressable style={styles.shareBtn} onPress={() => setSharingTicket(selected)}>
                <Ionicons name="paper-plane" size={16} color="#FFF" />
                <Text style={styles.shareBtnText}>Compartir por email</Text>
              </Pressable>
            </View>
          ) : selected.status === 'PENDING_PAYMENT' ? (
            <View style={styles.unassignedBox}>
              <Ionicons name="time-outline" size={32} color="#FBBF24" />
              <Text style={styles.unassignedText}>
                Esta entrada está pendiente de que validemos tu pago por transferencia.
              </Text>
            </View>
          ) : (
            <View style={styles.qrWrapper}>
              {selected.status === 'USED' ? (
                <View style={styles.usedOverlay}>
                  <Ionicons name="close-circle" size={48} color="#EF4444" />
                  <Text style={styles.usedText}>ENTRADA UTILIZADA</Text>
                  {selected.usedAt && <Text style={styles.meta}>{formatDate(selected.usedAt)}</Text>}
                </View>
              ) : selected.qrPayload ? (
                <View style={styles.qrBox}>
                  <QRCode value={selected.qrPayload} size={220} />
                </View>
              ) : null}
            </View>
          )}

          {selected.status === 'ACTIVE' && selected.qrPayload && (
            <Text style={styles.noteCenter}>
              {selected.expiresAt ? `Válida hasta: ${formatDate(selected.expiresAt)}` : ''}
            </Text>
          )}

          {canShare && !pendingTransfer && !isUnassignedOfMine && (
            <Pressable
              style={[styles.shareBtn, { marginTop: 14, alignSelf: 'center' }]}
              onPress={() => setSharingTicket(selected)}
            >
              <Ionicons name="paper-plane" size={16} color="#FFF" />
              <Text style={styles.shareBtnText}>¿No vas vos? Compartila por email</Text>
            </Pressable>
          )}

          {!isMine && !isUnassignedOfMine && (
            <Text style={[styles.meta, { textAlign: 'center', marginTop: 10 }]}>Esta entrada te la compartieron.</Text>
          )}
        </View>
      )}

      {sharingTicket && (
        <ShareTicketModal
          visible={!!sharingTicket}
          ticketId={sharingTicket.id}
          ticketLabel={sharingTicket.category?.name ?? 'entrada'}
          onClose={() => setSharingTicket(null)}
          onSent={() => {
            setSharingTicket(null);
            setJustSent(true);
            load();
            setTimeout(() => setJustSent(false), 4000);
          }}
        />
      )}

      {justSent && (
        <View style={[styles.streamInfo, { marginTop: 16 }]}>
          <Ionicons name="checkmark-circle" size={20} color="#34D399" />
          <Text style={styles.streamInfoText}>¡Entrada enviada!</Text>
        </View>
      )}
    </ScrollView>
  );
}
