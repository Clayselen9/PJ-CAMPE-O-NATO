import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ROUTES from '../../navigation/routes';

interface Campeonato {
  id: string;
  nome: string;
  escudo?: string;
  categoria: 'aberto' | 'idade';
  idadeMinima?: number;
}

export default function CampeonatoDetalhes() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { campeonatoId } = route.params as { campeonatoId?: string };

  const [campeonato, setCampeonato] = useState<Campeonato | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarCampeonato = async () => {
      try {
        if (!campeonatoId) {
          Alert.alert('Erro', 'ID do campeonato não encontrado.');
          navigation.goBack();
          return;
        }

        const dados = await AsyncStorage.getItem('campeonatos');
        const lista: Campeonato[] = dados ? JSON.parse(dados) : [];
        const encontrado = lista.find((c) => c.id === campeonatoId);

        if (!encontrado) {
          Alert.alert('Erro', 'Campeonato não encontrado.');
          navigation.goBack();
          return;
        }

        setCampeonato(encontrado);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar o campeonato.');
        console.error('Erro ao carregar campeonato:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarCampeonato();
  }, [campeonatoId]);

  if (carregando) {
    return (
      <View style={styles.container}>
        <Text>Carregando campeonato...</Text>
      </View>
    );
  }

  if (!campeonato) {
    return (
      <View style={styles.container}>
        <Text>Campeonato não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>{campeonato.nome}</Text>

      {campeonato.escudo && (
        <Image source={{ uri: campeonato.escudo }} style={styles.escudo} />
      )}

      <Text style={styles.info}>
        Categoria:{' '}
        {campeonato.categoria === 'idade'
          ? `Por Idade (mínimo ${campeonato.idadeMinima} anos)`
          : 'Aberto'}
      </Text>

      <View style={styles.botoes}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => navigation.navigate(ROUTES.EQUIPES, { campeonatoId })}
        >
          <Text style={styles.botaoTexto}>Equipes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botao}
          onPress={() => navigation.navigate(ROUTES.FASES, { campeonatoId })}
        >
          <Text style={styles.botaoTexto}>Jogos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botao}
          onPress={() => navigation.navigate(ROUTES.ESTATISTICAS, { campeonatoId })}
        >
          <Text style={styles.botaoTexto}>Estatísticas</Text>
        </TouchableOpacity>

        {/* NOVO BOTÃO CONFIGURAÇÕES */}
        <TouchableOpacity
          style={[styles.botao, { backgroundColor: '#598404ff' }]}
          onPress={() => navigation.navigate(ROUTES.CONFIGURACOES, { campeonatoId })}
        >
          <Text style={styles.botaoTexto}>Configurações</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  escudo: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#555',
  },
  botoes: {
    width: '100%',
    gap: 12,
  },
  botao: {
    backgroundColor: '#598404ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
