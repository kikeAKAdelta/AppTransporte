import React, { useState, useEffect } from 'react';
import {Node} from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import { DropDownRutas } from './CmbRutas.js';


import {
    StyleSheet,    Text,    useColorScheme,    View, Button
} from 'react-native';

const db =  openDatabase({name: 'AppTransporteDB.db'});

export const DropDownTransportista = () =>{

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
                                style={styles.styleCmb}
                            />
                        {selectedValue && <Text>Selected: {selectedValue}</Text>}

                        
        ;

        selectRuta = <DropDownRutas transport= {selectedValue} />;
        buttonNext = <Button title="Siguiente" accessibilityLabel="Learn more about this purple button" />;
        
    }else{
        
        selectComponent = <RNPickerSelect
                                placeholder={placeholder}
                                items={[]}
                                value={selectedValue}
                                onValueChange={(value) => setSelectedValue(value)}
                            />
                            {selectedValue && <Text>Selected: {selectedValue}</Text>}
        ;
    }

    return (
        <View>
            <Text style={styles.textDark}>Seleccione Transportista:</Text>
            {selectComponent}
            {selectRuta}
            {buttonNext}
        </View>
    );
}

const styles = StyleSheet.create({
    styleCmb:{
        backgroundColor: '#000',
        color: '#000'
    },
    textDark: {
        color: '#000'
    }
});