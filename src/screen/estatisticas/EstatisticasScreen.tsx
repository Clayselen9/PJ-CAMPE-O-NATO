import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EstatisticasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Ranking e Estatísticas</Text>

      <View style={styles.card}>
        <Text style={styles.label}>🔝 Artilheiros</Text>
        {/* Aqui futuramente você pode renderizar a lista */}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>⚔️ Melhor Ataque</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>🛡️ Melhor Defesa</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>🟥 Time Mais Indisciplinado</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>🟨 Jogadores Suspensos</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
