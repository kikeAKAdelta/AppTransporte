import * as React from 'react';
import { useEffect, useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    StyleSheet,    Text,    useColorScheme,    View, Button, TextInput
} from 'react-native';

/**
 * Funcion encargada de poder crear una nueva variable de session en sistema.
 * @param {*} value Valor de la variable de sesion.
 */
export const createSessionUser = async (objUser) =>{

    const jsonUser = JSON.stringify(objUser);

    try{
        await AsyncStorage.setItem('userSession', jsonUser);
    }catch(error){
        console.log(error);
    }

}

/**
 * Funcion encargada de poder obtener una variable de session.
 * @param {*} value 
 */
export const getSessionUser = async ({navigation}) =>{

    try{
        const value = await AsyncStorage.getItem('userSession');

        if(value !== null){
            //console.log('La sesion es', value);
            const restoredArray = JSON.parse(value);
            return restoredArray;
        }else{
            navigation.navigate('Login', { message: 'Sesion ha caducado!' });
        }

    }catch(error){
        console.log(error);
    }

}

/**
 * Funcion encargada de verificar si existe una variable de usuario existen y si es el caso redirecciona al menu.
 * @param {*} value 
 */
export const existSessionUser = async ({navigation}) =>{

    try{
        const value = await AsyncStorage.getItem('userSession');
        //console.log('existe sesion',value);
        if(value !== null){
            navigation.navigate('Menu');
        }

    }catch(error){
        console.log(error);
    }

}

/**
 * Funcion encargada de eliminar la sesion de usuario.
 */
export const removeSessionUser = async ({navigation}) =>{

    try{
        
        await AsyncStorage.removeItem('userSession');
        navigation.navigate('Login', { message: 'Sesion cerrada' });

    }catch(error){
        console.log(error);
    }

}

/**
 * Funcion encargada de poder crear una nueva variable de session en sistema de una sesion iniciada en Dropbox.
 * @param {*} value Valor de la variable de sesion.
 */
export const createSessionDropbox = async (value) =>{

    try{
        await AsyncStorage.setItem('sessionDropbox', value);
    }catch(error){
        console.log(error);
    }

}

/**
 * Funcion encargada de poder obtener una variable de session.
 * @param {*} value 
 */
export const getSessionDropbox = async () =>{

    try{
        const value = await AsyncStorage.getItem('sessionDropbox');

        if(value !== null){
            return value;
        }else{
            alert('Sesion de Dropbox ha caducado');
        }

    }catch(error){
        console.log(error);
    }

}