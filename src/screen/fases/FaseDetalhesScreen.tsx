import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ROUTES from '../../navigation/routes';

interface Fase {
  id: string;
  nome: string;
  tipo: 'grupos' | 'eliminatoria';
  campeonatoId?: string;
}

interface Jogo {
  id: string;
  faseId: string;
  status: string;
}

interface Rodada {
  id: string;
  faseId: string;
}

export default function FaseDetalhesScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { campeonatoId, faseId } = route.params as {
    campeonatoId: string;
    faseId: string;
  };

  const [fase, setFase] = useState<Fase | null>(null);
  const [totalJogos, setTotalJogos] = useState<number>(0);
  const [rodadas, setRodadas] = useState<Rodada[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarDados();
    });

    return unsubscribe;
  }, [navigation]);

  const carregarDados = async () => {
    try {
      const key = `fases_${campeonatoId}`;
      const dados = await AsyncStorage.getItem(key);
      if (dados) {
        const lista: Fase[] = JSON.parse(dados);
        const encontrada = lista.find((f) => f.id === faseId);
        if (encontrada) setFase(encontrada);
      }

      const dadosJogos = await AsyncStorage.getItem('jogos');
      const listaJogos: Jogo[] = dadosJogos ? JSON.parse(dadosJogos) : [];
      const jogosFase = listaJogos.filter((j) => j.faseId === faseId);
      setTotalJogos(jogosFase.length);

      const dadosRodadas = await AsyncStorage.getItem('rodadas');
      const listaRodadas: Rodada[] = dadosRodadas ? JSON.parse(dadosRodadas) : [];
      const rodadasDaFase = listaRodadas.filter((r) => r.faseId === faseId);
      setRodadas(rodadasDaFase);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados da fase.');
    }
  };

  const abrirConfiguracoes = () => {
    navigation.navigate(ROUTES.CONFIGURAR_FASE, {
      campeonatoId,
      faseId,
      tipo: fase?.tipo,
    });
  };

  const abrirGrupos = () => {
    navigation.navigate(ROUTES.GRUPOS_CONFIG, {
      campeonatoId,
      faseId,
    });
  };

 const abrirRodadasJogos = () => {
  if (fase?.tipo === 'eliminatoria') {
    navigation.navigate(ROUTES.ELIMINATORIA_JOGOS, { campeonatoId, faseId });
  } else {
    navigation.navigate(ROUTES.JOGOS, { campeonatoId, faseId });
  }
};

  const nomesEliminatorias = [
    'Oitavas de Final',
    'Quartas de Final',
    'Semifinal',
    'Final',
  ];

  const nomeDaRodada = (index: number) => {
    if (fase?.tipo === 'eliminatoria') {
      return nomesEliminatorias[nomesEliminatorias.length - rodadas.length + index] || `Rodada ${index + 1}`;
    } else {
      return `Rodada ${index + 1}`;
    }
  };

  if (!fase) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}> Gerar / Gerenciar / alterar </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nome:</Text>
        <Text style={styles.value}>{fase.nome}</Text>

        <Text style={styles.label}>Tipo:</Text>
        <Text style={styles.value}>
          {fase.tipo === 'grupos' ? 'Classificatória (Grupos)' : 'Eliminatória'}
        </Text>

        <Text style={styles.label}>Jogos nesta fase:</Text>
        <Text style={styles.value}>
          {totalJogos} jogo{totalJogos !== 1 ? 's' : ''}
        </Text>
      </View>


      

      {fase.tipo === 'grupos' && (
        <TouchableOpacity style={styles.botaoLaranja} onPress={abrirGrupos}>
          <Text style={styles.botaoTexto}>👥  Grupos</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.botaoVerde} onPress={abrirRodadasJogos}>
        <Text style={styles.botaoTexto}>📅   Rodadas / Jogos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoAzul} onPress={abrirConfiguracoes}>
        <Text style={styles.botaoTexto}>⚙  Configurações</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 24 }}>
        {rodadas.map((rodada, index) => (
          <TouchableOpacity
            key={rodada.id}
            style={styles.rodadaItem}
            onPress={() =>
              navigation.navigate(ROUTES.JOGOS, {
                campeonatoId,
                faseId,
                rodadaId: rodada.id,
              })
            }
          >
            <Text style={styles.rodadaTexto}>{nomeDaRodada(index)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#ecf0f1', padding: 16, borderRadius: 8, marginBottom: 20 },
  label: { fontSize: 14, color: '#555', marginTop: 8 },
  value: { fontSize: 16, fontWeight: 'bold' },

  botaoAzul: {
    backgroundColor: '#2980b9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: -5,
  },
  botaoVerde: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: -5,
    marginBottom: 12,
  },
  botaoLaranja: {
    backgroundColor: '#e67e22',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  rodadaItem: {
    backgroundColor: '#bdc3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  rodadaTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});
