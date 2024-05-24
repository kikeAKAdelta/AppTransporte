import 'react-native-gesture-handler';
import * as React from 'react';
import { useEffect, useCallback, useState } from 'react';
import {  NavigationContainer, DefaultTheme } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { connectToDatabase, createTables } from './database/AppTransporteDB.js';
import { loadTransportista, loadRutas, loadTransportistaRutas } from './database/Transportista.js';
import { DropDownTransportista } from './components/dropdown/CmbTransportista.js';
import { RegistroEmpleado } from './components/Empleado/RegistroEmpleado.js';
import { ConsultaEmpleado } from './components/Empleado/ConsultaEmpleado.js';
import { ExportDataEmpleados } from './components/ExportData/ExportDataUser.js';
import { LoginApp } from './components/login/Login.js';
import { CerrarSession } from './components/login/CerrarSesion.js';
import { SolicitudCapa } from './components/solicitud/solicitud.js'
import { SolicitudList } from './components/solicitud/solicitudList.js'
import { SolicitudDetalle } from './components/solicitud/solicitudDetalle.js'
import { SolicitudDetalleRegistro } from './components/solicitud/solicitudDetalleRegistro.js'
import { SolicitudDetalleList } from './components/solicitud/solicitudDetalleList.js'
import { TransportistaList } from './components/transportista/transportistaList.js'
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome5';

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
const Stack  = createNativeStackNavigator();

const MyTheme = {
  dark: false,
  colors: {
    primary: 'rgb(34, 186, 227)',
    background: 'rgb(242, 242, 242)',
    card: 'rgb(255, 255, 255)',
    text: 'rgb(28, 28, 30)',
    border: 'rgb(199, 199, 204)',
    notification: 'rgb(255, 69, 58)',
  },
};

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

//let db              =  connectToDatabase();

const App = () => {
  
  const [ isLoading, setIsLoading ] = useState(true);

  const fetchData =  () => {

    let db                    = connectToDatabase();       //verificar luego
    /**let tablasCreadas         = createTables(db);
    let cargaRutas            = loadRutas(db);
    let cargaTransportRutas   = loadTransportistaRutas(db);
    let cargaRealizada        = loadTransportista(db);**/
  }

  /**En el ciclo de vida del componente como funcion, se ejecuta despues del renderizado
   * Es un equivalente a CompoenentDidMount, CompoenentDidUpdate que son los Lifecycle de una clase 
   * como componente
   */
  useEffect(() =>{
    fetchData();
  }, []);

  let contador = 0;


  /**
   * Funcion encargada de crear el menu de SideBar
   * @returns 
   */
  const Menu = () =>{
    return (
      <Drawer.Navigator screenOptions={({ navigation }) => ({
            headerStyle: {
              backgroundColor: '#00b4d8',
            },
            headerTintColor: '#fff',
          })} 
        >
        {/* <Drawer.Screen name="Home" component={ DropDownTransportista } options={{
                                                                          drawerIcon: ({focused, size}) => (
                                                                              <Icon name="home" size={20} color="#00b4d8" />
                                                                            ),
                                                                        }} 
        /> */}
        {/* <Drawer.Screen name="Consulta Empleado" component={ ConsultaEmpleado } initialParams={{ contador: contador++ }}  options={{
                                                                                                                            drawerIcon: ({focused, size}) => (
                                                                                                                                <Icon name="search" size={20} color="#00b4d8" />
                                                                                                                              ),
                                                                                                                          }} 

        
        /> */}
        {/* <Drawer.Screen name="Exportar Registros" component={ ExportDataEmpleados }  options={{
                                                                                              drawerIcon: ({focused, size}) => (
                                                                                                  <Icon name="file-export" size={20} color="#00b4d8" />
                                                                                                ),
                                                                                                headerTitle : 'Exportacion de Registros'
                                                                                            }} 
        
        /> */}
        <Drawer.Screen name="Listado Solicitud" component={ SolicitudList }  options={{
                                                                                        drawerIcon: ({focused, size}) => (
                                                                                            <Icon name="clipboard-list" size={20} color="#00b4d8" />
                                                                                          ),
                                                                                          headerTitle: 'Listado de Solicitudes'
                                                                                      }} 
        
        />
        
        <Drawer.Screen name="Crear Solicitud" component={ SolicitudCapa }  options={{
                                                                                      drawerIcon: ({focused, size}) => (
                                                                                          <Icon name="plus-circle" size={20} color="#00b4d8" />
                                                                                        ),
                                                                                    }} 
        
        />
        
        <Drawer.Screen name="Transportistas" component={ TransportistaList } options={{
                                                                                  drawerIcon: ({focused, size}) => (
                                                                                      <Icon name="sign-out-alt" size={20} color="#F70F0F" />
                                                                                    ),
                                                                                }} 

        />

        <Drawer.Screen name="Cerrar Sesion" component={ CerrarSession } options={{
                                                                                  drawerIcon: ({focused, size}) => (
                                                                                      <Icon name="sign-out-alt" size={20} color="#F70F0F" />
                                                                                    ),
                                                                                }} 

        />
      </Drawer.Navigator>
    );
  }

  /**
   * Funcion encargada de crear el contendor principal de navegacion.
   * El unico visual para el usuario sera el del component 'Menu', los demas unicamente se accesara desde codigo.
   */
  return (
    // <AlertNotificationRoot theme={'dark' }>
      <NavigationContainer theme={MyTheme} style={styles.login}>
        <Stack.Navigator >

          <Stack.Screen name="Login" component={ LoginApp } options={{headerShown: false}}  />

          <Stack.Screen 
            name="Menu" 
            component={Menu} 
            options={{headerShown: false}}
          />
          
          <Stack.Screen name="Registro" component={ RegistroEmpleado } 
            options={
                  {
                    title: 'Registro',  
                    headerStyle: {
                                backgroundColor: '#00b4d8',
                    },
                    headerTintColor: '#fff',
                  }
            } 
          />

          <Stack.Screen name="SolicitudDetalle" component={ SolicitudDetalle } 
            options={
                  {
                    title: 'Solicitud Detalle',  
                    headerStyle: {
                                backgroundColor: '#00b4d8',
                    },
                    headerTintColor: '#fff',
                  }
            } 
          />

          <Stack.Screen name="SolicitudDetalleRegistro" component={ SolicitudDetalleRegistro } 
            options={
                  {
                    title: 'Marcacion de Trabajador',  
                    headerStyle: {
                                backgroundColor: '#00b4d8',
                    },
                    headerTintColor: '#fff',
                  }
            } 
          />

          <Stack.Screen name="SolicitudDetalleList" component={ SolicitudDetalleList } 
            options={
                  {
                    title: 'Marcaciones de Trabajadores',  
                    headerStyle: {
                                backgroundColor: '#00b4d8',
                    },
                    headerTintColor: '#fff',
                  }
            }
          />

          

        </Stack.Navigator>
        <Toast />
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
  login:{
    backgroundColor: '#54C2D3',
    marginBottom: 0
  }
});

export default App;
