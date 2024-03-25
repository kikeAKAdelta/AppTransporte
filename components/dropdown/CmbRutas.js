import React, { useState, useEffect } from 'react';
import {Node} from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";

import {
    StyleSheet,    Text,    useColorScheme,    View, Button
} from 'react-native';


const db =  openDatabase({name: 'AppTransporteDB.db'});

export const DropDownRutas = ({navigation, transport}) =>{

    const [ listRutas, setListRutas]            = useState([]);
    const [ selectedRutaValue, setSelectedRutaValue ]   = useState(null);

    const placeholder = {
        label: '[ SELECCIONE ]',
        value: null
    }

    let options = [];

    useEffect(() =>{
        obtenerRutas();
    }, [transport]);

    const obtenerRutas = () =>{

        db.transaction(txn => {

            txn.executeSql(
                `SELECT 
                        TR.ID_TR
                    ,   TR.ID_RUTA
                    ,   TR.ID_TRANSPORTISTA
                    ,   (SELECT CODIGO FROM RUTA WHERE ID_RUTA = TR.ID_RUTA) CODIGO_RUTA
                FROM 
                    TRANSPORTISTA_RUTA TR WHERE ID_TRANSPORTISTA = ${transport}`,
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
                        setListRutas(results);
                        
                    }else{
                        console.log('No se obtuvieron rutas');
                    }
                },
                    error => {
                    console.log("Erro obteniendo las rutas de los transportistas " + error.message);
                },
            );
        });
    }

    let buttonNext =<Text>No se carga lista ruta</Text> ;

    let selectComponent =<Text>No se carga lista rutas</Text> ;

    if(listRutas.length > 0){

        const options = [];

        listRutas.forEach((item) => {
            options.push({ label: item.CODIGO_RUTA, value: item.ID_RUTA });
        });
        
        selectComponent = <RNPickerSelect
                                placeholder={placeholder}
                                items={options}
                                value={selectedRutaValue}
                                onValueChange={(value) => setSelectedRutaValue(value)}
                                style={customPickerStyles}
                                useNativeAndroidPickerStyle = {false}
                            />
                        
        ;

        if(selectedRutaValue != null){
            buttonNext = <Button
                            title="Siguiente" 
                            accessibilityLabel="Boton de Siguiente" 
                            onPress= {() => navigation.navigate('Registro', { transport: transport, ruta: selectedRutaValue })}
                      />
            ;
        }else{
            buttonNext = <Button
                            title="Siguiente" 
                            accessibilityLabel="Boton de Siguiente" 
                            onPress= {() => alert('Seleccione transportista y ruta')}
                      />
            ;
        }

        
    }else{
        
        selectComponent = <RNPickerSelect
                                placeholder={placeholder}
                                items={[]}
                                value={selectedRutaValue}
                                onValueChange={(value) => setSelectedRutaValue(value)}
                                style={customPickerStyles}
                                useNativeAndroidPickerStyle = {false}
                            />
                            {selectedRutaValue && <Text>Selected: {selectedRutaValue}</Text>}
        ;

        buttonNext = <Button
                            title="Siguiente" 
                            accessibilityLabel="Boton de Siguiente" 
                            onPress= {() => alert('Seleccione transportista y ruta')}
                      />
        ;
    }

    return (
        <View>
            <Text style={styles.textStyle}>Seleccione Ruta:</Text>
            {selectComponent}
            {selectedRutaValue && <Text style={styles.textStyle}>Selected: {selectedRutaValue}</Text>}

            <View style={styles.containerSection}>
                {buttonNext}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    styleCmb:{
        backgroundColor: '#000',
        color: '#000'
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