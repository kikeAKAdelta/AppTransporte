import React, { useState, useEffect } from 'react';
import {Node} from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import { DropDownRutas } from './CmbRutas.js';


import {
    StyleSheet,    Text,    useColorScheme,    View, Button
} from 'react-native';

const db =  openDatabase({name: 'AppTransporteDB.db'});

export const DropDownTransportista = ({navigation}) =>{

    const [ listTransportista, setListTransportista] = useState([]);
    const [ selectedValue, setSelectedValue ] = useState(null);

    const placeholder = {
        label: '[ SELECCIONE ]',
        value: null
    }

    let options = [];

    useEffect(() =>{
        obtenerTransportistas();
    }, []);

    const obtenerTransportistas = () =>{
        db.transaction(txn => {

            txn.executeSql(
                `SELECT * FROM TRANSPORTISTA`,
                [],
                (sqlTxn, res) => {
                    //console.log("Transportistas obtenidos correctamente");
    
                    let len = res.rows.length;
    
                    if (len > 0) {
    
                        let results = [];
    
                        for (let i = 0; i < len; i++) {
                            let item = res.rows.item(i);
                            results.push(item);
                        }
    
                        console.log(results);
                        setListTransportista(results);
                        
                    }else{
                        console.log('No se obtuvo');
                    }
                },
                    error => {
                    console.log("error on getting categories " + error.message);
                },
            );
        });
    }

    let selectComponent =<Text>No se carga lista transportista</Text> ;
    let selectRuta =<Text>No se carga lista ruta</Text> ;
    let buttonNext =<Text>No se carga lista ruta</Text> ;

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
                        {selectedValue && <Text>Selected: {selectedValue}</Text>}
        ;

        selectRuta = <DropDownRutas transport= {selectedValue} />;
        buttonNext = <Button
                            title="Siguiente" 
                            accessibilityLabel="Learn more about this purple button" 
                            onPress= {() => navigation.navigate('Registro', { transport: selectedValue })}
                      />
        ;
        
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
            </View>
            <View style={styles.containerSection}>
                {selectRuta}
            </View>
            <View style={styles.containerSection}>
                {buttonNext}
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