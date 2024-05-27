import React, { useState, useEffect } from 'react'
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import Icon from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import { createSessionUser, existSessionUser, getSessionUser } from './../login/Session';
import { useIsFocused } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';

import {
    StyleSheet,    Text,    useColorScheme,    View, Button, TouchableOpacity, TextInput, ScrollView
} from 'react-native';

const db  = openDatabase(
    {name: 'Tranporte.db', createFromLocation: '~Tranporte.db'},
    () => { console.log('Conexion a la Base de Datos Exitosa New');},
    (error) =>{
        console.error(error);
        throw Error("Error conexion a Base de Datos Local New");
    }
);

export const Transportista = ({navigation}) =>{

    const isFocused                 = useIsFocused();               /**Cuando tome el foco, si cambia recargara la funcion en useEffect */
    const [ nombre, setNombre]      = useState('');
    const [ dui, setDui]            = useState('');
    const [ password, setPassword]  = useState('');
    const [ placa, setPlaca]        = useState('');
    const [ codigo, setCodigo]      = useState('');
    const [ userSession, setUserSession ] = useState('');

    /**Obtenemos todas las rutas del usuario logueado en Sistema cuando ingrese por primera vez al componente */
    useEffect(() =>{
        getUsuario();
    }, [isFocused] );



    /**
     * Funcion encargada de obtener el usuario logueado en sistema.
     */
    const getUsuario = async () =>{
        const objUser           = await getSessionUser({navigation});

        const codigoUsuario     = objUser.codigoUsuario;
        const idTransportista   = objUser.idTransportista;
        const nombreUsuario     = objUser.nombreUsuario;

        setUserSession(nombreUsuario);
    }

    /**
     * Funcion encargada de poder validar el usuario a crear.
     */
    const validarUsuario = async () =>{

        const objUser = await getSessionUser({navigation});

        let idTransportista = objUser.idTransportista;
        
        if(idTransportista == '' || idTransportista == null){

            Toast.show({
                type: 'error',
                text1: 'Codigo de Empleado',
                text2: 'No se ha detectado el usuario de sistema',
                visibilityTime: 2000
            })

            return;
        }

        if(nombre == '' || nombre == null){

            Toast.show({
                type: 'error',
                text1: 'Nombre de Transportista',
                text2: 'Ingrese el nombre del transportista',
                visibilityTime: 2000
            })

            return;
        }

        if(dui == '' || dui == null){

            Toast.show({
                type: 'error',
                text1: 'DUI de Transportista',
                text2: 'Ingrese el dui del transportista',
                visibilityTime: 2000
            })

            return;
        }

        if(placa == '' || placa == null){

            Toast.show({
                type: 'error',
                text1: 'Placa de Transportista',
                text2: 'Ingrese la placa del transportista',
                visibilityTime: 2000
            })

            return;
        }

        if(codigo == '' || codigo == null){

            Toast.show({
                type: 'error',
                text1: 'Codigo de Transportista',
                text2: 'Ingrese el codigo del transportista',
                visibilityTime: 2000
            })

            return;
        }

        if(password == '' || password == null){

            Toast.show({
                type: 'error',
                text1: 'Password de Transportista',
                text2: 'Ingrese el password del transportista',
                visibilityTime: 2000
            })

            return;
        }

        registroUsuario();        
        
    }

    /**
     * Funcion encargada de poder agregar un nuevo usuario en BD local.
     */
    const registroUsuario = () =>{

        let usuario = [
                nombre
            ,   dui
            ,   placa
            ,   codigo
            ,   password
        ];

        const insertQuery = `
            INSERT INTO TRANSPORTISTA 
                (       
                        NOMBRE
                    ,   DUI
                    ,   PLACA
                    ,   CODIGO_USUARIO
                    ,   PASSWORD
                )
            VALUES (?, ?, ?, ?, ?)
        `;

        db.transaction(txn =>{
            txn.executeSql(
                    insertQuery,
                    usuario,
                    (sqlTxn, res) =>{
                        
                        Toast.show({
                            type: 'success',
                            text1: 'Creacion de Transportista',
                            text2: 'Transportista creado correctamente',
                            visibilityTime: 2000
                        })

                        navigation.navigate('Transportistas', {navigation})

                    },
                    error =>{
                        console.log("Error creando transportista " + error.message);
                    }
                );
            }
        );
    }

    return (

        <ScrollView vertical={true} >

            <View style={styles.container}>

                <View style={[styles.containerInner, styles.boxShadow]}>
                    
                    <View style={[styles.containerTextLabel]}>
                        <Text style={[styles.textLabel, styles.textShadow]}>Creacion de Nuevo Transportista</Text>
                    </View>

                    <View style={styles.containerElements}>

                        <View style={styles.containerUsuario}>
                        </View>

                        <View style={styles.containerButtonBack}>
                                <TouchableOpacity
                                    style={[styles.buttonBack, styles.boxShadow]}
                                    onPress= {() => navigation.navigate('TransportistaList')}
                                >

                                    <Text style={styles.textTouchable}>
                                        <Icon name="undo" size={15} color="#fff" />  Regresar
                                    </Text>

                                </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.containerSection}>
                        <Text style={styles.textStyle}>Nombre:</Text>
                        <TextInput 
                            style = {styles.input} 
                            placeholder='Nombre' 
                            placeholderTextColor= '#CFD0D0'
                            onChangeText = { (text) => setNombre(text) }
                            keyboardType="text"
                            value = {nombre}
                            autoFocus={true}
                        />
                    </View>

                    <View style={styles.containerSection}>
                        <Text style={styles.textStyle}>DUI:</Text>
                        <TextInput 
                            style = {styles.input} 
                            placeholder='Dui' 
                            placeholderTextColor= '#CFD0D0'
                            onChangeText = { (text) => setDui(text) }
                            keyboardType="numeric"
                            value = {dui}
                        />
                    </View>

                    <View style={styles.containerSection}>
                        <Text style={styles.textStyle}>Placa:</Text>
                        <TextInput 
                            style = {styles.input} 
                            placeholder='Placa' 
                            placeholderTextColor= '#CFD0D0'
                            onChangeText = { (text) => setPlaca(text) }
                            keyboardType="numeric"
                            value = {placa}
                        />
                    </View>

                    <View style={styles.containerSection}>
                        <Text style={styles.textStyle}>Codigo Usuario:</Text>
                        <TextInput 
                            style = {styles.input} 
                            placeholder='Codigo Usuario' 
                            placeholderTextColor= '#CFD0D0'
                            onChangeText = { (text) => setCodigo(text) }
                            keyboardType="numeric"
                            value = {codigo}
                        />
                    </View>

                    <View style={styles.containerSection}>
                        <Text style={styles.textStyle}>Password:</Text>
                        <TextInput 
                            style = {styles.input} 
                            placeholder='Password' 
                            placeholderTextColor= '#CFD0D0'
                            onChangeText = { (text) => setPassword(text) }
                            keyboardType="numeric"
                            value = {password}
                            secureTextEntry={ true }
                        />
                    </View>


                    <View style={styles.containerButton}>
                        <TouchableOpacity
                                style = {[styles.buttonLogin, styles.boxShadow]}
                                onPress={validarUsuario}
                            >

                                <Text style = {styles.textTouchable}>
                                    <Icon name="save" size={20} color="#fff" solid />  Crear Transportista
                                </Text>

                        </TouchableOpacity>
                    </View>
                </View>

            </View>

        </ScrollView>

    );

}

const styles = StyleSheet.create({
    input:{
        borderWidth: 1,
        padding: 7,
        marginTop: 1,
        marginBottom: 15,
        borderRadius: 10,
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        borderColor: '#c4c4c4',
        color: '#000'
        //backgroundColor: 'rgba(0,0,0,0.4)', // 40% opaque
    },
    containerTextLabel:{
        alignItems: 'center',
        justifyContent: 'center'
    },
    containerElements:{
        justifyContent: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 3
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
    styleCmb:{
        backgroundColor: '#000',
        color: '#000'
    },
    textStyle: {
        color: '#000',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    textStyleUser: {
        color: '#00b4d8',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    containerSection:{
        marginTop: 0,
        marginBottom: 0,
    },
    containerRuta:{
        marginTop: 20,
        marginBottom: 15,
    },
    containerButton:{
        marginTop: 25,
        marginBottom: 15,
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
    boxShadow:{
        shadowColor: 'rgba(0, 0, 0, 7)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 5, // Android
    },
    textTouchable: {
        color: 'white',
        fontSize: 15.5,
        fontWeight: 'bold',
        justifyContent: 'center', //Centered vertically
    },
    textLabel:{
        fontSize: 20,
        color: '#000',
        fontFamily: '',
        fontWeight: 'bold',
        fontStyle: 'italic',
        marginBottom: 17,
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
    textShadow: {
        textShadowColor: 'rgba(48, 48, 48, 0.3)',
        textShadowOffset: {width: -3, height: 3},
        textShadowRadius: 10
    },
    buttonBack: {
        height: 30,
        padding: 3,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F51717',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#FF0000'
    },
    containerButtonBack:{
        alignItems: 'flex-end',
        width: '30%',
    },
    containerUsuario: {
        width: '70%',
    },
});