import 'react-native-gesture-handler';
import * as React from 'react';
import { useEffect, useCallback, useState } from 'react';
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";


import {
    StyleSheet,    Text,    useColorScheme,    View, Button, TextInput
} from 'react-native';

const db  = openDatabase(
    {name: 'Tranporte.db', createFromLocation: '~www/Tranporte.db', location: 'Library'},
    () => { console.log('Conexion a la Base de Datos Exitosa New');},
    (error) =>{
        console.error(error);
        throw Error("Error conexion a Base de Datos Local New");
    });


export const LoginApp = ({navigation}) =>{

    const [ usuario  , setUsuario ] = useState('');
    const [ password , setPassword ] = useState('');

    const loginUsuario = () =>{

        if(usuario == ''){
            alert('Ingrese el codigo de usuario');
            return;
        }

        if(password == ''){
            alert('Ingrese el password');
            return;
        }

        db.transaction(txn => {

            txn.executeSql(
                `SELECT 
                            CODIGO_USUARIO
                        ,   PASSWORD FROM TRANSPORTISTA 
                    WHERE 
                        CODIGO_USUARIO = '${usuario}' 
                    AND PASSWORD = '${password}' 
                `,
                [],
                (sqlTxn, res) => {
    
                    let len = res.rows.length;
    
                    if (len > 0) {
                        alert('Sesion iniciada correctamente');
                        navigation.navigate('Menu', {})
                    }else{
                        alert('Credenciales incorrectas');
                    }
                },
                    error => {
                    console.log("error obteniendo lista de transportista " + error.message);
                },
            );
        });


    }

    return(
        <View>

            <View>
                <Text>Login de Usuario</Text>
            </View>

            <View>
                <Text>Usuario:</Text>
                <TextInput 
                    style = {styles.input} 
                    placeholder='Codigo de Usuario' 
                    placeholderTextColor= '#000'
                    onChangeText = { (text) => setUsuario(text) }
                    keyboardType="numeric"
                />
            </View>

            <View>
                <Text>Password:</Text>
                <TextInput 
                    style = {styles.input} 
                    placeholder='Password' 
                    placeholderTextColor= '#000'
                    onChangeText = { (text) => setPassword(text) }
                    keyboardType="numeric"
                    secureTextEntry={true}
                />
            </View>

            <View>
                <Button
                    title="Login"
                    onPress= {loginUsuario}
                />
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
        backgroundColor: 'white',
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