// Mantive a lógica com expo-camera. Só deixei o overlay mais “bonito” e legível.
import React, { useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/Header';
import AppFooter from '../components/Footer';
import { postCheckin } from '../services/attendees';

const EVENT_ID = process.env.EXPO_PUBLIC_EVENT_ID as string;
type QRPayload = { eventId: string; attendeeId: string };

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const canScanRef = useRef(true);

  const handleScan = async (result: BarcodeScanningResult) => {
    if (!canScanRef.current) return;
    canScanRef.current = false;

    try {
      const parsed: QRPayload = JSON.parse(result.data || '');
      if (!parsed?.eventId || !parsed?.attendeeId) throw new Error('payload inválido');

      if (parsed.eventId !== EVENT_ID) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('QR de outro evento', 'O código pertence a outro evento.');
        return;
      }

      try {
        await postCheckin(EVENT_ID, { attendeeId: parsed.attendeeId });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Check-in OK', 'Presença registrada com sucesso.');
      } catch (err: any) {
        if (err?.status === 409) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          Alert.alert('Já presente', 'Este participante já estava presente.');
        } else {
          throw err;
        }
      }
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Falha ao processar', 'Este QR não é válido ou ocorreu um erro no check-in.');
    } finally {
      setTimeout(() => (canScanRef.current = true), 1200);
    }
  };

  if (!permission) {
    return <View style={styles.center}><Text style={styles.muted}>Verificando permissão da câmera…</Text></View>;
  }
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Precisamos da câmera para ler o QR.</Text>
        <Pressable onPress={requestPermission} style={styles.btnPrimary}>
          <Text style={styles.btnText}>Permitir câmera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={{ padding: 12, backgroundColor: '#000' }}>
        <AppHeader title="Scanner" subtitle="Aponte para o QR do crachá" />
      </SafeAreaView>

      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleScan}
      />

      {/* Moldura central */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.frame} />
        <Text style={styles.overlayText}>Posicione o QR dentro da moldura</Text>
      </View>

      <SafeAreaView edges={['bottom']} style={{ padding: 12, backgroundColor: '#000' }}>
        <AppFooter />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  muted: { color: '#9CA3AF', marginTop: 8 },

  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  frame: { width: 240, height: 240, borderWidth: 3, borderColor: '#10B981', borderRadius: 16 },
  overlayText: { color: '#e5e7eb', marginTop: 12, fontWeight: '600' },

  btnPrimary: { backgroundColor: '#7c3aed', padding: 12, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});
