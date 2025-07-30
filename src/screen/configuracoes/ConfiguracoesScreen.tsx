// src/screen/configuracoes/ConfiguracoesScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import ROUTES from '../../navigation/routes';

interface Campeonato {
  id: string;
  nome: string;
  escudo?: string;
  categoria: 'aberto' | 'idade';
  idadeMinima?: number;
}

export default function ConfiguracoesScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { campeonatoId } = route.params as { campeonatoId: string };

  const [campeonato, setCampeonato] = useState<Campeonato | null>(null);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<'aberto' | 'idade'>('aberto');
  const [idadeMinima, setIdadeMinima] = useState('');
  const [escudoUri, setEscudoUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const dados = await AsyncStorage.getItem('campeonatos');
    const lista: Campeonato[] = dados ? JSON.parse(dados) : [];
    const encontrado = lista.find((c) => c.id === campeonatoId);
    if (encontrado) {
      setCampeonato(encontrado);
      setNome(encontrado.nome);
      setCategoria(encontrado.categoria);
      setIdadeMinima(encontrado.idadeMinima?.toString() || '');
      setEscudoUri(encontrado.escudo);
    }
  }

  async function selecionarImagem() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setEscudoUri(result.assets[0].uri);
    }
  }

  async function salvarAlteracoes() {
    if (!nome || !escudoUri) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const dados = await AsyncStorage.getItem('campeonatos');
    const lista: Campeonato[] = dados ? JSON.parse(dados) : [];

    const atualizada = lista.map((c) =>
      c.id === campeonatoId
        ? {
            ...c,
            nome,
            escudo: escudoUri,
            categoria,
            idadeMinima: categoria === 'idade' ? parseInt(idadeMinima) : null,
          }
        : c
    );

    await AsyncStorage.setItem('campeonatos', JSON.stringify(atualizada));
    Alert.alert('Sucesso', 'Configurações salvas com sucesso!');
    navigation.goBack();
  }

  async function excluirCampeonato() {
    Alert.alert('Confirmar Exclusão', 'Tem certeza que deseja excluir este campeonato?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          const dados = await AsyncStorage.getItem('campeonatos');
          const lista: Campeonato[] = dados ? JSON.parse(dados) : [];

          const atualizada = lista.filter((c) => c.id !== campeonatoId);

          await AsyncStorage.setItem('campeonatos', JSON.stringify(atualizada));
          Alert.alert('Sucesso', 'Campeonato excluído.');
          navigation.navigate(ROUTES.HOME);
        },
      },
    ]);
  }

  if (!campeonato) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Configurações do Campeonato</Text>

      <Text style={styles.label}>Nome</Text>
      <TextInput value={nome} onChangeText={setNome} style={styles.input} />

      <Text style={styles.label}>Escudo</Text>
      <TouchableOpacity onPress={selecionarImagem} style={styles.imagePicker}>
        {escudoUri ? (
          <Image source={{ uri: escudoUri }} style={styles.imagePreview} />
        ) : (
          <Text>Selecionar imagem</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.buttonGroup}>
        <Button
          title="Aberto"
          onPress={() => setCategoria('aberto')}
          color={categoria === 'aberto' ? 'green' : 'gray'}
        />
        <Button
          title="Por Idade"
          onPress={() => setCategoria('idade')}
          color={categoria === 'idade' ? 'green' : 'gray'}
        />
      </View>

      {categoria === 'idade' && (
        <>
          <Text style={styles.label}>Idade Mínima</Text>
          <TextInput
            value={idadeMinima}
            onChangeText={setIdadeMinima}
            keyboardType="numeric"
            style={styles.input}
          />
        </>
      )}

      <Button title="Salvar Alterações" onPress={salvarAlteracoes} />

      <View style={{ marginTop: 16 }}>
        <Button title="Excluir Campeonato" color="red" onPress={excluirCampeonato} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  imagePicker: {
    height: 120,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderRadius: 5,
  },
  imagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 5,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
});
