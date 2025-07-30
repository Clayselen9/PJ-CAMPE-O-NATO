import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TabelaJogosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Tabela de Jogos</Text>

      {/* Aqui será exibida a lista de jogos por rodada ou fase */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
