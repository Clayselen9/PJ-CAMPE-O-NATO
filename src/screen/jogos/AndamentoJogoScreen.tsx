import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';

interface Jogador {
  id: string;
  nome: string;
  sobrenome: string;
  numero: string; // número da camisa do atleta
  equipeId: string;
}

interface Equipe {
  id: string;
  nome: string;
}

interface Gol {
  jogadorId: string;
  contra: boolean;
  minuto?: number;
}

interface Cartao {
  jogadorId: string;
  tipo: 'amarelo' | 'vermelho';
  minuto?: number;
}

interface Jogo {
  id: string;
  timeA: Equipe;
  timeB: Equipe;
  placarA: number;
  placarB: number;
  jogadoresPresenca: string[]; // ids dos jogadores presentes
  gols: Gol[];
  cartoes: Cartao[];
  status: 'AGENDADO' | 'ANDAMENTO' | 'ENCERRADO';
  juiz: string; // nome do juiz
}

const PAGE_SIZE = 10;

export default function AndamentoJogoScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { jogoId } = route.params as { jogoId: string };

  const [jogo, setJogo] = useState<Jogo | null>(null);
  const [jogadores, setJogadores] = useState<Jogador[]>([]);

  const [golsVisiveis, setGolsVisiveis] = useState(PAGE_SIZE);
  const [cartoesVisiveis, setCartoesVisiveis] = useState(PAGE_SIZE);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const jogosRaw = await AsyncStorage.getItem('jogos');
      const jogos: Jogo[] = jogosRaw ? JSON.parse(jogosRaw) : [];
      const jogoAtual = jogos.find((j) => j.id === jogoId);
      if (!jogoAtual) {
        Alert.alert('Erro', 'Jogo não encontrado');
        navigation.goBack();
        return;
      }
      setJogo(jogoAtual);

      const jogadoresRaw = await AsyncStorage.getItem('jogadores');
      const jogadoresList: Jogador[] = jogadoresRaw ? JSON.parse(jogadoresRaw) : [];

      const jogadoresTimeA = jogadoresList.filter(
        (j) => j.equipeId === jogoAtual.timeA.id
      );
      const jogadoresTimeB = jogadoresList.filter(
        (j) => j.equipeId === jogoAtual.timeB.id
      );
      setJogadores([...jogadoresTimeA, ...jogadoresTimeB]);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar dados');
      navigation.goBack();
    }
  }

  function togglePresenca(jogadorId: string) {
    if (!jogo) return;
    const presencaAtual = jogo.jogadoresPresenca || [];
    let novaPresenca;
    if (presencaAtual.includes(jogadorId)) {
      novaPresenca = presencaAtual.filter((id) => id !== jogadorId);
    } else {
      novaPresenca = [...presencaAtual, jogadorId];
    }
    setJogo({ ...jogo, jogadoresPresenca: novaPresenca });
  }

  function atualizarNumeroJogador(jogadorId: string, novoNumero: string) {
    setJogadores((prev) =>
      prev.map((j) =>
        j.id === jogadorId ? { ...j, numero: novoNumero } : j
      )
    );
  }

  function adicionarGol(jogadorId: string, contra: boolean) {
    if (!jogo) return;
    if (!jogo.jogadoresPresenca.includes(jogadorId)) {
      Alert.alert('Aviso', 'Não é possível registrar gol de jogador ausente.');
      return;
    }

    const novosGols = [...(jogo.gols || []), { jogadorId, contra }];
    let placarA = jogo.placarA;
    let placarB = jogo.placarB;

    if (contra) {
      if (jogo.timeA.id === jogadores.find(j => j.id === jogadorId)?.equipeId) {
        placarB += 1;
      } else {
        placarA += 1;
      }
    } else {
      if (jogo.timeA.id === jogadores.find(j => j.id === jogadorId)?.equipeId) {
        placarA += 1;
      } else {
        placarB += 1;
      }
    }

    setJogo({ ...jogo, gols: novosGols, placarA, placarB });
  }

  function adicionarCartao(jogadorId: string, tipo: 'amarelo' | 'vermelho') {
    if (!jogo) return;
    if (!jogo.jogadoresPresenca.includes(jogadorId)) {
      Alert.alert('Aviso', 'Não é possível registrar cartão para jogador ausente.');
      return;
    }

    const novosCartoes = [...(jogo.cartoes || []), { jogadorId, tipo }];
    setJogo({ ...jogo, cartoes: novosCartoes });
  }

  function removerGol(index: number) {
    if (!jogo) return;
    const golRemovido = jogo.gols[index];
    if (!golRemovido) return;

    let placarA = jogo.placarA;
    let placarB = jogo.placarB;

    if (golRemovido.contra) {
      if (jogo.timeA.id === jogadores.find(j => j.id === golRemovido.jogadorId)?.equipeId) {
        placarB -= 1;
      } else {
        placarA -= 1;
      }
    } else {
      if (jogo.timeA.id === jogadores.find(j => j.id === golRemovido.jogadorId)?.equipeId) {
        placarA -= 1;
      } else {
        placarB -= 1;
      }
    }

    const novosGols = [...jogo.gols];
    novosGols.splice(index, 1);
    setJogo({ ...jogo, gols: novosGols, placarA, placarB });
  }

  function removerCartao(index: number) {
    if (!jogo) return;
    const novosCartoes = [...jogo.cartoes];
    novosCartoes.splice(index, 1);
    setJogo({ ...jogo, cartoes: novosCartoes });
  }

  async function salvarJogo() {
    if (!jogo) return;
    try {
      // Atualiza jogadores no AsyncStorage (atualiza números)
      const jogadoresRaw = await AsyncStorage.getItem('jogadores');
      let jogadoresStorage: Jogador[] = jogadoresRaw ? JSON.parse(jogadoresRaw) : [];

      // Atualiza no storage jogadores que estão na lista atual (apenas número)
      jogadoresStorage = jogadoresStorage.map(jSt => {
        const jLocal = jogadores.find(j => j.id === jSt.id);
        return jLocal ? { ...jSt, numero: jLocal.numero } : jSt;
      });

      await AsyncStorage.setItem('jogadores', JSON.stringify(jogadoresStorage));

      // Atualiza jogo no AsyncStorage
      const jogosRaw = await AsyncStorage.getItem('jogos');
      const jogos: Jogo[] = jogosRaw ? JSON.parse(jogosRaw) : [];
      const indice = jogos.findIndex((j) => j.id === jogo.id);
      if (indice >= 0) {
        jogos[indice] = jogo;
        await AsyncStorage.setItem('jogos', JSON.stringify(jogos));
        Alert.alert('Sucesso', 'Jogo salvo com sucesso');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar o jogo');
    }
  }

  async function encerrarJogo() {
    if (!jogo) return;
    Alert.alert(
      'Encerrar Jogo',
      'Você tem certeza que deseja encerrar o jogo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Encerrar',
          style: 'destructive',
          onPress: async () => {
            try {
              const jogosRaw = await AsyncStorage.getItem('jogos');
              const jogos: Jogo[] = jogosRaw ? JSON.parse(jogosRaw) : [];
              const indice = jogos.findIndex((j) => j.id === jogo.id);
              if (indice >= 0) {
                jogos[indice].status = 'ENCERRADO';
                await AsyncStorage.setItem('jogos', JSON.stringify(jogos));
                setJogo({ ...jogo, status: 'ENCERRADO' });
                Alert.alert('Sucesso', 'Jogo encerrado');
                navigation.goBack();
              }
            } catch (error) {
              Alert.alert('Erro', 'Falha ao encerrar o jogo');
            }
          },
        },
      ]
    );
  }

  function renderJogador(jogador: Jogador) {
    const presente = jogo!.jogadoresPresenca?.includes(jogador.id) ?? false;

    return (
      <View key={jogador.id} style={styles.jogadorRow}>
        <TouchableOpacity onPress={() => togglePresenca(jogador.id)} style={styles.checkbox}>
          <View style={[styles.checkboxBox, presente && styles.checkboxChecked]} />
        </TouchableOpacity>

        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ marginRight: 6 }}>#</Text>
          <TextInput
            value={jogador.numero}
            onChangeText={(text) => atualizarNumeroJogador(jogador.id, text)}
            style={styles.numeroInput}
            keyboardType="numeric"
            maxLength={3}
            placeholder="00"
          />
          <Text style={[styles.jogadorNome, { marginLeft: 8 }]}>
            {jogador.nome} {jogador.sobrenome}
          </Text>
        </View>

        <View style={styles.golsCartoes}>

          {/* Botões Gol + e Gol Contra habilitados só se presente */}
          <TouchableOpacity
            onPress={() => adicionarGol(jogador.id, false)}
            style={[styles.botaoGol, !presente && styles.botaoDisabled]}
            disabled={!presente}
          >
            <Text>Gol +</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => adicionarGol(jogador.id, true)}
            style={[styles.botaoGolContra, !presente && styles.botaoDisabled]}
            disabled={!presente}
          >
            <Text>Contra</Text>
          </TouchableOpacity>

          {/* Cartões Amarelo e Vermelho habilitados só se presente */}
          <TouchableOpacity
            onPress={() => adicionarCartao(jogador.id, 'amarelo')}
            style={[styles.botaoAmarelo, !presente && styles.botaoDisabled]}
            disabled={!presente}
          >
            <Text>🟨</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => adicionarCartao(jogador.id, 'vermelho')}
            style={[styles.botaoVermelho, !presente && styles.botaoDisabled]}
            disabled={!presente}
          >
            <Text>🟥</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderGol({ item, index }: { item: Gol; index: number }) {
    const jogador = jogadores.find(j => j.id === item.jogadorId);
    if (!jogador) return null;

    const tipoGol = item.contra ? 'Gol Contra' : 'Gol';
    const presente = jogo!.jogadoresPresenca?.includes(jogador.id);

    return (
      <View style={styles.eventoRow}>
        <Text>
          {tipoGol} - #{jogador.numero} {jogador.nome} {jogador.sobrenome}
        </Text>
        <TouchableOpacity
          onPress={() => presente && removerGol(index)}
          style={[
            styles.botaoRemover,
            !presente && styles.botaoRemoverDisabled,
          ]}
          disabled={!presente}
        >
          <Text style={styles.textoBotaoRemover}>Remover</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderCartao({ item, index }: { item: Cartao; index: number }) {
    const jogador = jogadores.find(j => j.id === item.jogadorId);
    if (!jogador) return null;

    const tipoCartao = item.tipo === 'amarelo' ? 'Cartão Amarelo' : 'Cartão Vermelho';
    const presente = jogo!.jogadoresPresenca?.includes(jogador.id);

    return (
      <View style={styles.eventoRow}>
        <Text>
          {tipoCartao} - #{jogador.numero} {jogador.nome} {jogador.sobrenome}
        </Text>
        <TouchableOpacity
          onPress={() => presente && removerCartao(index)}
          style={[
            styles.botaoRemover,
            !presente && styles.botaoRemoverDisabled,
          ]}
          disabled={!presente}
        >
          <Text style={styles.textoBotaoRemover}>Remover</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function carregarMaisGols() {
    if (!jogo) return;
    if (golsVisiveis < (jogo.gols?.length ?? 0)) {
      setGolsVisiveis(prev => Math.min(prev + PAGE_SIZE, jogo.gols.length));
    }
  }

  function carregarMaisCartoes() {
    if (!jogo) return;
    if (cartoesVisiveis < (jogo.cartoes?.length ?? 0)) {
      setCartoesVisiveis(prev => Math.min(prev + PAGE_SIZE, jogo.cartoes.length));
    }
  }

  if (!jogo) {
    return (
      <View style={styles.center}>
        <Text>Carregando jogo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Jogo: {jogo.timeA.nome} x {jogo.timeB.nome}</Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={styles.subtitulo}>Juiz:</Text>
        <TextInput
          value={jogo.juiz}
          onChangeText={(text) => setJogo(j => j ? { ...j, juiz: text } : j)}
          placeholder="Nome do juiz"
          style={styles.juizInput}
        />
      </View>

      <View style={styles.placarContainer}>
  <View style={styles.placarLinha}>
    <Text style={styles.sigla}>{jogo.timeA.nome.substring(0, 3).toUpperCase()}</Text>
    <Text style={styles.placar}>{jogo.placarA} X {jogo.placarB}</Text>
    <Text style={styles.sigla}>{jogo.timeB.nome.substring(0, 3).toUpperCase()}</Text>
  </View>
</View>

      <Text style={styles.subtitulo}>Lista de Presença</Text>

      <View style={styles.jogadoresContainer}>
        <Text style={styles.timeTitulo}>{jogo.timeA.nome}</Text>
        {jogadores
          .filter((j) => j.equipeId === jogo.timeA.id)
          .map(renderJogador)}
      </View>

      <View style={styles.jogadoresContainer}>
        <Text style={styles.timeTitulo}>{jogo.timeB.nome}</Text>
        {jogadores
          .filter((j) => j.equipeId === jogo.timeB.id)
          .map(renderJogador)}
      </View>

      <Text style={styles.subtitulo}>Gols</Text>
      {!jogo.gols?.length && <Text style={styles.semEventos}>Nenhum gol registrado</Text>}
      <FlatList
        data={(jogo.gols ?? []).slice(0, golsVisiveis)}
        keyExtractor={(_, index) => 'gol-' + index}
        renderItem={renderGol}
        onEndReached={carregarMaisGols}
        onEndReachedThreshold={0.5}
        style={{ maxHeight: 250, marginBottom: 20 }}
      />

      <Text style={styles.subtitulo}>Cartões</Text>
      {!jogo.cartoes?.length && <Text style={styles.semEventos}>Nenhum cartão registrado</Text>}
      <FlatList
        data={(jogo.cartoes ?? []).slice(0, cartoesVisiveis)}
        keyExtractor={(_, index) => 'cartao-' + index}
        renderItem={renderCartao}
        onEndReached={carregarMaisCartoes}
        onEndReachedThreshold={0.5}
        style={{ maxHeight: 250, marginBottom: 20 }}
      />

      <TouchableOpacity style={styles.botaoSalvar} onPress={salvarJogo}>
        <Text style={styles.textoBotao}>Salvar Jogo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoEncerrar} onPress={encerrarJogo}>
        <Text style={styles.textoBotao}>Encerrar Jogo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  placarContainer: { alignItems: 'center', marginVertical: 12 },
  placar: { fontSize: 40, fontWeight: 'bold' },
  subtitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  jogadoresContainer: { marginBottom: 20 },
  timeTitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
  jogadorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 4,
  
  },
  checkbox: { marginRight: 10 },
  checkboxBox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
  },
  checkboxChecked: { backgroundColor: '#27ae60' },
  jogadorNome: { flex: 1 },
  golsCartoes: { flexDirection: 'row', justifyContent: 'space-around', width: 140 },
  botaoGol: {
    backgroundColor: '#2ecc71',
    padding: 4,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  botaoGolContra: {
    backgroundColor: '#f39c12',
    padding: 4,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  botaoAmarelo: {
    backgroundColor: '#f1c40f',
    padding: 4,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  botaoVermelho: {
    backgroundColor: '#e74c3c',
    padding: 4,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  botaoDisabled: {
    opacity: 0.4,
  },
  botaoSalvar: {
    backgroundColor: '#2980b9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  botaoEncerrar: {
    backgroundColor: '#c0392b',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  eventoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  botaoRemover: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  botaoRemoverDisabled: {
    backgroundColor: '#aaa',
  },
  textoBotaoRemover: {
    color: '#fff',
    fontWeight: 'bold',
  },
  semEventos: {
    fontStyle: 'italic',
    color: '#777',
    marginBottom: 8,
    textAlign: 'center',
  },
  juizInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
  },
  numeroInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    width: 40,
    height: 28,
    textAlign: 'center',
    fontSize: 14,
  },
  placarLinha: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},
  sigla: {
  fontSize: 35,
  fontWeight: 'bold',
  marginHorizontal: 10,
},

});
