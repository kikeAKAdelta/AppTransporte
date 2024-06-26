import * as React from 'react';
import { useEffect, useState } from 'react';
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
//import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
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
    Button,
    TextInput,
    TouchableOpacity
} from 'react-native';
  
import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';


const Stack = createNativeStackNavigator();

const db  = openDatabase(
    {name: 'Tranporte.db', createFromLocation: '~www/Tranporte.db'},
    () => { console.log('Conexion a la Base de Datos Exitosa New');},
    (error) =>{
        console.error(error);
        throw Error("Error conexion a Base de Datos Local New");
    });

export const RegistroEmpleado = ({navigation, route}) =>{

    const [ empleado, setEmpleado ] = useState([]);
    const [ isFocused, setIsFocused ] = useState(false)
    const [ registroEmp, setRegistroEmp ] = useState();

    const saveEmpleado = () =>{

        let idTransportista = route.params.transport;
        let idRuta          = route.params.ruta;

        const empleado = [
                idTransportista
            ,   idRuta
            ,   registroEmp
        ];

        if(registroEmp == '' || registroEmp == null){

            Toast.show({
                type: 'error',
                text1: 'Codigo de Empleado',
                text2: 'Favor ingrese el codigo de empleado',
                visibilityTime: 2000
            })

            return;
        }

        const insertQuery = `
            INSERT INTO TRANSPORTE_DETALLE 
                (       ID_TRANSPORTISTA
                    ,   ID_RUTA
                    ,   CODIGO_EMPLEADO
                    ,   FECHA_REGISTRO
                )
            VALUES (?, ?, ?, datetime('now','localtime'))
        `

        db.transaction(txn =>{
                txn.executeSql(
                    insertQuery,
                    empleado,
                    (sqlTxn, res) =>{

                        setRegistroEmp('');
                        
                        Toast.show({
                            type: 'success',
                            text1: 'Registro Exitoso',
                            text2: 'Empleado registrado correctamente',
                            visibilityTime: 2000
                        })
                    },
                    error =>{
                        console.log("Error agregando empleado " + error.message);
                    }
                );
            }
        );
    }

    return(
        <View style={styles.container}>
            <View style={[styles.containerInner, styles.boxShadow]}>
                <View style={styles.containerTextLabel}>
                    <Text style={[styles.textLabel, styles.textShadow]}>Registro de Empleados</Text>
                </View>

                <TextInput
                    style={styles.input} 
                    placeholder='Scanee Codigo' 
                    placeholderTextColor= '#000'
                    onFocus = { () => setIsFocused(true)}
                    onChangeText = { (text) => setRegistroEmp(text) }
                    keyboardType="numeric"
                    value = {registroEmp}
                    autoFocus = {true}
                />
                <View style={styles.containerButton}>
                    {/* <Button title="Registrar Empleado" onPress={ saveEmpleado } /> */}
                    <TouchableOpacity
                            style={[styles.buttonLogin, styles.boxShadow]}
                            onPress={ saveEmpleado }
                    >

                        <Text style={styles.textTouchable}>
                            <Icon name="save" size={20} color="#fff" solid />  Registrar Empleado
                        </Text>

                    </TouchableOpacity>
                </View>
            </View>
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
        marginTop: 5,
    },
    containerInner:{
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 7
    },
    textStyle: {
        color: '#000',
        marginBottom: 5
    },
    containerSection:{
        marginTop: 15,
        marginBottom: 15,
    },
    boxShadow:{
        shadowColor: '#000',
        elevation: 20, // Android
        shadowOffset: { height: -2, width: 4 }, // IOS
        shadowOpacity: 0.2, // IOS
        shadowRadius: 3, //IOS
    },
    containerButton:{
        marginTop: 70,
        marginBottom: 20
    },
    textLabel:{
        fontSize: 20,
        color: '#000',
        fontFamily: '',
        fontWeight: 'bold',
        fontStyle: 'italic',
        marginBottom: 17,
    },
    textShadow: {
        textShadowColor: 'rgba(48, 48, 48, 0.3)',
        textShadowOffset: {width: -3, height: 3},
        textShadowRadius: 10
    },
    containerTextLabel:{
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonLogin: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#59B720',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#62C824'
    },
    textTouchable: {
        color: 'white',
        fontSize: 17,
        fontWeight: 'bold',
        justifyContent: 'center',
    },
});
