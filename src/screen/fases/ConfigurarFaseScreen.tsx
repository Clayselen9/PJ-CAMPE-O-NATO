import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Fase {
  id: string;
  nome: string;
  tipo: 'grupos' | 'eliminatoria';
  campeonatoId?: string;
}

export default function ConfigurarFaseScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { campeonatoId, faseId, tipo } = route.params as {
    campeonatoId: string;
    faseId: string;
    tipo: 'grupos' | 'eliminatoria';
  };

  const [fase, setFase] = useState<Fase | null>(null);
  const [novoNome, setNovoNome] = useState<string>('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const key = `fases_${campeonatoId}`;
      const dados = await AsyncStorage.getItem(key);
      if (dados) {
        const lista: Fase[] = JSON.parse(dados);
        const encontrada = lista.find((f) => f.id === faseId);
        if (encontrada) {
          setFase(encontrada);
          setNovoNome(encontrada.nome);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar dados da fase.');
    }
  };

  const salvarAlteracoes = async () => {
    if (!novoNome.trim()) {
      Alert.alert('Erro', 'O nome da fase não pode ser vazio.');
      return;
    }

    try {
      const key = `fases_${campeonatoId}`;
      const dados = await AsyncStorage.getItem(key);
      let lista: Fase[] = dados ? JSON.parse(dados) : [];
      lista = lista.map((f) =>
        f.id === faseId ? { ...f, nome: novoNome.trim() } : f
      );
      await AsyncStorage.setItem(key, JSON.stringify(lista));
      Alert.alert('Sucesso', 'Nome da fase atualizado.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar alterações.');
    }
  };

  const excluirFase = async () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta fase?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const key = `fases_${campeonatoId}`;
              const dados = await AsyncStorage.getItem(key);
              let lista: Fase[] = dados ? JSON.parse(dados) : [];
              lista = lista.filter((f) => f.id !== faseId);
              await AsyncStorage.setItem(key, JSON.stringify(lista));
              Alert.alert('Excluído', 'Fase removida com sucesso.');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Erro ao excluir fase.');
            }
          },
        },
      ]
    );
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
      <Text style={styles.title}>Configurar Fase</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Editar Nome da Fase:</Text>
        <TextInput
          style={styles.input}
          value={novoNome}
          onChangeText={setNovoNome}
        />

        <TouchableOpacity style={styles.botaoSalvar} onPress={salvarAlteracoes}>
          <Text style={styles.botaoTexto}>💾 Salvar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoExcluir} onPress={excluirFase}>
          <Text style={styles.botaoTexto}>🗑 Excluir Fase</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#ecf0f1', padding: 16, borderRadius: 8, marginBottom: 20 },
  label: { fontSize: 14, color: '#555', marginTop: 8 },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
    marginBottom: 12,
  },
  botaoSalvar: {
    backgroundColor: '#27ae60',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  botaoExcluir: {
    backgroundColor: '#c0392b',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
