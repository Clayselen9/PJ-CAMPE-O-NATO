import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ROUTES from '../../navigation/routes';

interface Equipe {
  id: string;
  nome: string;
  escudo?: string;
  campeonatoId: string;
}

interface Jogo {
  id: string;
  timeA: Equipe;
  timeB: Equipe | { id: string; nome: string };
}

export default function EliminatoriaConfigScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { campeonatoId } = route.params as { campeonatoId: string };

  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [selecionadas, setSelecionadas] = useState<Equipe[]>([]);
  const [jogos, setJogos] = useState<Jogo[]>([]);

  useEffect(() => {
    carregarEquipes();
  }, []);

  const carregarEquipes = async () => {
    const dados = await AsyncStorage.getItem('equipes');
    const lista = dados ? JSON.parse(dados) : [];
    const filtradas = lista.filter((eq: Equipe) => eq.campeonatoId === campeonatoId);
    setEquipes(filtradas);
  };

  const toggleSelecionar = (equipe: Equipe) => {
    const existe = selecionadas.find((e) => e.id === equipe.id);
    if (existe) {
      setSelecionadas(selecionadas.filter((e) => e.id !== equipe.id));
    } else {
      setSelecionadas([...selecionadas, equipe]);
    }
  };

  const gerarConfrontosAutomaticos = () => {
    if (selecionadas.length < 2) {
      Alert.alert('Aviso', 'Selecione pelo menos duas equipes.');
      return;
    }

    const times = [...selecionadas];
    if (times.length % 2 !== 0) {
      Alert.alert('Aviso', 'Número ímpar detectado. Será adicionado W.O.');
      times.push({ id: 'WO', nome: 'W.O.' } as Equipe);
    }

    const novosJogos: Jogo[] = [];
    for (let i = 0; i < times.length; i += 2) {
      novosJogos.push({
        id: Date.now().toString() + i,
        timeA: times[i],
        timeB: times[i + 1],
      });
    }
    setJogos(novosJogos);
  };

  const adicionarJogoManual = () => {
    navigation.navigate(ROUTES.JOGO_CADASTRO, { campeonatoId, faseTipo: 'eliminatoria' });
  };

  const salvarFase = async () => {
    try {
      const fase = {
        id: Date.now().toString(),
        tipo: 'eliminatoria',
        jogos,
        campeonatoId,
      };

      const dados = await AsyncStorage.getItem('fases');
      let lista = dados ? JSON.parse(dados) : [];
      lista.push(fase);

      await AsyncStorage.setItem('fases', JSON.stringify(lista));
      Alert.alert('Sucesso', 'Fase eliminatória salva com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a fase.');
    }
  };

  const renderEquipe = ({ item }: { item: Equipe }) => {
    const selecionada = selecionadas.find((e) => e.id === item.id);
    return (
      <TouchableOpacity
        style={[styles.equipeItem, selecionada && styles.equipeSelecionada]}
        onPress={() => toggleSelecionar(item)}
      >
        {item.escudo && <Image source={{ uri: item.escudo }} style={styles.escudo} />}
        <Text>{item.nome}</Text>
      </TouchableOpacity>
    );
  };

  const renderJogo = ({ item }: { item: Jogo }) => (
    <View style={styles.jogoItem}>
      <Text>{item.timeA.nome} vs {item.timeB.nome}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Configuração Eliminatória</Text>
      <Text style={styles.subtitulo}>Selecione as equipes para esta fase:</Text>

      <FlatList
        data={equipes}
        keyExtractor={(item) => item.id}
        renderItem={renderEquipe}
        numColumns={3}
        style={{ marginBottom: 16 }}
      />

      <TouchableOpacity style={styles.botao} onPress={gerarConfrontosAutomaticos}>
        <Text style={styles.botaoTexto}>Gerar Confrontos Automáticos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoAzul} onPress={adicionarJogoManual}>
        <Text style={styles.botaoTexto}>Adicionar Jogo Manual</Text>
      </TouchableOpacity>

      <Text style={[styles.subtitulo, { marginTop: 20 }]}>Jogos Gerados:</Text>
      <FlatList
        data={jogos}
        keyExtractor={(item) => item.id}
        renderItem={renderJogo}
        ListEmptyComponent={<Text>Nenhum jogo adicionado.</Text>}
        style={{ marginBottom: 16 }}
      />

      <TouchableOpacity style={styles.botaoVerde} onPress={salvarFase}>
        <Text style={styles.botaoTexto}>Salvar Fase</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  subtitulo: { fontSize: 16, marginBottom: 8, textAlign: 'center' },
  equipeItem: {
    flex: 1,
    margin: 4,
    padding: 8,
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
    borderRadius: 8,
  },
  equipeSelecionada: { backgroundColor: '#27ae60' },
  escudo: { width: 40, height: 40, marginBottom: 4 },
  botao: {
    backgroundColor: '#8e44ad',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  botaoAzul: {
    backgroundColor: '#2980b9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  botaoVerde: {
    backgroundColor: '#27ae60',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
  jogoItem: {
    padding: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    marginBottom: 8,
  },
});
