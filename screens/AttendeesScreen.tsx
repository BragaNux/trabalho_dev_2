// Mesma lógica de paginação/check-in. Aqui só dei um tapa visual + toque de UX nos itens.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/Header';
import AppFooter from '../components/Footer';
import { getAttendees, postCheckin } from '../services/attendees';
import { AttendeeDTO } from '../types/api';

const EVENT_ID = process.env.EXPO_PUBLIC_EVENT_ID as string;

export default function AttendeesScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<AttendeeDTO[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const limit = 20;

  const load = useCallback(async (reset = false) => {
    if (reset) { setPage(1); setData([]); }
    setError(''); setLoading(page === 1);
    try {
      const res = await getAttendees(EVENT_ID, search, reset ? 1 : page, limit);
      setTotal(res.total);
      setData(prev => reset ? res.data : [...prev, ...res.data]);
    } catch {
      setError('Falha ao carregar participantes.');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [search, page]);

  useEffect(() => { setPage(1); load(true); }, [search]);
  useEffect(() => { load(page === 1); }, [page]);

  const onRefresh = () => { setRefreshing(true); load(true); };
  const canLoadMore = useMemo(() => data.length < total, [data.length, total]);

  const handleCheckin = (attendeeId: string) => {
    const item = data.find(d => d.id === attendeeId);
    if (!item) return;

    if (item.checkedInAt) {
      const at = new Date(item.checkedInAt);
      const hh = String(at.getHours()).padStart(2, '0');
      const mm = String(at.getMinutes()).padStart(2, '0');
      Alert.alert('Já presente', `Participante já presente desde ${hh}:${mm}.`);
      return;
    }

    Alert.alert('Confirmar check-in', `Confirmar presença de ${item.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar', onPress: async () => {
          try {
            // UI otimista
            setData(prev => prev.map(p => p.id === attendeeId ? { ...p, checkedInAt: new Date().toISOString() } : p));
            await postCheckin(EVENT_ID, { attendeeId });
          } catch (err: any) {
            if (err.status === 409) {
              Alert.alert('Já presente', 'Este participante já estava presente.');
            } else {
              // rollback
              setData(prev => prev.map(p => p.id === attendeeId ? { ...p, checkedInAt: undefined } as AttendeeDTO : p));
              Alert.alert('Erro', 'Não foi possível realizar o check-in.');
            }
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: AttendeeDTO }) => {
    const present = !!item.checkedInAt;
    return (
      <Pressable
        onPress={() => handleCheckin(item.id)}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Participante ${item.name}, ${present ? 'presente' : 'ausente'}`}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || '?'}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>{item.email || item.document || '—'}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: present ? '#10B981' : '#374151' }]}>
          <Text style={styles.badgeText}>{present ? 'Presente' : 'Ausente'}</Text>
        </View>
      </Pressable>
    );
  };

  const emptyMsg = search.trim()
    ? `Nada encontrado para "${search}"`
    : 'Nenhum participante encontrado';

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <View style={{ padding: 12 }}>
          <AppHeader title="Participantes" />
        </View>
      </SafeAreaView>

      {/* Barra de busca com cara mais “app” */}
      <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
        <View style={styles.searchWrap}>
          <TextInput
            placeholder="Buscar por nome, e-mail ou documento"
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.searchInput}
            accessibilityLabel="Campo de busca por nome, e-mail ou documento"
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} style={styles.clearBtn} accessibilityLabel="Limpar busca">
              <Text style={{ color: '#94a3b8', fontWeight: '700' }}>×</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {loading && page === 1 ? (
        <View style={{ padding: 16 }}>
          <ActivityIndicator />
          <Text style={{ color: '#9ca3af', marginTop: 8 }}>Carregando…</Text>
        </View>
      ) : error ? (
        <View style={{ padding: 16 }}>
          <Text style={{ color: '#ef4444', marginBottom: 8 }}>{error}</Text>
          <Pressable onPress={() => load(true)} style={styles.btnPrimary} accessibilityLabel="Tentar novamente">
            <Text style={styles.btnText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReachedThreshold={0.5}
          onEndReached={() => { if (canLoadMore && !loading) setPage(p => p + 1); }}
          ListEmptyComponent={<Text style={{ color: '#94a3b8', padding: 16 }}>{emptyMsg}</Text>}
          ListFooterComponent={canLoadMore ? <View style={{ padding: 16 }}><ActivityIndicator /></View> : null}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 12, gap: 10 }}
        />
      )}

      <SafeAreaView edges={['bottom']} style={styles.safeBottom}>
        <View style={{ padding: 12 }}>
          <AppFooter />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b0f1a' },
  safeTop: { backgroundColor: '#0b0f1a' },
  safeBottom: { backgroundColor: '#0b0f1a' },

  // item
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 10,
    backgroundColor: '#0f172a', borderRadius: 12,
    borderWidth: 1, borderColor: '#1f2937',
  },
  rowPressed: { opacity: 0.9, transform: [{ scale: 0.995 }] },

  avatar: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937', marginRight: 10,
  },
  avatarText: { color: '#e5e7eb', fontWeight: '800' },

  title: { color: '#e5e7eb', fontWeight: '700', fontSize: 16 },
  subtitle: { color: '#94a3b8', marginTop: 2, fontSize: 12 },

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: 'white', fontWeight: '700', fontSize: 12 },

  // busca
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0f172a', borderRadius: 12,
    borderWidth: 1, borderColor: '#1f2937',
    paddingRight: 6,
  },
  searchInput: { flex: 1, color: '#e5e7eb', paddingVertical: 12, paddingHorizontal: 12 },
  clearBtn: { padding: 8 },

  // botões
  btnPrimary: { backgroundColor: '#7c3aed', padding: 12, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});
