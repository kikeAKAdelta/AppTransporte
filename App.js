import 'react-native-gesture-handler';
import * as React from 'react';
import { useEffect, useCallback, useState } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { connectToDatabase, createTables } from './database/AppTransporteDB.js';
import { loadTransportista, loadRutas, loadTransportistaRutas } from './database/Transportista.js';
import { DropDownTransportista } from './components/dropdown/CmbTransportista.js';
import { RegistroEmpleado } from './components/Empleado/RegistroEmpleado.js';
import { ConsultaEmpleado } from './components/Empleado/ConsultaEmpleado.js';
import { ExportDataEmpleados } from './components/ExportData/ExportDataUser.js';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();


/* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
 * LTI update could not be added via codemod */
const Section = ({children, title}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

let db              =  connectToDatabase();

const App = () => {
  
  const [ isLoading, setIsLoading ] = useState(true);

  const fetchData =  () => {

    let db                    = connectToDatabase();       //verificar luego
    let tablasCreadas         = createTables(db);
    let cargaRutas            = loadRutas(db);
    let cargaTransportRutas   = loadTransportistaRutas(db);
    let cargaRealizada        = loadTransportista(db);
  }

  /**En el ciclo de vida del componente como funcion, se ejecuta despues del renderizado
   * Es un equivalente a CompoenentDidMount, CompoenentDidUpdate que son los Lifecycle de una clase 
   * como componente
   */
  useEffect(() =>{
    fetchData();
  }, []);

  const Menu = () =>{
    return (
      <Drawer.Navigator>
        <Drawer.Screen name="Home" component={DropDownTransportista} />
        <Drawer.Screen name="Consulta Empleado" component={ConsultaEmpleado} />
        <Drawer.Screen name="Exportar Registros" component={ExportDataEmpleados} />
      </Drawer.Navigator>
    );
  }

  
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Menu" 
          component={Menu} 
          options={{headerShown: false}} 
        />
        {/* <Stack.Screen name="Home" component={DropDownTransportista} option={{title: 'Welcome'}} /> */}
        <Stack.Screen name="Registro" component={RegistroEmpleado} option={{title: 'Registro'}} />
        {/* <Stack.Screen name="ConsultaEmpleado" component={ConsultaEmpleado} option={{title: 'Registro'}} /> */}

      </Stack.Navigator>
    </NavigationContainer>
    
  );
  
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
