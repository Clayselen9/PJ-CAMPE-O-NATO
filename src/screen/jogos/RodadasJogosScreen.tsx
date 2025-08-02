import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import ROUTES from '../../navigation/routes';

interface Equipe {
  id: string;
  nome: string;
  escudo?: string;
  grupo?: string;
}

interface Jogo {
  id: string;
  rodada: number;
  faseId: string;
  local: string;
  data: string;
  hora: string;
  timeA: Equipe;
  timeB: Equipe;
  placarA: number | null;
  placarB: number | null;
  status: string; // "ENCERRADO", "AGENDADO"
}

export default function RodadasJogosScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { faseId } = route.params as { faseId: string };

  const [rodadas, setRodadas] = useState<number[]>([]);
  const [rodadaSelecionada, setRodadaSelecionada] = useState<number>(1);
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);

  useEffect(() => {
  carregarEquipes();
  carregarJogos();
  carregarRodadas(); // novo
}, [rodadaSelecionada]);

const carregarRodadas = async () => {
  const dados = await AsyncStorage.getItem(`rodadas_${faseId}`);
  if (dados) {
    setRodadas(JSON.parse(dados));
  } else {
    setRodadas([1]); // valor padrão
    await AsyncStorage.setItem(`rodadas_${faseId}`, JSON.stringify([1]));
  }
};


  const carregarEquipes = async () => {
    const dados = await AsyncStorage.getItem('equipes');
    const lista: Equipe[] = dados ? JSON.parse(dados) : [];
    setEquipes(lista);
  };

  const carregarJogos = async () => {
    const dados = await AsyncStorage.getItem('jogos');
    const lista: Jogo[] = dados ? JSON.parse(dados) : [];
    const filtrados = lista.filter(
      (j) => j.faseId === faseId && j.rodada === rodadaSelecionada
    );
    setJogos(filtrados);
  };

  const adicionarRodada = async () => {
  const novaRodada = rodadas.length + 1;
  const novasRodadas = [...rodadas, novaRodada];
  setRodadas(novasRodadas);
  setRodadaSelecionada(novaRodada);
  await AsyncStorage.setItem(`rodadas_${faseId}`, JSON.stringify(novasRodadas));
};


  const abrirCadastroJogo = () => {
    navigation.navigate(ROUTES.JOGO_CADASTRO, { faseId, rodada: rodadaSelecionada });
  };

  const excluirJogo = (id: string) => {
    Alert.alert('Confirmação', 'Deseja excluir este jogo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            const dados = await AsyncStorage.getItem('jogos');
            let lista: Jogo[] = dados ? JSON.parse(dados) : [];
            lista = lista.filter(j => j.id !== id);
            await AsyncStorage.setItem('jogos', JSON.stringify(lista));
            carregarJogos();
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir o jogo.');
          }
        }
      }
    ]);
  };

  const editarJogo = (id: string) => {
    navigation.navigate(ROUTES.JOGO_CADASTRO, { jogoId: id, faseId, rodada: rodadaSelecionada });
  };

  // NOVA FUNÇÃO: Navegar para tela de andamento do jogo
  const iniciarJogo = (jogo: Jogo) => {
    navigation.navigate(ROUTES.JOGO_ANDAMENTO, { jogoId: jogo.id });
  };

  const renderItem = ({ item }: { item: Jogo }) => (
    <View style={styles.cardJogo}>
      <Text style={styles.local}>
        📍 {item.local} | {item.data} às {item.hora}
      </Text>
      <View style={styles.row}>
        <View style={styles.time}>
          <Image source={{ uri: item.timeA?.escudo }} style={styles.escudo} />
          <Text style={styles.nomeTime}>{item.timeA?.nome}</Text>
        </View>
        <Text style={styles.placar}>
          {item.placarA ?? '-'} : {item.placarB ?? '-'}
        </Text>
        <View style={styles.time}>
          <Image source={{ uri: item.timeB?.escudo }} style={styles.escudo} />
          <Text style={styles.nomeTime}>{item.timeB?.nome}</Text>
        </View>
      </View>
      <Text style={styles.status}>{item.status}</Text>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.button, styles.iniciarButton]}
          onPress={() => iniciarJogo(item)}
        >
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.buttonText}>ENTRAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => editarJogo(item.id)}
        >
          <Ionicons name="pencil" size={20} color="#fff" />
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => excluirJogo(item.id)}
        >
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.buttonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* TOPO */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Rodadas & Jogos</Text>
      </View>

      {/* Tabs de Rodadas */}
      <View style={styles.tabs}>
        {rodadas.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.tab, rodadaSelecionada === r && styles.tabAtiva]}
            onPress={() => setRodadaSelecionada(r)}
          >
            <Text style={styles.tabTexto}>{r}ª Rodada</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.botaoMais} onPress={adicionarRodada}>
          <Ionicons name="add-circle" size={28} color="#2980b9" />
        </TouchableOpacity>
      </View>

      {/* Lista de Jogos */}
      <FlatList
        data={jogos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center' }}>Nenhum jogo cadastrado.</Text>
        }
      />

      {/* Botão Adicionar Jogo */}
      <TouchableOpacity style={styles.botaoAdicionar} onPress={abrirCadastroJogo}>
        <Text style={styles.textoBotao}>+ Adicionar Jogo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  titulo: { fontSize: 20, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  tab: { padding: 8, marginRight: 6, borderBottomWidth: 2, borderColor: 'transparent' },
  tabAtiva: { borderColor: '#2980b9' },
  tabTexto: { fontSize: 14, fontWeight: 'bold' },
  botaoMais: { marginLeft: 6 },
  cardJogo: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { alignItems: 'center', width: 90 },
  escudo: { width: 40, height: 40, marginBottom: 4 },
  nomeTime: { fontSize: 12, textAlign: 'center' },
  placar: { fontSize: 20, fontWeight: 'bold' },
  local: { fontSize: 12, color: '#555', marginBottom: 6 },
  status: { fontSize: 12, textAlign: 'center', marginTop: 6, color: '#e74c3c' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  iniciarButton: {
    backgroundColor: '#27ae60',
  },
  editButton: { backgroundColor: '#2980b9' },
  deleteButton: { backgroundColor: '#c0392b' },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  botaoAdicionar: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  textoBotao: { color: '#fff', fontWeight: 'bold' },
});
