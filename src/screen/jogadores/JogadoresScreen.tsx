import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Jogador {
  id: string;
  nome: string;
  apelido: string;
  posicao?: string;
  dataNascimento?: string;
  foto?: string;
  equipeId: string;
}

export default function JogadoresScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { equipeId } = route.params as { equipeId: string };

  const [jogadores, setJogadores] = useState<Jogador[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarJogadores);
    return unsubscribe;
  }, [navigation]);

  const carregarJogadores = async () => {
    const dados = await AsyncStorage.getItem('jogadores');
    const lista: Jogador[] = dados ? JSON.parse(dados) : [];
    const filtrados = lista.filter((j) => j.equipeId === equipeId);
    setJogadores(filtrados);
  };

  const calcularIdade = (dataNascimento?: string) => {
    if (!dataNascimento) return null;
    const [dia, mes, ano] = dataNascimento.split('/');
    const nascimento = new Date(Number(ano), Number(mes) - 1, Number(dia));
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const editarJogador = (jogador: Jogador) => {
    navigation.navigate('JogadorCadastro', { jogador, equipeId });
  };

  const excluirJogador = (jogadorId: string) => {
    Alert.alert('Confirmar exclusão', 'Deseja remover este jogador?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          const dados = await AsyncStorage.getItem('jogadores');
          let lista: Jogador[] = dados ? JSON.parse(dados) : [];
          lista = lista.filter((j) => j.id !== jogadorId);
          await AsyncStorage.setItem('jogadores', JSON.stringify(lista));
          carregarJogadores();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Jogador }) => {
    const idade = calcularIdade(item.dataNascimento);
    return (
      <View style={styles.item}>
        {item.foto && (
          <Image source={{ uri: item.foto }} style={styles.fotoMiniatura} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>
            {item.nome} ({item.apelido})
          </Text>
          {item.posicao && (
            <Text style={styles.posicao}>Posição: {item.posicao}</Text>
          )}
          {idade !== null && (
            <Text style={styles.posicao}>Idade: {idade} anos</Text>
          )}
        </View>
        <TouchableOpacity onPress={() => editarJogador(item)} style={styles.acao}>
          <Text style={styles.acaoTexto}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => excluirJogador(item.id)} style={styles.acao}>
          <Text style={styles.acaoTexto}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>👤 Jogadores</Text>

      <FlatList
        data={jogadores}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>Nenhum jogador cadastrado.</Text>}
      />

      <TouchableOpacity
        style={styles.botao}
        onPress={() => navigation.navigate('JogadorCadastro', { equipeId })}
      >
        <Text style={styles.botaoTexto}>➕ Adicionar Jogador</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    marginBottom: 10,
  },
  fotoMiniatura: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  nome: { fontSize: 16, fontWeight: 'bold' },
  posicao: { fontSize: 14, color: '#666' },
  acao: {
    marginLeft: 12,
    padding: 6,
  },
  acaoTexto: {
    fontSize: 18,
  },
  botao: {
    backgroundColor: '#2980b9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
