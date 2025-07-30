import AsyncStorage from '@react-native-async-storage/async-storage';

export const getFasesByCampeonato = async (campeonatoId: string) => {
  const data = await AsyncStorage.getItem('fases');
  const fases = data ? JSON.parse(data) : [];
  return fases.filter(fase => fase.campeonatoId === campeonatoId);
};

export const getGruposByFase = async (faseId: string) => {
  const data = await AsyncStorage.getItem('grupos');
  const grupos = data ? JSON.parse(data) : [];
  return grupos.filter(grupo => grupo.faseId === faseId);
};

export const getRodadasByFase = async (faseId: string) => {
  const data = await AsyncStorage.getItem('rodadas');
  const rodadas = data ? JSON.parse(data) : [];
  return rodadas.filter(rodada => rodada.faseId === faseId);
};

export const getJogosByRodada = async (rodadaId: string) => {
  const data = await AsyncStorage.getItem('jogos');
  const jogos = data ? JSON.parse(data) : [];
  return jogos.filter(jogo => jogo.rodadaId === rodadaId);
};

export const getEquipesByGrupo = async (grupoId: string) => {
  const data = await AsyncStorage.getItem('equipes');
  const equipes = data ? JSON.parse(data) : [];
  return equipes.filter(equipe => equipe.grupoId === grupoId);
};

export const getClassificacaoByFaseAnterior = async (faseId: string) => {
  const data = await AsyncStorage.getItem('classificacao');
  const classificacao = data ? JSON.parse(data) : [];
  return classificacao.filter(item => item.faseId === faseId).sort((a, b) => b.pontos - a.pontos);
};
