// src/components/JogoCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Jogo {
  id: string;
  timeA: string;
  timeB: string;
  horario: string;
  local: string;
  fase?: string;
}

interface Props {
  jogo: Jogo;
}

export default function JogoCard({ jogo }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.times}>{jogo.timeA} vs {jogo.timeB}</Text>
      <Text style={styles.info}> {jogo.horario} |  {jogo.local}</Text>
      {jogo.fase && <Text style={styles.fase}>Fase: {jogo.fase}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  times: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: '#555',
  },
  fase: {
    marginTop: 6,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#888',
  },
});
