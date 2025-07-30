import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CadastroCampeonato from '../screens/Campeonato/Cadastro';
import CampeonatoDetalhes from '../screens/Campeonato/Detalhes';
// (adicione mais telas conforme for criando)

const Drawer = createDrawerNavigator();

export default function Routes() {
  return (
    <Drawer.Navigator initialRouteName="CadastroCampeonato">
      <Drawer.Screen name="CadastroCampeonato" component={CadastroCampeonato} options={{ title: 'Novo Campeonato' }} />
      <Drawer.Screen name="CampeonatoDetalhes" component={CampeonatoDetalhes} options={{ title: 'Campeonato' }} />
      {/* Ex: <Drawer.Screen name="Equipes" component={Equipes} /> */}
    </Drawer.Navigator>
  );
}
