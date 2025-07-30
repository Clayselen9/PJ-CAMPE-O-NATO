import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Equipe {
  id: string;
  nome: string;
  escudo?: string;
  campeonatoId: string;
  grupoId?: string;
}

interface Fase {
  id: string;
  nome: string;
  tipo: 'classificatória' | 'eliminatória';
  campeonatoId: string;
}

interface Grupo {
  id: string;
  nome: string;
  faseId: string;
}

export default function JogoCadastroScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { faseId, rodada } = route.params as { faseId: string; rodada: number };

  const [fase, setFase] = useState<Fase | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<string | null>(null);

  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [timeA, setTimeA] = useState<Equipe | null>(null);
  const [timeB, setTimeB] = useState<Equipe | null>(null);
  const [local, setLocal] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');

  useEffect(() => {
    carregarFaseEGrupos();
    carregarEquipes();
  }, []);

  const carregarFaseEGrupos = async () => {
    try {
      const fasesData = await AsyncStorage.getItem('fases');
      const listaFases: Fase[] = fasesData ? JSON.parse(fasesData) : [];
      const faseSelecionada = listaFases.find((f) => f.id === faseId);
      if (faseSelecionada) {
        setFase(faseSelecionada);

        if (faseSelecionada.tipo === 'classificatória') {
          const gruposData = await AsyncStorage.getItem('grupos');
          const listaGrupos: Grupo[] = gruposData ? JSON.parse(gruposData) : [];
          const gruposDaFase = listaGrupos.filter((g) => g.faseId === faseId);
          setGrupos(gruposDaFase);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar fase ou grupos.');
    }
  };

  const carregarEquipes = async () => {
    try {
      const dados = await AsyncStorage.getItem('equipes');
      const lista: Equipe[] = dados ? JSON.parse(dados) : [];
      setEquipes(lista);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as equipes.');
    }
  };

  const equipesFiltradas = fase?.tipo === 'classificatória' && grupoSelecionado
    ? equipes.filter((e) => e.grupoId === grupoSelecionado)
    : equipes;

  const salvarJogo = async () => {
    if (!timeA || !timeB) {
      Alert.alert('Erro', 'Selecione os dois times.');
      return;
    }
    if (timeA.id === timeB.id) {
      Alert.alert('Erro', 'Os times não podem ser iguais.');
      return;
    }
    if (!local || !data || !hora) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const novoJogo = {
      id: Date.now().toString(),
      faseId,
      rodada,
      local,
      data,
      hora,
      timeA,
      timeB,
      placarA: null,
      placarB: null,
      status: 'AGENDADO',
    };

    try {
      const dados = await AsyncStorage.getItem('jogos');
      let lista = dados ? JSON.parse(dados) : [];
      lista.push(novoJogo);
      await AsyncStorage.setItem('jogos', JSON.stringify(lista));
      Alert.alert('Sucesso', 'Jogo cadastrado com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o jogo.');
    }
  };

  const selecionarTime = (item: Equipe) => {
    if (!timeA || (timeA && timeB)) {
      setTimeA(item);
      setTimeB(null);
    } else if (timeA && !timeB && timeA.id !== item.id) {
      setTimeB(item);
    }
  };

  const renderItem = ({ item }: { item: Equipe }) => (
    <TouchableOpacity
      style={[
        styles.equipeItem,
        timeA?.id === item.id && { borderColor: '#27ae60', borderWidth: 3 },
        timeB?.id === item.id && { borderColor: '#c0392b', borderWidth: 3 },
      ]}
      onPress={() => selecionarTime(item)}
    >
      {item.escudo && <Image source={{ uri: item.escudo }} style={styles.escudo} />}
      <Text style={styles.nomeEquipe}>{item.nome}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Cadastro de Jogo</Text>

      {fase?.tipo === 'classificatória' && (
        <>
          <Text style={styles.label}>Selecione o Grupo</Text>
          <FlatList
            data={grupos}
            keyExtractor={(item) => item.id}
            horizontal
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setGrupoSelecionado(item.id);
                  setTimeA(null);
                  setTimeB(null);
                }}
                style={[
                  styles.grupoBotao,
                  grupoSelecionado === item.id && styles.grupoSelecionado,
                ]}
              >
                <Text style={styles.grupoTexto}>{item.nome}</Text>
              </TouchableOpacity>
            )}
            style={{ marginBottom: 16 }}
          />
        </>
      )}

      <Text style={styles.label}>Local</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex.: Estádio Municipal"
        value={local}
        onChangeText={setLocal}
      />

      <Text style={styles.label}>Data (dd/mm/aaaa)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex.: 25/07/2025"
        value={data}
        onChangeText={setData}
      />

      <Text style={styles.label}>Hora (hh:mm)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex.: 15:30"
        value={hora}
        onChangeText={setHora}
      />

      <Text style={styles.label}>Selecione os Times</Text>
      <FlatList
        data={equipesFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        style={{ marginBottom: 16 }}
      />

      <TouchableOpacity style={styles.botaoSalvar} onPress={salvarJogo}>
        <Text style={styles.botaoTexto}>Salvar Jogo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botaoSalvar, { backgroundColor: '#95a5a6', marginTop: 10 }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.botaoTexto}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontWeight: 'bold', marginTop: 10, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  equipeItem: {
    borderWidth: 2,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    width: 100,
    backgroundColor: '#f9f9f9',
  },
  escudo: { width: 40, height: 40, marginBottom: 4 },
  nomeEquipe: { fontSize: 12, textAlign: 'center' },
  grupoBotao: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    marginRight: 8,
  },
  grupoSelecionado: {
    backgroundColor: '#27ae60',
  },
  grupoTexto: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  botaoSalvar: {
    backgroundColor: '#27ae60',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
