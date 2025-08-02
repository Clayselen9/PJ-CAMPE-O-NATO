import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation } from "@react-navigation/native";
import ROUTES from "../../navigation/routes";

interface Fase {
  id: string;
  nome: string;
  tipo: "grupos" | "eliminatoria";
}

interface Jogo {
  id: string;
  faseId: string;
  status: string; // AGENDADO ou ENCERRADO
}

export default function FasesScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { campeonatoId } = route.params as { campeonatoId: string };

  const [fases, setFases] = useState<Fase[]>([]);
  const [progresso, setProgresso] = useState<{ [faseId: string]: number }>({});
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      carregarFases();
      calcularProgresso();
    });
    return unsubscribe;
  }, [navigation]);

  const carregarFases = async () => {
    try {
      const key = `fases_${campeonatoId}`;
      const dados = await AsyncStorage.getItem(key);
      if (dados) {
        setFases(JSON.parse(dados));
      } else {
        setFases([]);
      }
    } catch (error) {
      console.error("Erro ao carregar fases:", error);
    }
  };

  const calcularProgresso = async () => {
    try {
      const dadosJogos = await AsyncStorage.getItem("jogos");
      const lista: Jogo[] = dadosJogos ? JSON.parse(dadosJogos) : [];
      const porFase: { [faseId: string]: number } = {};

      fases.forEach((fase) => {
        const jogosFase = lista.filter((j) => j.faseId === fase.id);
        const total = jogosFase.length;
        const concluidos = jogosFase.filter(
          (j) => j.status === "ENCERRADO"
        ).length;
        porFase[fase.id] =
          total > 0 ? Math.round((concluidos / total) * 100) : 0;
      });

      setProgresso(porFase);
    } catch (error) {
      console.error("Erro ao calcular progresso:", error);
    }
  };

  const salvarFases = async (novasFases: Fase[]) => {
    try {
      const key = `fases_${campeonatoId}`;
      await AsyncStorage.setItem(key, JSON.stringify(novasFases));
      setFases(novasFases);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a fase.");
    }
  };

  const adicionarFase = (tipo: "grupos" | "eliminatoria") => {
    const nome = `Fase ${fases.length + 1}`;
    const novaFase: Fase = {
      id: Date.now().toString(),
      nome,
      tipo,
    };

    const atualizadas = [...fases, novaFase];
    salvarFases(atualizadas);
    setModalVisible(false);

    navigation.navigate(ROUTES.CONFIGURAR_FASE, {
      campeonatoId,
      faseId: novaFase.id,
      tipo,
    });
  };

  const abrirDetalhesFase = (fase: Fase) => {
    navigation.navigate(ROUTES.FASE_DETALHES, {
      campeonatoId,
      faseId: fase.id,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fases do Campeonato</Text>

      <FlatList
        data={fases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.faseCard}
            onPress={() => abrirDetalhesFase(item)}
          >
            <Text style={styles.nomeFase}>{item.nome}</Text>
            <Text style={styles.tipoFase}>
              Tipo: {item.tipo === "grupos" ? "Grupos" : "Eliminatória"}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progresso[item.id] || 0}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progresso[item.id] || 0}% concluído
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.semDados}>Nenhuma fase adicionada ainda.</Text>
        }
      />

      <TouchableOpacity
        style={styles.botao}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.textoBotao}>Nova Fase</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o tipo da fase</Text>

            <TouchableOpacity
              style={styles.modalBotao}
              onPress={() => adicionarFase("grupos")}
            >
              <Text style={styles.textoBotao}>Classificatória (Grupos)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalBotao}
              onPress={() => adicionarFase("eliminatoria")}
            >
              <Text style={styles.textoBotao}>Eliminatória</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ textAlign: "center", marginTop: 20 }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  faseCard: {
    backgroundColor: "#ecf0f1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  nomeFase: { fontSize: 16, fontWeight: "bold" },
  tipoFase: { fontSize: 14, color: "#555", marginBottom: 8 },
  progressBar: {
    height: 8,
    backgroundColor: "#ccc",
    borderRadius: 4,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressFill: { height: 8, backgroundColor: "#27ae60" },
  progressText: { fontSize: 12, color: "#666" },
  semDados: { textAlign: "center", color: "#999", marginTop: 20 },
  botao: {
    backgroundColor: "#598404ff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  textoBotao: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: { backgroundColor: "#fff", padding: 24, borderRadius: 8 },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalBotao: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
});
