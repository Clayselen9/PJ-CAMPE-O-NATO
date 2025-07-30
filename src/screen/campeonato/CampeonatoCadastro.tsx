// CampeonatoCadastro.tsx revisado
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function CampeonatoCadastro() {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<'aberto' | 'idade'>('aberto');
  const [idadeMinima, setIdadeMinima] = useState('');
  const [escudo, setEscudo] = useState<string | null>(null);
  const navigation = useNavigation();

  const selecionarEscudo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setEscudo(result.assets[0].uri);
    }
  };

  const salvar = async () => {
    if (!nome || !escudo || (categoria === 'idade' && !idadeMinima)) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const novoCampeonato = {
      id: Date.now().toString(),
      nome,
      categoria,
      idadeMinima: categoria === 'idade' ? Number(idadeMinima) : null,
      escudo,
      arquivado: false,
    };

    try {
      const dados = await AsyncStorage.getItem('campeonatos');
      const campeonatos = dados ? JSON.parse(dados) : [];
      campeonatos.push(novoCampeonato);
      await AsyncStorage.setItem('campeonatos', JSON.stringify(campeonatos));
      Alert.alert('Sucesso', 'Campeonato salvo com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar o campeonato.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.titulo}>Cadastro de Campeonato</Text>

      <TextInput
        placeholder="Nome do campeonato"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
      />

      <TouchableOpacity style={styles.escudoArea} onPress={selecionarEscudo}>
        {escudo ? (
          <Image source={{ uri: escudo }} style={styles.escudo} />
        ) : (
          <Text style={styles.escudoTexto}>Selecionar Escudo</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.categorias}>
        <TouchableOpacity
          style={[styles.categoriaBotao, categoria === 'aberto' && styles.categoriaSelecionada]}
          onPress={() => setCategoria('aberto')}
        >
          <Text style={styles.categoriaTexto}>Aberto</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoriaBotao, categoria === 'idade' && styles.categoriaSelecionada]}
          onPress={() => setCategoria('idade')}
        >
          <Text style={styles.categoriaTexto}>Por Idade</Text>
        </TouchableOpacity>
      </View>

      {categoria === 'idade' && (
        <TextInput
          placeholder="Idade mínima"
          keyboardType="numeric"
          value={idadeMinima}
          onChangeText={setIdadeMinima}
          style={styles.input}
        />
      )}

      <TouchableOpacity style={styles.botao} onPress={salvar}>
        <Text style={styles.botaoTexto}>Salvar</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  escudoArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  escudo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  escudoTexto: {
    color: '#888',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categorias: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  categoriaBotao: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  categoriaSelecionada: {
    backgroundColor: '#3498db',
  },
  categoriaTexto: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  botao: {
    backgroundColor: '#2980b9',
    padding: 16,
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
