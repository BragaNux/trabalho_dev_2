import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = { title: string; subtitle?: string; count?: number };

export default function AppHeader({ title, subtitle, count }: Props) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {typeof count === "number" && (
        <Text style={styles.count}>Total: {count}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e8f0",
  },
  title: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 14, color: "#475569", marginTop: 2 },
  count: { color: "#475569", fontWeight: "500", alignSelf: "flex-end" },
});