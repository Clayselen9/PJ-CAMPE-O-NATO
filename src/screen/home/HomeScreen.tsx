// HomeScreen.tsx com importação corrigida de CampeonatoCard
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import JogoCard from '../../components/JogoCard';
import CampeonatoCard from '../campeonato/CampeonatoCard';
import AlertaSuspensao from '../../components/AlertaSuspensao';
import ROUTES from '../../navigation/routes';

interface Jogo {
  id: string;
  campeonatoId: string;
  status: 'a começar' | 'em_andamento' | 'finalizado';
}

interface Jogador {
  id: string;
  nome: string;
  motivoSuspensao?: string;
}

interface Campeonato {
  id: string;
  nome: string;
  escudo?: string;
  categoria: string;
  idadeMinima?: number;
  arquivado?: boolean;
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const [jogosDoDia, setJogosDoDia] = useState<Jogo[]>([]);
  const [jogadoresSuspensos, setJogadoresSuspensos] = useState<Jogador[]>([]);
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});

  const carregarDados = async () => {
    try {
      const dadosCampeonatos = await AsyncStorage.getItem('campeonatos');
      const dadosJogos = await AsyncStorage.getItem('jogos');

      const listaCampeonatos: Campeonato[] = dadosCampeonatos ? JSON.parse(dadosCampeonatos) : [];
      const listaJogos: Jogo[] = dadosJogos ? JSON.parse(dadosJogos) : [];

      const campeonatosVisiveis = listaCampeonatos.filter((c) => !c.arquivado);
      setCampeonatos(campeonatosVisiveis);
      setJogosDoDia([]); // Atualizar lógica se necessário

      const mapaStatus: Record<string, string> = {};
      campeonatosVisiveis.forEach((camp) => {
        const jogosDoCamp = listaJogos.filter((j) => j.campeonatoId === camp.id);

        if (jogosDoCamp.length === 0) {
          mapaStatus[camp.id] = 'A começar';
        } else if (jogosDoCamp.some((j) => j.status === 'em_andamento')) {
          mapaStatus[camp.id] = 'Em andamento';
        } else if (jogosDoCamp.every((j) => j.status === 'finalizado')) {
          mapaStatus[camp.id] = 'Finalizado';
        } else {
          mapaStatus[camp.id] = 'A começar';
        }
      });

      setStatusMap(mapaStatus);
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarDados);
    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Jogos do Dia</Text>

      {jogadoresSuspensos.length > 0 && (
        <View style={styles.alerta}>
          <Text style={styles.titulo}>Jogadores Suspensos</Text>
          {jogadoresSuspensos.map((jogador) => (
            <AlertaSuspensao key={jogador.id} jogador={jogador} />
          ))}
        </View>
      )}

      <FlatList
        data={jogosDoDia}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JogoCard jogo={item} />}
        ListEmptyComponent={<Text style={styles.semDados}>Nenhum jogo para hoje.</Text>}
        scrollEnabled={false}
      />

      <Text style={styles.titulo}>Campeonatos em andamento</Text>
      {campeonatos.length === 0 ? (
        <Text style={styles.semDados}>Nenhum campeonato em andamento.</Text>
      ) : (
        campeonatos.map((camp) => (
          <CampeonatoCard
            key={camp.id}
            campeonato={camp}
            status={statusMap[camp.id] || 'A definir'}
            onPress={(id) => navigation.navigate(ROUTES.CAMPEONATO_DETALHES, { campeonatoId: id })}
          />
        ))
      )}

      <View style={styles.botoes}>
        <TouchableOpacity
          style={[styles.botao, { backgroundColor: '#598404ff' }]}
          onPress={() => navigation.navigate(ROUTES.CAMPEONATO_CADASTRO)}
        >
          <Text style={styles.botaoTexto}>Novo Campeonato</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  alerta: {
    backgroundColor: '#ffe6e6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  semDados: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 12,
  },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  botao: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
