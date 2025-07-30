// CampeonatoInterno.tsx atualizado
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CampeonatoInterno() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Tela de Campeonato Interno</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  texto: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
