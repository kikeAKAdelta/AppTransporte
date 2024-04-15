import 'react-native-gesture-handler';
import * as React from 'react';
import { useEffect, useCallback, useState } from 'react';
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { createSessionUser, removeSessionUser, existSessionUser } from './Session.js';

import {
    StyleSheet,    Text,    useColorScheme,    View, Button, TextInput
} from 'react-native';

const db  = openDatabase(

    {name: 'Tranporte.db', createFromLocation: '~www/Tranporte.db', location: 'Library'},
    () => { console.log('Conexion a la Base de Datos Exitosa New');},
    (error) =>{
        console.error(error);
        throw Error("Error conexion a Base de Datos Local New");
    }
);

export const CerrarSession = ({navigation}) =>{

    const isFocused = useIsFocused();               /**Cuando tome el foco, si cambia recargara la funcion en useEffect */

    useEffect(() => {

        const fetchData = async () =>{
            await removeSessionUser({navigation});
        }

        fetchData();

    }, [isFocused]);

    return (
        <View>
            <Text>Cerrando Sesion!!...</Text>
        </View>
    );
}