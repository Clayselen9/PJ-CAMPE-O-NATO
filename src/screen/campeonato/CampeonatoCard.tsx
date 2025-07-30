import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ROUTES from '../../navigation/routes';

interface Campeonato {
  id: string;
  nome: string;
  escudo?: string;
  categoria: string;
  idadeMinima?: number;
}

interface Props {
  campeonato: Campeonato;
  status: string;
  onPress: (id: string) => void;
}

export default function CampeonatoCard({ campeonato, status, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(campeonato.id)}>
      {campeonato.escudo && (
        <Image source={{ uri: campeonato.escudo }} style={styles.escudo} />
      )}
      <View>
        <Text style={styles.nome}>{campeonato.nome}</Text>
        <Text style={styles.status}>{status}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#ecf0f1',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  escudo: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 4,
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    color: '#555',
  },
});
