import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AppFooter() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        © {new Date().getFullYear()} BragaAutentication — Todos os direitos reservados
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#cbd5e1",
    alignItems: "center",
    paddingVertical: 14,
  },
  text: { fontSize: 12, color: "#64748b" },
});