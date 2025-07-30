import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screen/home/HomeScreen';

// Campeonato
import CampeonatoCadastro from '../screen/campeonato/CampeonatoCadastro';
import CampeonatoDetalhes from '../screen/campeonato/CampeonatoDetalhes';
import CampeonatoInterno from '../screen/campeonato/CampeonatoInterno';
import CampeonatoResumo from '../screen/campeonato/CampeonatoResumo';
import CampeonatoCard from '../screen/campeonato/CampeonatoCard';

// Equipes
import EquipesScreen from '../screen/equipes/EquipesScreen';
import EquipeCadastro from '../screen/equipes/EquipeCadastro';

// Jogadores
import JogadoresScreen from '../screen/jogadores/JogadoresScreen';
import JogadorCadastro from '../screen/jogadores/JogadorCadastro';

// Fases
import FasesScreen from '../screen/fases/FasesScreen';
import ConfigurarFaseScreen from '../screen/fases/ConfigurarFaseScreen';
import GruposConfigScreen from '../screen/fases/GruposConfigScreen';
import EliminatoriaConfigScreen from '../screen/fases/EliminatoriaConfigScreen';
import FaseDetalhesScreen from '../screen/fases/FaseDetalhesScreen';

// Jogos
import RodadasJogosScreen from '../screen/jogos/RodadasJogosScreen';
import JogoCadastroScreen from '../screen/jogos/JogoCadastroScreen';

// Estatísticas e Configurações
import EstatisticasScreen from '../screen/estatisticas/EstatisticasScreen';
import ConfiguracoesScreen from '../screen/configuracoes/ConfiguracoesScreen';

import ROUTES from './routes';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName={ROUTES.HOME}>
      <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />

      {/* Campeonato */}
      <Stack.Screen name={ROUTES.CAMPEONATO_CADASTRO} component={CampeonatoCadastro} />
      <Stack.Screen name={ROUTES.CAMPEONATO_DETALHES} component={CampeonatoDetalhes} />
      <Stack.Screen name={ROUTES.CAMPEONATO_INTERNO} component={CampeonatoInterno} />
      <Stack.Screen name={ROUTES.CAMPEONATO_RESUMO} component={CampeonatoResumo} />
      <Stack.Screen name={ROUTES.CAMPEONATO_CARD} component={CampeonatoCard} />

      {/* Equipes */}
      <Stack.Screen name={ROUTES.EQUIPES} component={EquipesScreen} />
      <Stack.Screen name={ROUTES.EQUIPE_CADASTRO} component={EquipeCadastro} />

      {/* Jogadores */}
      <Stack.Screen name={ROUTES.JOGADORES} component={JogadoresScreen} />
      <Stack.Screen name={ROUTES.JOGADOR_CADASTRO} component={JogadorCadastro} />

      {/* Fases */}
      <Stack.Screen name={ROUTES.FASES} component={FasesScreen} />
      <Stack.Screen name={ROUTES.CONFIGURAR_FASE} component={ConfigurarFaseScreen} />
      <Stack.Screen name={ROUTES.GRUPOS_CONFIG} component={GruposConfigScreen} />
      <Stack.Screen name={ROUTES.ELIMINATORIA_CONFIG} component={EliminatoriaConfigScreen} />
      <Stack.Screen name={ROUTES.FASE_DETALHES} component={ FaseDetalhesScreen } />

      {/* Jogos */}
      <Stack.Screen name={ROUTES.JOGOS} component={RodadasJogosScreen} />
      <Stack.Screen name={ROUTES.JOGO_CADASTRO} component={JogoCadastroScreen} />

      {/* Estatísticas */}
      <Stack.Screen name={ROUTES.ESTATISTICAS} component={EstatisticasScreen} />

      {/* Configurações */}
      <Stack.Screen name={ROUTES.CONFIGURACOES} component={ConfiguracoesScreen} />
    </Stack.Navigator>
  );
}
