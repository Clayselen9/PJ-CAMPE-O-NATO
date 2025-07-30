import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface Rodada {
  id: string;
  numero: number;
  data: string;
}

export default function JogosScreen() {
  const navigation = useNavigation();

  // Exemplo estático de rodadas
  const [rodadas, setRodadas] = useState<Rodada[]>([
    { id: '1', numero: 1, data: '2025-07-05' },
    { id: '2', numero: 2, data: '2025-07-12' },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Rodadas</Text>

      <FlatList
        data={rodadas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('PartidasDaRodada', { rodadaId: item.id })
            }
          >
            <Text style={styles.cardTitulo}>Rodada {item.numero}</Text>
            <Text style={styles.cardData}>
              Data: {new Date(item.data).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.botao}
        onPress={() => {
          const novaRodada: Rodada = {
            id: Date.now().toString(),
            numero: rodadas.length + 1,
            data: new Date().toISOString(),
          };
          setRodadas((prev) => [...prev, novaRodada]);
        }}
      >
        <Text style={styles.botaoTexto}> Nova Rodada</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardData: {
    marginTop: 4,
    color: '#555',
  },
  botao: {
    backgroundColor: '#2980b9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
