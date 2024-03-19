import React, { useState, useEffect } from 'react';
import {Node} from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";

import {
    StyleSheet,    Text,    useColorScheme,    View,
} from 'react-native';


const db =  openDatabase({name: 'AppTransporteDB.db'});

export const DropDownRutas = ({transport}) =>{

    const [ listRutas, setListRutas]    = useState([]);
    const [ selectedValue, setSelectedValue ]           = useState(null);

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
                    console.log("error on getting categories " + error.message);
                },
            );
        });
    }

    let selectComponent =<Text>No se carga lista rutas</Text> ;

    if(listRutas.length > 0){

        const options = [];

        listRutas.forEach((item) => {
            options.push({ label: item.CODIGO_RUTA, value: item.ID_RUTA });
        });
        
        selectComponent = <RNPickerSelect
                                placeholder={placeholder}
                                items={options}
                                value={selectedValue}
                                onValueChange={(value) => setSelectedValue(value)}
                                
                            />
                        {selectedValue && <Text>Selected: {selectedValue}</Text>}
        ;
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
            <Text style={styles.textDark}>Seleccione Ruta:</Text>
            {selectComponent}
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