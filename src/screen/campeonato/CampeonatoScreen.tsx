import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../navigation/routes';

interface Campeonato {
  id: string;
  nome: string;
  escudo?: string;
  categoria: string;
  idadeMinima?: number;
}

export default function CampeonatosScreen() {
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    carregarCampeonatos();
  }, []);

  const carregarCampeonatos = async () => {
    try {
      const dados = await AsyncStorage.getItem('campeonatos');
      if (dados) {
        const lista = JSON.parse(dados);
        setCampeonatos(lista);
      }
    } catch (erro) {
      console.error('Erro ao carregar campeonatos:', erro);
    }
  };

  const irParaDetalhes = (campeonato: Campeonato) => {
    navigation.navigate(ROUTES.CAMPEONATO_DETALHES, { campeonatoId: campeonato.id });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Campeonatos Cadastrados</Text>

      <FlatList
        data={campeonatos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => irParaDetalhes(item)}
          >
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.categoria}>Categoria: {item.categoria}</Text>
            {item.idadeMinima && (
              <Text style={styles.idade}>Idade mínima: {item.idadeMinima}</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum campeonato cadastrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  card: {
    backgroundColor: '#ecf0f1',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  nome: { fontSize: 18, fontWeight: 'bold' },
  categoria: { fontSize: 14, color: '#555' },
  idade: { fontSize: 13, color: '#888' },
  vazio: { textAlign: 'center', color: '#aaa', marginTop: 32 },
});
