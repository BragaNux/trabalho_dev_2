
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AppHeader from '../components/Header';
import AppFooter from '../components/Footer';
import { getEventById } from '../services/events';
import { EventByIdResponse } from '../types/api';
import { formatDateTime } from '../utils/format';

const EVENT_ID = process.env.EXPO_PUBLIC_EVENT_ID as string;

export default function EventScreen() {
  const nav = useNavigation<any>();
  const [event, setEvent] = useState<EventByIdResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try { const e = await getEventById(EVENT_ID); setEvent(e); }
    catch { setError('Falha ao carregar o evento.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load])); // recarrega KPIs ao voltar

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <View style={styles.headerWrap}>
          <AppHeader title="Evento" subtitle="Check-in de participantes" />
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Carregando…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={load} style={styles.btnPrimary}>
            <Text style={styles.btnText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : event ? (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ===== HERO curvo (sem lib de gradiente) =====
             a ideia aqui é fazer um “cartaz” do evento, com curva no rodapé pra diferenciar de geral */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>{event.title}</Text>

            {/* local + datas como “timeline” minimalista (bolinhas + linha) */}
            <View style={{ marginTop: 8, gap: 6 }}>
              <Text style={styles.heroLine}>📍 {event.location}</Text>

              <View style={styles.timeline}>
                <View style={styles.dot} />
                <View style={styles.line} />
                <View style={styles.dot} />
              </View>
              <View style={styles.timelineLabels}>
                <Text style={styles.timeText}>{formatDateTime(event.startsAt)}</Text>
                <Text style={styles.timeText} numberOfLines={1} adjustsFontSizeToFit>
                  {formatDateTime(event.endsAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* ===== KPIs assimétricos (pra fugir do “3 retângulos iguais”) ===== */}
          <View style={styles.kpiWrap}>
            <View style={[styles.kpiSmall, { backgroundColor: '#0f172a' }]}>
              <Text style={styles.kpiValue}>{event.stats.total}</Text>
              <Text style={styles.kpiLabel}>Total</Text>
            </View>

            <View style={styles.kpiBig}>
              <Text style={[styles.kpiValue, { fontSize: 28 }]}>{event.stats.checkedIn}</Text>
              <Text style={[styles.kpiLabel, { color: '#d1fae5' }]}>Presentes</Text>
            </View>

            <View style={[styles.kpiSmall, { backgroundColor: '#1f2937' }]}>
              <Text style={styles.kpiValue}>{event.stats.absent}</Text>
              <Text style={styles.kpiLabel}>Ausentes</Text>
            </View>
          </View>

          {/* ===== Barra de ações “flutuante” =====
              duas ações lado a lado, ocupando full width, com cores fortes */}
          <View style={styles.actionsBar}>
            <Pressable onPress={() => nav.navigate('Attendees')} style={[styles.action, styles.actPrimary]} accessibilityLabel="Ver participantes">
              <Text style={styles.actionText}>Ver participantes</Text>
            </Pressable>
            <Pressable onPress={() => nav.navigate('Scanner')} style={[styles.action, styles.actSuccess]} accessibilityLabel="Abrir scanner de QR">
              <Text style={styles.actionText}>Scanner (QR)</Text>
            </Pressable>
          </View>

          {/* espaço extra pra não “colar” no footer */}
          <View style={{ height: 8 }} />
        </ScrollView>
      ) : null}

      <SafeAreaView edges={['bottom']} style={styles.safeBottom}>
        <View style={styles.footerWrap}>
          <AppFooter />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b0f1a' },
  safeTop: { backgroundColor: '#0b0f1a' },
  headerWrap: { padding: 12 },
  safeBottom: { backgroundColor: '#0b0f1a' },
  footerWrap: { padding: 12 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#9ca3af', marginTop: 8 },
  error: { color: '#ef4444', marginBottom: 12 },

  scrollContent: { paddingHorizontal: 14, paddingBottom: 12 },

  // HERO “cartaz” com rodapé curvo
  hero: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderBottomLeftRadius: 60, // curva para dar assinatura visual
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#e5e7eb' },
  heroLine: { color: '#94a3b8' },

  // timeline simples (bolinha—linha—bolinha)
  timeline: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7c3aed' },
  line: { flex: 1, height: 2, backgroundColor: '#374151', marginHorizontal: 6, borderRadius: 2 },
  timelineLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { color: '#cbd5e1', fontSize: 12 },

  // KPIs (assimétricos)
  kpiWrap: { flexDirection: 'row', gap: 10, marginTop: 12 },
  kpiSmall: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
  },
  kpiBig: {
    flex: 1.2,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#065f46',
    borderWidth: 1,
    borderColor: '#064e3b',
    alignItems: 'center',
  },
  kpiValue: { color: '#fff', fontWeight: '800', fontSize: 22 },
  kpiLabel: { color: '#cbd5e1', marginTop: 4, fontSize: 12 },

  // ações lado a lado
  actionsBar: { flexDirection: 'row', gap: 10, marginTop: 16 },
  action: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  actPrimary: { backgroundColor: '#7c3aed' },
  actSuccess: { backgroundColor: '#16a34a' },
  actionText: { color: '#fff', fontWeight: '800' },

  // botão de retry
  btnPrimary: { backgroundColor: '#7c3aed', padding: 12, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});
