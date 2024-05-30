import 'react-native-gesture-handler';
import * as React from 'react';
import { useEffect, useCallback, useState } from 'react';
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { createSessionUser, existSessionUser } from './Session.js';
//import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome5';
import database from '@react-native-firebase/database';


import {
    StyleSheet,    Text,    useColorScheme,    View, Button, TextInput, Image, TouchableOpacity, ImageBackground
} from 'react-native';

const db  = openDatabase(
    {name: 'Tranporte.db', createFromLocation: '~www/Tranporte.db', location: 'Library'},
    () => { console.log('Conexion a la Base de Datos Exitosa New');},
    (error) =>{
        console.error(error);
        throw Error("Error conexion a Base de Datos Local New");
    }
);

export const LoginApp = ({navigation}) =>{

    const [ usuario  , setUsuario ] = useState('');
    const [ password , setPassword ] = useState('');
    const isFocused = useIsFocused();               /**Cuando tome el foco, si cambia recargara la funcion en useEffect */

    const loginUsuario = () =>{

        if(usuario == ''){

            Toast.show({
                type: 'error',
                text1: 'Codigo de Usuario',
                text2: 'Ingrese el codigo de usuario',
                visibilityTime: 2000,
                props: {
                    renderLeadingIcon: () =>{
                        <Icon name="save" size={20} color="#fff" solid />
                    }
                },
            })

            return;
        }

        if(password == ''){
            Toast.show({
                type: 'error',
                text1: 'Password',
                text2: 'Ingrese el Password',
                visibilityTime: 2000
            })
            return;
        }

        db.transaction(txn => {

            txn.executeSql(
                `SELECT 
                        ID_TRANSPORTISTA
                    ,   CODIGO_USUARIO
                    ,   PASSWORD
                    ,   NOMBRE   
                FROM 
                    TRANSPORTISTA 
                WHERE 
                        CODIGO_USUARIO  = '${usuario}'
                    AND PASSWORD        = '${password}' 
                `,
                [],
                (sqlTxn, res) => {
    
                    let len = res.rows.length;

                    if (len > 0) {

                        database().ref(`/users/${usuario}`).once("value").then(snapshot => {        /**Implementacion de Firebase */

                            if((snapshot.val() != '') && (snapshot.val() != null)){

                                let estadoUsuario = snapshot.val().estado;

                                if(estadoUsuario == 0){             /**Inactivo en el Cloud de Firebase */

                                    Toast.show({
                                        type: 'error',
                                        text1: 'Error Sesion',
                                        text2: 'Usuario se encuentra inactivo',
                                        visibilityTime: 2000
                                    })
                                    
                                }else{
                                    Toast.show({
                                        type: 'success',
                                        text1: 'Sesion Exitosa',
                                        text2: 'Sesion iniciada correctamente',
                                        visibilityTime: 2000
                                    })
            
                                    const objUsuario   = res.rows.item(0);
            
                                    const sesionUsuario = {
                                        'idTransportista'   : objUsuario.ID_TRANSPORTISTA,
                                        'codigoUsuario'     : objUsuario.CODIGO_USUARIO,
                                        'nombreUsuario'     : objUsuario.NOMBRE
                                    };
            
            
                                    createSessionUser(sesionUsuario);
                                    navigation.navigate('Menu', {navigation})
                                }

                            }else{

                                Toast.show({
                                    type: 'error',
                                    text1: 'Error Sesion',
                                    text2: 'Usuario no existe en la nube',
                                    visibilityTime: 2000
                                })
                            }
                        
                        })
                        .catch(error => {
                            Toast.show({
                                type: 'error',
                                text1: 'Error Sesion',
                                text2: `${error}`,
                                visibilityTime: 2000
                            })

                            console.log(error);
                        });
                        
                    }else{

                        //alert('Credenciales incorrectas');
                        Toast.show({
                            type: 'error',
                            text1: 'Credenciales',
                            text2: 'Credenciales incorrectas, intente nuevamente',
                            visibilityTime: 2000
                        })
                    }
                },
                    error => {
                    console.log("error obteniendo lista de transportista " + error.message);
                },
            );
        });


    }

    useEffect(() => {

        const fetchData = async () =>{
            await existSessionUser({navigation});
        }

        fetchData();
        setUsuario('');
        setPassword('');

    }, [isFocused]);


    return(
        <View style={styles.container}>

            {/* <ImageBackground source={require('./../../assets/pettenati_2021.jpg')} resizeMode="cover" imageStyle= {{opacity:0.7}} style={styles.imageFondo}> */}
                
                <View style={[styles.containerTextIcon]}>
                    <Icon style={styles.iconPosition} name="bus" size={30} color="#fff" />
                </View>
                <View style={[styles.containerTextTransport]}>
                    <Text style={styles.textApp}>App Transporte</Text>
                </View>
                <View style={[styles.containerTextApp, styles.boxShadowText]}>
                    <Image
                        style={[styles.logoImage, styles.boxShadowImage]}
                        source={require('./../../assets/fondoBlue2.png')}
                        resizeMode={"cover"}
                    />
                </View>

                <View style={[styles.containerInner, styles.boxShadowText]}>
                    

                    {/* <View style={[styles.containerImage]}> */}
                        {/* <Image */}
                            {/* style={[styles.logoImage, styles.boxShadowImage]} */}
                            {/* source={require('./../../assets/logo.png')} */}
                        {/* /> */}
                    {/* </View> */}

                    <View style={styles.containerControls}>
                        <View style={styles.containerTextAccount}>
                            <Text style={styles.textAccount}>Login Account</Text>
                        </View>
                        <View style={styles.containerSection}>
                            {/* <Text style={styles.textStyle}>Usuario:</Text> */}
                            <TextInput 
                                style = {styles.input} 
                                placeholder='Usuario' 
                                placeholderTextColor= '#CFD0D0'
                                onChangeText = { (text) => setUsuario(text) }
                                keyboardType="numeric"
                                value = {usuario}
                                autoFocus={true}
                            />
                        </View>

                        <View style={[styles.containerSection, styles.containerPassword]}>
                            {/* <Text style = {styles.textStyle}>Password:</Text> */}
                            <Icon style={styles.iconPosition} name="sign-in-alt" size={20} color="#fff" />
                            <TextInput 
                                style = {styles.input} 
                                placeholder = 'Password' 
                                placeholderTextColor= '#CFD0D0'
                                onChangeText = { (text) => setPassword(text) }
                                keyboardType = "numeric"
                                secureTextEntry={ true }
                                value = { password }
                            />

                            
                        </View>

                        <View style={styles.containerButton}>

                            <TouchableOpacity
                                style={[styles.buttonLogin, styles.boxShadow]}
                                onPress={loginUsuario}
                            >

                                <Text style={styles.textTouchable}>
                                    <Icon name="sign-in-alt" size={20} color="#fff" />  Login
                                </Text>

                            </TouchableOpacity>

                        </View>

                    </View>                    
                   
                </View>

            {/* </ImageBackground> */}

        </View>
    );

}

const styles = StyleSheet.create({
    input:{
        borderWidth: 2,
        padding: 10,
        height: 80,
        marginTop: 5,
        marginBottom: 30,
        marginLeft: 5,
        marginRight: 5,
        borderRadius: 10,
        color: '#0077b6',
        backgroundColor: 'white',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 25,
        fontWeight: 'bold',
        borderColor: '#45C1F0',
        borderTop: 'none',
        outlineStyle: 'none',
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        //backgroundColor: 'rgba(0,0,0,0.4)', // 40% opaque
    },
    container:{
        backgroundColor: 'white',
        flex: 1,
        marginTop: 0,
        marginButtom: 0,
    },
    textStyle: {
        color: '#000',
        marginBottom: 5,
        fontSize: 20
    },
    containerSection:{
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
        marginTop: 10
    },
    containerButton:{
        marginLeft: 15,
        marginRight: 15,
        marginBottom: 25,
        marginTop: 60,
        flex: 1,
    },
    buttonLogin: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#26B3E8',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#1AA1F3'
    },
    boxShadow:{
        shadowColor: 'rgba(0, 0, 0, 7)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 5, // Android
    },
    boxShadowImage:{
        shadowColor: 'rgba(255, 255, 255, 2)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 5, // Android
    },
    textTouchable: {
        color: 'white',
        fontSize: 17,
        fontWeight: 'bold',
        justifyContent: 'center', //Centered vertically
    },
    containerInner: {
        /**marginTop: 120,
        top: 0,
        left: 38,**/
        position: 'absolute',
        zIndex: 300,
        top: 0,
        marginTop: 140,
        alignSelf: 'center',
        backgroundColor: 'white',
        width: 310,
        borderRadius: 50
    },
    containerImage: {
        borderRadius: 100,
    },
    logoImage:{
        flex: 1,
        height: 400,
        borderRadius: 75,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    imageFondo: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0, 0.7)',
        marginBottom: 0,
        marginTop: 0
    },
    containerTextApp:{
        backgroundColor: '#00b4d8',
        alignItems: 'center',
        justifyContent: 'center',
        border: 1,
        borderBottom: '#fff',
        zIndex: 50,
        height: 400,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderRadius: 75,
        width: 50
    },
    textApp:{
        fontSize: 25,
        color: '#fff',
        fontStyle: 'italic',
        fontWeight: 'bold',
        letterSpacing: 2,
        color: '#fff',
        borderBottomColor: 'black',
        // borderBottomWidth: StyleSheet.hairlineWidth,
    },
    containerTextTransport:{
        position: 'absolute',
        zIndex: 10000,
        left: 110,
        top: 95,  
    },
    containerTextIcon:{
        position: 'absolute',
        zIndex: 10000,
        left: 220,
        top: 55,  
    },
    textSecondaryApp:{
        fontSize: 25,
        color: '#03045e',
        fontFamily: 'courier',
        fontWeight: 'bold',
        fontStyle: 'italic',
        letterSpacing: 5
    },
    containerControls:{
        marginTop: 50
    },
    boxShadowText:{
        shadowColor: '#000',
        elevation: 20, // Android
        shadowOffset: { height: -2, width: 4 }, // IOS
        shadowOpacity: 0.2, // IOS
        shadowRadius: 3, //IOS
    },
    textAccount:{
        color: '#000',
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Times New Roman'
    },
    containerTextAccount:{
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconPosition:{
        position: 'absolute',
        right: 10,
    }

});