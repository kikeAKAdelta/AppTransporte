import * as React from 'react';
import { useEffect, useState } from 'react';
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    Button,
    TextInput
} from 'react-native';
  
import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const Stack = createNativeStackNavigator();

const db =  openDatabase({name: 'AppTransporteDB.db'});

export const RegistroEmpleado = ({navigation, route}) =>{

    const [ empleado, setEmpleado ] = useState([]);
    const [ isFocused, setIsFocused ] = useState(false);

    console.log(route.params.transport);

    return(
        <View style={styles.container}>
            <TextInput
                style={styles.input} 
                placeholder='Scanee Codigo' 
                placeholderTextColor= '#000'
                onFocus = { () => setIsFocused(true)}
            />
            <Button title="Registrar Empleado" />
        </View>

    );

}

const styles = StyleSheet.create({
    input:{
        borderWidth: 2,
        padding: 10,
        height: 120,
        marginTop:20,
        marginBottom: 10,
        marginLeft: 3,
        marginRight: 3,
        borderRadius: 5,
        color: '#000',
        textAlign: 'center',
        fontSize: 35,
        fontWeight: 'bold',
        borderColor: '#B4B4B4'
    },
    container:{
        marginLeft: 5,
        marginRight: 5,
    },
    textStyle: {
        color: '#000',
        marginBottom: 5
    },
    containerSection:{
        marginTop: 15,
        marginBottom: 15,
    }
});
