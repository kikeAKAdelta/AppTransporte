import React, { useEffect, useCallback, useState } from 'react';
import type {Node} from 'react';
import { connectToDatabase, createTables } from './database/AppTransporteDB.js';
import { loadTransportista, getAllTransportistas } from './database/Transportista.js';
import { DropDownTransportista } from './components/dropdown/dropdown.js';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';


/* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
 * LTI update could not be added via codemod */
const Section = ({children, title}): Node => {
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


const App: () => Node = () => {

  
  const [ listTransportista, setListTransportista] = useState([]);
  const [ isLoading, setIsLoading] = useState(true);

  /**Conexion a la BD y Cargamos nuestra tablas */
  const loadData = useCallback(async () =>{
    try{
      //setIsLoading(true);
      console.log('Vedadero');
      const db = await connectToDatabase();
      await createTables(db);
      await loadTransportista(db);
      await getAllTransportistas(db, listTransportista, isLoading);
      //setIsLoading(false);

    }catch(error){
      console.error(error);
    }
  }, []);

  useEffect(() =>{
    /**async function fetchData() {
      await loadData();
      setIsLoading(false);
    }
    fetchData();**/
    loadData();
    
  }, []);

  
    return (
      <View>
        <Text>App de Transporte</Text>
        { isLoading && <DropDownTransportista listTransportista={listTransportista} />}
      </View>
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
