import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ROUTES from '../../navigation/routes';

interface Equipe {
  id: string;
  nome: string;
  escudo?: string;
  tecnico?: string;
  comissao?: string;
  jogadores?: any[];
  campeonatoId: string;
}

export default function EquipesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { campeonatoId } = route.params as { campeonatoId: string };

  const [equipes, setEquipes] = useState<Equipe[]>([]);

  useEffect(() => {
    const carregarEquipes = async () => {
      const dados = await AsyncStorage.getItem('equipes');
      const lista: Equipe[] = dados ? JSON.parse(dados) : [];
      const filtradas = lista.filter((eq) => eq.campeonatoId === campeonatoId);
      setEquipes(filtradas);
    };

    const unsubscribe = navigation.addListener('focus', carregarEquipes);
    return unsubscribe;
  }, [navigation]);

  const irParaCadastro = () => {
    navigation.navigate(ROUTES.EQUIPE_CADASTRO, { campeonatoId });
  };

  const editarEquipe = (equipe: Equipe) => {
    navigation.navigate(ROUTES.EQUIPE_CADASTRO, { campeonatoId, equipe });
  };

  const renderItem = ({ item }: { item: Equipe }) => (
    <TouchableOpacity style={styles.equipeItem} onPress={() => editarEquipe(item)}>
      {item.escudo ? (
        <Image source={{ uri: item.escudo }} style={styles.escudo} />
      ) : (
        <View style={styles.escudoVazio} />
      )}
      <View>
        <Text style={styles.nomeEquipe}>{item.nome}</Text>
        {item.tecnico && (
          <Text style={styles.subInfo}>Técnico: {item.tecnico}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👥 Equipes</Text>

      <FlatList
        data={equipes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>Nenhuma equipe cadastrada ainda.</Text>}
        style={{ marginBottom: 16 }}
      />

      <TouchableOpacity style={styles.botao} onPress={irParaCadastro}>
        <Text style={styles.textoBotao}>Nova Equipe</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  botao: {
    backgroundColor: '#3498db',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  equipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    marginBottom: 10,
  },
  escudo: {
    width: 70,
    height: 70,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
  escudoVazio: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#ccc',
  },
  nomeEquipe: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subInfo: {
    fontSize: 13,
    color: '#555',
  },
});
