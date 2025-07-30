import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

interface Equipe {
  id: string;
  nome: string;
  escudo: string;
  campeonatoId: string;
  grupoId?: string;
  faseId?: string;
}

interface Grupo {
  id: string;
  nome: string;
  equipes: Equipe[];
}

export default function GruposConfigScreen() {
  const route = useRoute();
  const { campeonatoId, faseId } = route.params as {
    campeonatoId: string;
    faseId: string;
  };

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [grupoSelecionado, setGrupoSelecionado] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const equipesSalvas = await AsyncStorage.getItem('equipes');
      const gruposSalvos = await AsyncStorage.getItem(`grupos_${faseId}`);

      const todasEquipes: Equipe[] = equipesSalvas ? JSON.parse(equipesSalvas) : [];
      const gruposCarregados: Grupo[] = gruposSalvos ? JSON.parse(gruposSalvos) : [];

      const equipesDoCampeonato = todasEquipes.filter((eq) => eq.campeonatoId === campeonatoId);

      setEquipes(equipesDoCampeonato);
      setGrupos(gruposCarregados);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    }
  };

  const salvarGrupos = async (novosGrupos: Grupo[]) => {
    try {
      await AsyncStorage.setItem(`grupos_${faseId}`, JSON.stringify(novosGrupos));
      setGrupos(novosGrupos);
    } catch {
      Alert.alert('Erro', 'Erro ao salvar os grupos.');
    }
  };

  const adicionarGrupo = () => {
    const letra = String.fromCharCode(65 + grupos.length); // A, B, C...
    const novoGrupo: Grupo = {
      id: Date.now().toString(),
      nome: `Grupo ${letra}`,
      equipes: [],
    };
    const novosGrupos = [...grupos, novoGrupo];
    salvarGrupos(novosGrupos);
  };

  const removerGrupo = (grupoId: string) => {
    Alert.alert('Remover Grupo', 'Deseja remover este grupo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          const novosGrupos = grupos.filter((g) => g.id !== grupoId);
          salvarGrupos(novosGrupos);
        },
      },
    ]);
  };

  const abrirModalSelecao = (grupoId: string) => {
    setGrupoSelecionado(grupoId);
    setModalVisible(true);
  };

  const adicionarEquipeAoGrupo = (equipe: Equipe) => {
    if (!grupoSelecionado) return;

    const novosGrupos = grupos.map((grupo) => {
      if (grupo.id === grupoSelecionado) {
        return {
          ...grupo,
          equipes: [...grupo.equipes, equipe],
        };
      }
      return grupo;
    });

    salvarGrupos(novosGrupos);
    setModalVisible(false);
  };

  const equipesSelecionadasIds = grupos.flatMap((g) => g.equipes.map((eq) => eq.id));
  const equipesDisponiveis = equipes.filter((eq) => !equipesSelecionadasIds.includes(eq.id));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Grupos da Fase</Text>

      {grupos.map((grupo) => (
        <View key={grupo.id} style={styles.grupoCard}>
          <View style={styles.grupoHeader}>
            <Text style={styles.grupoNome}>{grupo.nome}</Text>
            <TouchableOpacity onPress={() => removerGrupo(grupo.id)}>
              <Text style={styles.removerTexto}>Remover</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.equipesContainer}>
            {grupo.equipes.map((eq) => (
              <Image
                key={eq.id}
                source={{ uri: eq.escudo }}
                style={styles.escudo}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.botaoAdicionarEquipe}
            onPress={() => abrirModalSelecao(grupo.id)}
          >
            <Text style={styles.botaoTexto}>+ Adicionar Equipe</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.botaoAdicionarGrupo} onPress={adicionarGrupo}>
        <Text style={styles.botaoTexto}>+ Novo Grupo</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitulo}>Selecione uma equipe</Text>
          <FlatList
            data={equipesDisponiveis}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.equipeItem}
                onPress={() => adicionarEquipeAoGrupo(item)}
              >
                <Image source={{ uri: item.escudo }} style={styles.escudoModal} />
                <Text style={styles.nomeEquipe}>{item.nome}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={styles.fecharModal}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  grupoCard: {
    backgroundColor: '#ecf0f1',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  grupoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  grupoNome: { fontSize: 18, fontWeight: 'bold' },
  removerTexto: { color: 'red', fontWeight: 'bold' },
  equipesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  escudo: { width: 40, height: 40, marginRight: 8 },
  botaoAdicionarEquipe: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  botaoAdicionarGrupo: {
    backgroundColor: '#27ae60',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalContainer: { flex: 1, padding: 20, backgroundColor: '#fff' },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  equipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  escudoModal: { width: 40, height: 40, marginRight: 10 },
  nomeEquipe: { fontSize: 16 },
  fecharModal: { textAlign: 'center', marginTop: 20, color: 'red' },
});
