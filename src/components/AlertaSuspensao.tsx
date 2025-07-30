// src/components/AlertaSuspensao.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';

interface Jogador {
  id: string;
  nome: string;
  apelido: string;
  fotoUri?: string;
  motivoSuspensao: string;
}

interface Props {
  jogadoresSuspensos: Jogador[];
}

export default function AlertaSuspensao({ jogadoresSuspensos }: Props) {
  if (jogadoresSuspensos.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Atenção! Jogadores Suspensos</Text>
      <FlatList
        data={jogadoresSuspensos}
        keyExtractor={(item) => item.id}
        horizontal
        renderItem={({ item }) => (
          <View style={styles.jogadorCard}>
            {item.fotoUri ? (
              <Image source={{ uri: item.fotoUri }} style={styles.foto} />
            ) : (
              <View style={styles.fotoPlaceholder} />
            )}
            <Text style={styles.nome}>{item.apelido || item.nome}</Text>
            <Text style={styles.motivo}>{item.motivoSuspensao}</Text>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffe6e6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  titulo: {
    color: '#c0392b',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
  jogadorCard: {
    alignItems: 'center',
    marginRight: 12,
  },
  foto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
  },
  fotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ddd',
  },
  nome: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  motivo: {
    fontSize: 12,
    color: '#c0392b',
    textAlign: 'center',
  },
});
