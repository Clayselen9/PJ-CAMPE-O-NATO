import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

interface Jogador {
  id: string;
  nome: string;
  apelido: string;
  posicao?: string;
  dataNascimento?: string;
  foto?: string;
  equipeId: string;
}

export default function JogadorCadastro() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { equipeId, jogador } = route.params as {
    equipeId: string;
    jogador?: Jogador;
  };

  const [nome, setNome] = useState(jogador?.nome || '');
  const [apelido, setApelido] = useState(jogador?.apelido || '');
  const [posicao, setPosicao] = useState(jogador?.posicao || '');
  const [dataNascimento, setDataNascimento] = useState(jogador?.dataNascimento || '');
  const [idade, setIdade] = useState<number | null>(null);
  const [foto, setFoto] = useState<string | undefined>(jogador?.foto);
  const [jogadorId] = useState(jogador?.id || Date.now().toString());

  useEffect(() => {
    if (dataNascimento) {
      const idadeCalculada = calcularIdade(dataNascimento);
      setIdade(idadeCalculada);
    }
  }, [dataNascimento]);

  const calcularIdade = (data: string) => {
    const [dia, mes, ano] = data.split('/');
    const nascimento = new Date(`${ano}-${mes}-${dia}`);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();

    if (
      mesAtual < nascimento.getMonth() ||
      (mesAtual === nascimento.getMonth() && diaAtual < nascimento.getDate())
    ) {
      idade--;
    }
    return idade;
  };

  const tirarOuSelecionarFoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setFoto(result.assets[0].uri);
    }
  };

  const salvarJogador = async () => {
    if (!nome || !apelido) {
      Alert.alert('Erro', 'Preencha nome e apelido');
      return;
    }

    const novo: Jogador = {
      id: jogadorId,
      nome,
      apelido,
      posicao,
      dataNascimento,
      foto,
      equipeId,
    };

    try {
      const dados = await AsyncStorage.getItem('jogadores');
      let lista: Jogador[] = dados ? JSON.parse(dados) : [];

      const existe = lista.some((j) => j.id === jogadorId);
      if (existe) {
        lista = lista.map((j) => (j.id === jogadorId ? novo : j));
      } else {
        lista.push(novo);
      }

      await AsyncStorage.setItem('jogadores', JSON.stringify(lista));
      Alert.alert('Sucesso', 'Jogador salvo com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o jogador.');
    }
  };

  const excluirJogador = async () => {
    Alert.alert('Excluir jogador', 'Deseja realmente excluir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            const dados = await AsyncStorage.getItem('jogadores');
            let lista: Jogador[] = dados ? JSON.parse(dados) : [];
            lista = lista.filter((j) => j.id !== jogadorId);
            await AsyncStorage.setItem('jogadores', JSON.stringify(lista));
            Alert.alert('Sucesso', 'Jogador excluído.');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir o jogador.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastro de Jogador</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Apelido"
        value={apelido}
        onChangeText={setApelido}
      />
      <TextInput
        style={styles.input}
        placeholder="Posição (opcional)"
        value={posicao}
        onChangeText={setPosicao}
      />
      <TextInput
        style={styles.input}
        placeholder="Data de Nascimento (dd/mm/aaaa)"
        value={dataNascimento}
        onChangeText={setDataNascimento}
      />

      {idade !== null && (
        <Text style={styles.idadeTexto}>Idade: {idade} anos</Text>
      )}

      <TouchableOpacity style={styles.fotoArea} onPress={tirarOuSelecionarFoto}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.fotoMiniatura} />
        ) : (
          <Text style={styles.fotoTexto}>Selecionar Foto</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.botao} onPress={salvarJogador}>
        <Text style={styles.botaoTexto}>Salvar Jogador</Text>
      </TouchableOpacity>

      {jogador && (
        <TouchableOpacity
          style={[styles.botao, { backgroundColor: '#c0392b' }]}
          onPress={excluirJogador}
        >
          <Text style={styles.botaoTexto}>Excluir Jogador</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: '#95a5a6' }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.botaoTexto}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  idadeTexto: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#555',
  },
  fotoArea: {
    alignSelf: 'center',
    backgroundColor: '#eee',
    borderRadius: 8,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  fotoTexto: {
    color: '#555',
  },
  fotoMiniatura: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  botao: {
    backgroundColor: '#27ae60',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
