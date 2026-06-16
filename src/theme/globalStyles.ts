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
});
