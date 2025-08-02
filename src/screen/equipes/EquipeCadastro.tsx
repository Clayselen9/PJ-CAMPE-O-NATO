import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';

export default function EquipeCadastro() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { campeonatoId, equipe } = route.params as {
    campeonatoId: string;
    equipe?: any;
  };

  const [nome, setNome] = useState(equipe?.nome || '');
  const [tecnico, setTecnico] = useState(equipe?.tecnico || '');
  const [comissao, setComissao] = useState(equipe?.comissao || '');
  const [escudo, setEscudo] = useState<string | null>(equipe?.escudo || null);
  const [mostrarConfiguracoes, setMostrarConfiguracoes] = useState(false);
  const [equipeId] = useState(equipe?.id || Date.now().toString());

  const selecionarImagem = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setEscudo(result.assets[0].uri);
    }
  };

  const salvarEquipe = async () => {
    if (!nome) {
      Alert.alert('Erro', 'Informe o nome da equipe');
      return;
    }

    const novaEquipe = {
      id: equipeId,
      nome,
      tecnico,
      comissao,
      escudo,
      jogadores: [],
      campeonatoId,
    };

    try {
      const dados = await AsyncStorage.getItem('equipes');
      let lista = dados ? JSON.parse(dados) : [];
      const existe = lista.some((e: any) => e.id === equipeId);

      if (existe) {
        lista = lista.map((e: any) => (e.id === equipeId ? novaEquipe : e));
      } else {
        lista.push(novaEquipe);
      }

      await AsyncStorage.setItem('equipes', JSON.stringify(lista));
      Alert.alert('Sucesso', 'Equipe salva com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar equipe');
    }
  };

  const excluirEquipe = async () => {
    Alert.alert('Excluir equipe', 'Deseja realmente excluir esta equipe?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            const dados = await AsyncStorage.getItem('equipes');
            let lista = dados ? JSON.parse(dados) : [];
            lista = lista.filter((e: any) => e.id !== equipeId);
            await AsyncStorage.setItem('equipes', JSON.stringify(lista));

            const dadosJogadores = await AsyncStorage.getItem('jogadores');
            let jogadoresLista = dadosJogadores ? JSON.parse(dadosJogadores) : [];
            jogadoresLista = jogadoresLista.filter((j: any) => j.equipeId !== equipeId);
            await AsyncStorage.setItem('jogadores', JSON.stringify(jogadoresLista));

            Alert.alert('Sucesso', 'Equipe excluída.');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Erro', 'Erro ao excluir equipe');
          }
        },
      },
    ]);
  };

  const importarJogadores = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'text/csv' });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      const fileUri = result.assets[0].uri;

      // Leitura via expo-file-system
      const texto = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const { data } = Papa.parse(texto, {
        header: true,
        skipEmptyLines: true,
      });

      const jogadoresImportados = data.map((linha: any) => ({
        id: Date.now().toString() + Math.random(),
        nome: linha.nome || '',
        apelido: linha.apelido || '',
        posicao: linha.posicao || '',
        dataNascimento: linha.dataNascimento || '',
        equipeId,
      }));

      const dados = await AsyncStorage.getItem('jogadores');
      const listaAtual = dados ? JSON.parse(dados) : [];

      await AsyncStorage.setItem(
        'jogadores',
        JSON.stringify([...listaAtual, ...jogadoresImportados])
      );

      Alert.alert('Importação concluída', 'Jogadores importados com sucesso!');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Erro ao importar jogadores');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Cadastro da Equipe</Text>

      {escudo && <Image source={{ uri: escudo }} style={styles.escudo} />}
      <Text style={styles.nomeEquipe}>{nome}</Text>

      <TouchableOpacity
        style={styles.botaoCinza}
        onPress={() => setMostrarConfiguracoes(!mostrarConfiguracoes)}
      >
        <Text style={styles.botaoTexto}>informações da Equipe</Text>
      </TouchableOpacity>

      {mostrarConfiguracoes && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nome da Equipe"
            value={nome}
            onChangeText={setNome}
          />
          <TextInput
            style={styles.input}
            placeholder="Técnico"
            value={tecnico}
            onChangeText={setTecnico}
          />
          <TouchableOpacity style={styles.imagemArea} onPress={selecionarImagem}>
            {escudo ? (
              <Image source={{ uri: escudo }} style={styles.imagem} />
            ) : (
              <Text style={styles.imagemTexto}>Selecionar Escudo</Text>
            )}
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity
        style={styles.botaoAzul}
        onPress={() => navigation.navigate('JogadoresScreen', { equipeId })}
      >
        <Text style={styles.botaoTexto}> Cadastro de Jogadores</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoVerde} onPress={salvarEquipe}>
        <Text style={styles.botaoTexto}>Salvar Equipe</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoExcluir} onPress={excluirEquipe}>
            <Text style={styles.botaoTexto}>Excluir Equipe</Text>
          </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  escudo: { width: 80, height: 80, alignSelf: 'center', marginBottom: 12, borderRadius: 10 },
  nomeEquipe: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 10,
  },

  imagemArea: {
    alignSelf: 'center',
    backgroundColor: '#eee',
    borderRadius: 10,
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: -5,
  },
  imagemTexto: { color: '#666', textAlign: 'center' },
  imagem: { width: 140, height: 140, borderRadius: 20 },
  botaoVerde: {
    backgroundColor: '#27ae60',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  botaoAzul: {
    backgroundColor: '#2980b9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: -5,
  },

  
  botaoExcluir: {
    backgroundColor: '#c0392b',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  botaoCinza: {
    backgroundColor: '#7f8c8d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    marginTop: -5,
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
