import { apiClient } from './apiClient';
import type {
  Ticket, ValidateTicketResponse, RedeemableAddon, TicketTransfer, IncomingTransfer,
} from '../types/tickets';

export const ticketsService = {
  async getMyTickets(): Promise<Ticket[]> {
    return apiClient.get<Ticket[]>('/tickets/me');
  },

  async getTicketsForEvent(eventId: string): Promise<Ticket[]> {
    const tickets = await ticketsService.getMyTickets();
    return tickets.filter((t) => t.eventId === eventId);
  },

  async validateQr(qrPayload: string): Promise<ValidateTicketResponse> {
    return apiClient.post<ValidateTicketResponse>('/tickets/validate', { qrPayload });
  },

  async redeemAddon(orderAddonId: string): Promise<RedeemableAddon> {
    return apiClient.post<RedeemableAddon>(`/tickets/addons/${orderAddonId}/redeem`);
  },

  // ─── Compartir / transferir ─────────────────────────────────────
  async createTransfer(ticketId: string, toEmail: string): Promise<TicketTransfer> {
    return apiClient.post<TicketTransfer>(`/tickets/${ticketId}/transfers`, { toEmail });
  },

  async cancelTransfer(transferId: string): Promise<TicketTransfer> {
    return apiClient.delete<TicketTransfer>(`/tickets/transfers/${transferId}`);
  },

  async getIncomingTransfers(): Promise<IncomingTransfer[]> {
    return apiClient.get<IncomingTransfer[]>('/tickets/transfers/incoming');
  },
};
