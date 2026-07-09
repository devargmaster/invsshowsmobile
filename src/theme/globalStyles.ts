import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0B0B12' },
  screen: { flex: 1, padding: 20, backgroundColor: '#0B0B12' },
  screenScroll: { flex: 1, backgroundColor: '#0B0B12', padding: 20 },
  centerScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#0B0B12' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0B12', gap: 12 },

  logo: { color: '#FFFFFF', fontSize: 52, fontWeight: '900', letterSpacing: 5 },
  subtitle: { color: '#B9B9C8', fontSize: 16, marginTop: 8, marginBottom: 32 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginBottom: 20 },
  loadingText: { color: '#8F8FA3', fontSize: 14 },
  emptyText: { color: '#8F8FA3', textAlign: 'center', marginTop: 40, fontSize: 15 },

  input: {
    backgroundColor: '#181827', borderRadius: 12, padding: 14,
    marginBottom: 0, color: '#FFF', borderWidth: 1, borderColor: '#2D2D45',
  },

  primaryButton: {
    backgroundColor: '#7C3AED', borderRadius: 12, padding: 16,
    alignItems: 'center', justifyContent: 'center', marginTop: 18,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },

  secondaryButton: {
    borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#7C3AED',
  },
  secondaryButtonText: { color: '#A78BFA', fontWeight: '700', fontSize: 15 },

  dangerButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 32, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#3D1515',
  },
  dangerButtonText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },

  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  note: { color: '#8F8FA3', fontSize: 12, marginTop: 16, lineHeight: 18 },
  noteCenter: { color: '#B9B9C8', textAlign: 'center', marginTop: 16, lineHeight: 20 },

  card: { backgroundColor: '#181827', borderRadius: 16, marginBottom: 14, overflow: 'hidden' },
  cardImage: { width: '100%', height: 160, backgroundColor: '#2D2D45' },
  cardContent: { padding: 18 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', flex: 1 },
  meta: { color: '#B9B9C8', marginTop: 5, fontSize: 13 },
  badge: { color: '#C4B5FD', marginTop: 10, fontWeight: '800' },
  description: { color: '#D1D1E0', fontSize: 15, lineHeight: 24, marginTop: 8 },

  detailImage: { width: '100%', height: 220, backgroundColor: '#2D2D45', marginBottom: 16, borderRadius: 16 },

  livePill: {
    backgroundColor: '#7F1D1D', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8,
  },
  livePillText: { color: '#FCA5A5', fontSize: 11, fontWeight: '800' },

  eventHeader: { marginBottom: 8 },

  qrWrapper: { alignItems: 'center', marginTop: 20 },
  qrBox: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 20 },

  usedOverlay: { alignItems: 'center', gap: 8, padding: 24 },
  usedText: { color: '#EF4444', fontWeight: '900', fontSize: 18, letterSpacing: 1 },

  tabChip: {
    marginRight: 10, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#181827',
  },
  tabChipActive: { backgroundColor: '#7C3AED' },
  tabChipText: { color: '#8F8FA3', fontSize: 13, fontWeight: '600' },
  tabChipTextActive: { color: '#FFF' },

  cameraBox: {
    height: 300, borderRadius: 20, overflow: 'hidden',
    backgroundColor: '#181827', position: 'relative', marginBottom: 20,
  },
  scanFrame: {
    position: 'absolute', top: '25%', left: '25%',
    width: '50%', height: '50%',
    borderWidth: 2, borderColor: '#A78BFA', borderRadius: 12,
  },

  resultBox: {
    backgroundColor: '#181827', padding: 24, borderRadius: 20,
    alignItems: 'center', marginTop: 8,
  },
  resultOk: { borderWidth: 1, borderColor: '#14532D' },
  resultFail: { borderWidth: 1, borderColor: '#7F1D1D' },
  resultTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  resultDetail: { color: '#B9B9C8', marginTop: 10, textAlign: 'center', fontSize: 14 },

  errorBox: {
    backgroundColor: '#1C0A0A', borderRadius: 12, padding: 14,
    flexDirection: 'column', gap: 6, marginBottom: 16, borderWidth: 1, borderColor: '#3D1515',
  },
  errorText: { color: '#FCA5A5', fontSize: 13, lineHeight: 18 },
  retryBtn: { alignSelf: 'flex-start', marginTop: 4 },
  retryText: { color: '#A78BFA', fontWeight: '700', fontSize: 13 },

  streamInfo: {
    backgroundColor: '#0A1F0A', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#14532D', gap: 6,
  },
  streamInfoText: { color: '#86EFAC', fontWeight: '700', fontSize: 14 },
  streamUrl: { color: '#6EE7B7', fontSize: 11 },

  // ─── Checkout ────────────────────────────────────────────────────
  checkoutStep: { color: '#A78BFA', fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  checkoutSubtitle: { color: '#8F8FA3', fontSize: 14, marginTop: 6, marginBottom: 20, lineHeight: 20 },
  checkoutEmpty: { color: '#8F8FA3', textAlign: 'center', marginTop: 60, fontSize: 15, paddingHorizontal: 20 },

  checkoutItem: {
    backgroundColor: '#181827', borderRadius: 16, padding: 16, marginBottom: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12,
  },
  checkoutItemInfo: { flex: 1 },
  checkoutItemName: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  checkoutItemDesc: { color: '#8F8FA3', fontSize: 13, marginTop: 4 },
  checkoutItemMeta: { color: '#A78BFA', fontSize: 12, marginTop: 4, fontWeight: '600' },
  checkoutItemPrice: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginTop: 8 },
  checkoutItemAvailable: { color: '#86EFAC', fontSize: 12, marginTop: 4 },
  checkoutItemAvailableLow: { color: '#FBBF24' },
  checkoutItemAvailableNone: { color: '#EF4444' },

  checkoutStepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkoutStepperBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#2D2D45',
    alignItems: 'center', justifyContent: 'center',
  },
  checkoutStepperBtnDisabled: { opacity: 0.35 },
  checkoutStepperBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  checkoutStepperCount: { color: '#FFF', fontSize: 16, fontWeight: '800', minWidth: 20, textAlign: 'center' },

  checkoutVariants: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  checkoutVariantChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: '#2D2D45', borderWidth: 1, borderColor: '#2D2D45',
  },
  checkoutVariantChipActive: { backgroundColor: 'rgba(124,58,237,0.25)', borderColor: '#7C3AED' },
  checkoutVariantChipText: { color: '#B9B9C8', fontSize: 13, fontWeight: '600' },
  checkoutVariantChipTextActive: { color: '#C4B5FD' },

  checkoutFooter: {
    borderTopWidth: 1, borderColor: '#2D2D45', paddingTop: 16, marginTop: 8,
  },
  checkoutFooterTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  checkoutFooterTotalLabel: { color: '#8F8FA3', fontSize: 14 },
  checkoutFooterTotalValue: { color: '#FFF', fontSize: 18, fontWeight: '800' },

  checkoutSummaryLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#181827' },
  checkoutSummaryLineLabel: { color: '#D1D1E0', fontSize: 14, flex: 1, paddingRight: 12 },
  checkoutSummaryLineValue: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  checkoutSummaryTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: '#2D2D45' },
  checkoutSummaryTotalLabel: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  checkoutSummaryTotalValue: { color: '#A78BFA', fontSize: 20, fontWeight: '900' },

  checkoutFieldLabel: { color: '#8F8FA3', fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 8 },

  checkoutPaymentOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#181827',
    borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#181827',
  },
  checkoutPaymentOptionActive: { borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.12)' },
  checkoutPaymentOptionLabel: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  checkoutPaymentOptionSub: { color: '#8F8FA3', fontSize: 12, marginTop: 2 },

  checkoutBankInfo: { backgroundColor: '#181827', borderRadius: 14, padding: 16, marginTop: 8, marginBottom: 8, gap: 10 },
  checkoutBankRow: { flexDirection: 'row', justifyContent: 'space-between' },
  checkoutBankRowLabel: { color: '#8F8FA3', fontSize: 13 },
  checkoutBankRowValue: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  checkoutFileInput: {
    borderWidth: 1, borderColor: '#2D2D45', borderStyle: 'dashed', borderRadius: 14,
    padding: 20, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4,
  },
  checkoutFileInputFilled: { borderColor: '#7C3AED', borderStyle: 'solid' },
  checkoutFileInputText: { color: '#8F8FA3', fontSize: 13, textAlign: 'center' },

  checkoutConfirmIcon: {
    width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginTop: 24, marginBottom: 20,
  },
  checkoutConfirmIconSuccess: { backgroundColor: 'rgba(34,197,94,0.15)' },
  checkoutConfirmIconPending: { backgroundColor: 'rgba(251,191,36,0.15)' },
  checkoutConfirmTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 10 },
  checkoutConfirmText: { color: '#B9B9C8', fontSize: 14, textAlign: 'center', lineHeight: 21, paddingHorizontal: 8 },
  checkoutNote: {
    flexDirection: 'row', gap: 10, backgroundColor: '#1F1B0A', borderWidth: 1, borderColor: '#3D3315',
    borderRadius: 12, padding: 14, marginTop: 20,
  },
  checkoutNoteText: { color: '#FDE68A', fontSize: 12, lineHeight: 18, flex: 1 },

  // ─── Compartir / transferencias ─────────────────────────────────
  unassignedBox: { backgroundColor: '#181827', borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 12, gap: 12 },
  unassignedText: { color: '#B9B9C8', fontSize: 14, textAlign: 'center' },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#7C3AED',
    paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12,
  },
  shareBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  pendingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(251,191,36,0.12)',
    borderWidth: 1, borderColor: '#3D3315', borderRadius: 12, padding: 12,
  },
  pendingBadgeText: { color: '#FBBF24', fontSize: 13, flex: 1, flexWrap: 'wrap' },
  cancelBtn: { paddingVertical: 8 },
  cancelBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 13 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#141420', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#2D2D45', alignSelf: 'center', marginBottom: 18 },
  modalTitle: { color: '#FFF', fontSize: 19, fontWeight: '800', marginBottom: 6 },
  modalDesc: { color: '#8F8FA3', fontSize: 13, lineHeight: 19, marginBottom: 20 },
  modalLabel: { color: '#8F8FA3', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 14 },
  modalMatchOk: { color: '#86EFAC', fontSize: 13, marginTop: 8, fontWeight: '600' },
  modalMatchError: { color: '#FCA5A5', fontSize: 13, marginTop: 8, fontWeight: '600' },
  modalSubmit: {
    backgroundColor: '#7C3AED', borderRadius: 12, padding: 16, alignItems: 'center',
    justifyContent: 'center', marginTop: 22, flexDirection: 'row', gap: 8,
  },
  modalSubmitText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  modalCancel: { alignItems: 'center', padding: 14, marginTop: 4 },
  modalCancelText: { color: '#8F8FA3', fontSize: 14 },

  incomingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(124,58,237,0.12)',
    borderWidth: 1, borderColor: '#3D2D6B', borderRadius: 14, padding: 14, marginBottom: 16,
  },
  incomingBannerText: { color: '#D1D1E0', fontSize: 13, flex: 1, lineHeight: 18 },
  incomingBannerAction: { backgroundColor: '#7C3AED', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  incomingBannerActionText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});
