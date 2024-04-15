import React, { useState, useEffect } from 'react';
import {Node} from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import { DropDownRutas } from './CmbRutas.js';
import { connectToDatabase } from './../../database/AppTransporteDB.js';
import { createSessionUser, getSessionUser, existSessionUser } from './../login/Session.js';

import {
    StyleSheet,    Text,    useColorScheme,    View, Button
} from 'react-native';

const db  = openDatabase(
    {name: 'Tranporte.db', createFromLocation: '~www/Tranporte.db', location: 'Library'},
    () => { console.log('Conexion a la Base de Datos Exitosa New');},
    (error) =>{
        console.error(error);
        throw Error("Error conexion a Base de Datos Local New");
    }
);

export const DropDownTransportista = ({navigation}) =>{

    const [ listTransportista   , setListTransportista] = useState([]);
    const [ selectedValue       , setSelectedValue ] = useState(null);
    const [ itemRuta            , setItemRuta ] = useState(null);

    const placeholder = {
        label: '[ SELECCIONE ]',
        value: null
    }

    let options = [];

    useEffect(() =>{
        obtenerTransportistas({navigation});
    }, []);

    const obtenerTransportistas = async ({navigation}) =>{

        let userSession = await getSessionUser({navigation});         /**Obtenemos variable de Session */
        let filterUser  = '';

        if(userSession != ''){
            filterUser = ` WHERE CODIGO_USUARIO = '${userSession}'`;
        }

        console.log(userSession);

        db.transaction(txn => {

            txn.executeSql(
                `SELECT ID_TRANSPORTISTA, NOMBRE, DUI, PLACA FROM TRANSPORTISTA ${filterUser}`,
                [],
                (sqlTxn, res) => {
    
                    let len = res.rows.length;
    
                    if (len > 0) {
    
                        let results = [];
                        setListTransportista([]);
    
                        for (let i = 0; i < len; i++) {
                            let item = res.rows.item(i);
                            results.push(item);
                        }

                        setListTransportista(results);
                        
                    }else{
                        console.log('No se obtuvo lista de transportista para el select');
                    }
                },
                    error => {
                    console.log("error obteniendo lista de transportista " + error.message);
                },
            );
        });
    }

    let selectComponent =<Text>No se carga lista transportista</Text> ;
    let selectRuta =<Text>No se carga lista ruta</Text> ;
    let buttonNext =<Text>No se carga lista ruta</Text> ;
    let optionSelected = {};

    if(listTransportista.length > 0){

        const options = [];

        listTransportista.forEach((item) => {
            options.push({ label: item.NOMBRE, value: item.ID_TRANSPORTISTA });
        });
        
        selectComponent = <RNPickerSelect
                                placeholder={placeholder}
                                items={options}
                                value={selectedValue}
                                onValueChange={(value) => setSelectedValue(value)}
                                style={customPickerStyles}
                                useNativeAndroidPickerStyle = {false}
                            />  
        ;

        optionSelected = <Text>{selectedValue && <Text>Selected: {selectedValue}</Text>} </Text>;

        selectRuta = <DropDownRutas transport={selectedValue} navigation={navigation} />;
        
    }else{
        
        selectComponent = <RNPickerSelect
                                placeholder={placeholder}
                                items={[]}
                                value={selectedValue}
                                onValueChange={(value) => setSelectedValue(value)}
                                style={customPickerStyles}
                            />
                            {selectedValue && <Text>Selected: {selectedValue}</Text>}
        ;

    }

    return (
        <View style={styles.container}>
            <View style={styles.containerSection}>
                <Text style={styles.textStyle}>Seleccione Transportista:</Text>
                {selectComponent}
                {selectedValue && <Text style={styles.textStyle}>Selected: {selectedValue}</Text>}
            </View>
            <View style={styles.containerSection}>
                {selectRuta}
            </View>
            
        </View>
    );
}

const styles = StyleSheet.create({
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

const customPickerStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 14,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: 'green',
      borderRadius: 8,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
      fontSize: 18,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: '#c4c4c4',
      borderRadius: 8,
      color: 'black',
      backgroundColor: '#fff',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
  });