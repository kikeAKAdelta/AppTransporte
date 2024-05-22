import React, { useState, useEffect } from 'react'
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import Icon from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import { createSessionUser, existSessionUser, getSessionUser } from './../login/Session';
import { useIsFocused } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';

import {
    StyleSheet,    Text,    useColorScheme,    View, Button, TouchableOpacity, TextInput
} from 'react-native';

const db  = openDatabase(
    {name: 'Tranporte.db', createFromLocation: '~Tranporte.db'},
    () => { console.log('Conexion a la Base de Datos Exitosa New');},
    (error) =>{
        console.error(error);
        throw Error("Error conexion a Base de Datos Local New");
    }
);

export const SolicitudDetalleRegistro = ({navigation, route}) =>{

    const [ isFocused, setIsFocused ]       = useState(false);
    const [ registroEmp, setRegistroEmp ]   = useState();

    /**
     * Funcion encargada de registrar un trabajador en la solicitud actual.
     * @returns 
     */
    const saveEmpleado = () =>{

        let idSolicitud     = route.params.idSolicitud;

        if(registroEmp == '' || registroEmp == null){

            Toast.show({
                type: 'error',
                text1: 'Codigo de Trabajador',
                text2: 'Favor ingrese el codigo de trabajador',
                visibilityTime: 2000
            })

            return;
        }

        const empleado = [
                idSolicitud
            ,   registroEmp
        ];

        const insertQuery = `
            INSERT INTO SOLICITUD_DETALLE 
                (       
                        ID_SOLICITUD
                    ,   CODIGO_EMPLEADO
                )
            VALUES (?, ?)
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
                            text2: 'Trabajador registrado correctamente',
                            visibilityTime: 2000
                        })
                    },
                    error =>{
                        console.log("Error agregando trabajador " + error.message);
                    }
                );
            }
        );
    }

    const validacionRegistroEmpleado = () =>{

        /**Primero validamos que no exista en la base de datos */
        const sql = `SELECT COUNT(*) EXISTE FROM SOLICITUD_DETALLE WHERE CODIGO_EMPLEADO = '${registroEmp}'`

        db.transaction(txn => {
            txn.executeSql(
                sql, 
                [],
                (sqlTxn, res) => {
                    
                    let existe = res.rows.item(0).EXISTE;

                    if(existe == 0){
                        saveEmpleado();
                    }else if(existe == 1){

                        Toast.show({
                            type: 'error',
                            text1: 'Trabajador Registrado',
                            text2: 'Trabajador no se puede registrar en la misma solicitud',
                            visibilityTime: 3000
                        })

                        return;
                    }
                },
                error => {
                console.log("Error obteniendo lista de trabajadores registrados " + error.message);
            }
            )
        });
    }


    return(
        <View style={styles.container}>
            <View style={[styles.containerInner, styles.boxShadow]}>
                <View style={styles.containerTextLabel}>
                    <Text style={[styles.textLabel, styles.textShadow]}>Registro de Trabajadores</Text>
                </View>

                <View style={styles.containerTextSolicitud}>
                    <Text style={[styles.textLabel, styles.textShadow]}>Solicitud <Text>#{route.params.idSolicitud}</Text> </Text>
                </View>

                <View style={styles.containerButtonBack}>
                    <TouchableOpacity
                        style={[styles.buttonBack, styles.boxShadow]}
                        onPress= {() => navigation.navigate('Listado Solicitud')}
                    >

                        <Text style={styles.textTouchable}>
                            <Icon name="undo" size={15} color="#fff" />  Regresar
                        </Text>

                    </TouchableOpacity>
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
                            onPress={ validacionRegistroEmpleado }
                    >

                        <Text style={styles.textTouchable}>
                            <Icon name="save" size={20} color="#fff" solid />  Registrar Trabajador
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
    containerTextSolicitud:{
        
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