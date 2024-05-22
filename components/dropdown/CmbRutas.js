import React, { useState, useEffect } from 'react';
import {Node} from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import Icon from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';

import {
    StyleSheet,    Text,    useColorScheme,    View, Button, TouchableOpacity
} from 'react-native';


const db  = openDatabase(
    {name: 'Tranporte.db', createFromLocation: '~Tranporte.db'},
    () => { console.log('Conexion a la Base de Datos Exitosa New');},
    (error) =>{
        console.error(error);
        throw Error("Error conexion a Base de Datos Local New");
    });

export const DropDownRutas = ({navigation, transport}) =>{

    const [ listRutas, setListRutas ] = useState([]);
    const [ itemRuta, setItemRuta ] = useState([]);
    const [ selectedRutaValue, setSelectedRutaValue ]   = useState(null);

    const placeholder = {
        label: '[ SELECCIONE ]',
        value: null
    }

    let options = [];
    let rutasTransportista = [];

    useEffect(() =>{
        obtenerRutas();
    }, [transport]);

    useEffect(() =>{
        obtenerRuta(selectedRutaValue);
    }, [selectedRutaValue]);

    /**
     * Funcion encargada de obtener todas las rutas de un transportista
     */
    const obtenerRutas = () =>{

        db.transaction(txn => {

            txn.executeSql(
                `SELECT 
                        TR.ID_RUTA
                    ,   TR.ID_TRANSPORTISTA
                    ,   (SELECT CODIGO FROM RUTA WHERE ID_RUTA = TR.ID_RUTA) CODIGO_RUTA
                    ,   (SELECT DESCRIPCION FROM RUTA WHERE ID_RUTA = TR.ID_RUTA) DESCRIPCION_RUTA
                FROM 
                    TRANSPORTISTA_RUTA TR WHERE ID_TRANSPORTISTA = ${transport}`,
                [],
                (sqlTxn, res) => {
                    //console.log("Transportistas obtenidos correctamente");
    
                    let len = res.rows.length;
                    console.log(len);
    
                    if (len > 0) {
    
                        let results = [];
                        setListRutas([]);
    
                        for (let i = 0; i < len; i++) {
                            let item = res.rows.item(i);
                            results.push(item);
                        }
    
                        rutasTransportista.push(results);
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

    /**
     * Funcion encargada de obtener una ruta especifica.
     */
    const obtenerRuta = (idRuta) =>{
        console.log('obtenerRuta');

        db.transaction(txn => {

            txn.executeSql(
                `
                    SELECT 
                            RT.ID_RUTA
                        ,   RT.CODIGO
                        ,   RT.DESCRIPCION
                    FROM 
                        RUTA RT 
                    WHERE 
                        ID_RUTA = ${idRuta}
                `,
                [],
                (sqlTxn, res) => {
    
                    let len = res.rows.length;
    
                    if (len > 0) {
    
                        let result = [];
                        setItemRuta([]);
    
                        for (let i = 0; i < len; i++) {
                            let item = res.rows.item(i);
                            result.push(item);
                        }
    
                        setItemRuta(result);
                        
                    }else{
                        console.log('No se obtuvo la ruta especifica');
                    }
                },
                    error => {
                    console.log("Erro obteniendo la ruta del transportista detalle " + error.message);
                },
            );
        });
    }

    let buttonNext =<Text>No se carga lista ruta</Text> ;
    let selectComponent =<Text>No se carga lista rutas</Text>;
    let textDescripcion = <Text>No se tiene ruta</Text>;

    //console.log('Mensaje');

    /**Si existen rutas entonces creamos el Select (CMB) de Rutas */
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
            
            /**buttonNext = <Button
                            title="Siguiente" 
                            accessibilityLabel="Boton de Siguiente" 
                            onPress= {() => navigation.navigate('Registro', { transport: transport, ruta: selectedRutaValue })}
                      />
            ;**/

            buttonNext = <TouchableOpacity
                            style={[styles.buttonLogin, styles.boxShadow]}
                            onPress= {() => navigation.navigate('Registro', { transport: transport, ruta: selectedRutaValue })}
                         >

                            <Text style={styles.textTouchable}>
                                <Icon name="arrow-alt-circle-right" size={20} color="#fff" />  Siguiente
                            </Text>

                        </TouchableOpacity>
            ;

            if(itemRuta.length > 0){
                let descripcion = itemRuta[0].DESCRIPCION;
                textDescripcion = <Text style = { styles.textStyle}>{descripcion}</Text>;
            }

        }else{

            /**buttonNext = <Button
                            title="Siguiente" 
                            accessibilityLabel="Boton de Siguiente" 
                            onPress= {() => alert('Seleccione transportista y ruta')}
                      />
            ;**/

            buttonNext =    <TouchableOpacity
                            style={[styles.buttonLogin, styles.boxShadow]}
                            onPress={() =>{

                                Toast.show({
                                    type: 'error',
                                    text1: 'Seleccione transportista y ruta',
                                    
                                    visibilityTime: 2000
                                })

                                return;
                                } 
                            }
                        >

                            <Text style={styles.textTouchable}>
                                <Icon name="arrow-alt-circle-right" size={20} color="#fff" />  Siguiente
                            </Text>

                        </TouchableOpacity>
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

        /**buttonNext = <Button
                            title="Siguiente" 
                            accessibilityLabel="Boton de Siguiente" 
                            onPress= {() => alert('Seleccione transportista y ruta')}
                      />
        ;**/

        buttonNext =    <TouchableOpacity
                            style={[styles.buttonLogin, styles.boxShadow]}
                            onPress={() =>{
                                
                                Toast.show({
                                    type: 'error',
                                    text1: 'Seleccione transportista y ruta',
                                    
                                    visibilityTime: 2000
                                })

                                return;
                                } 
                            }
                        >

                            <Text style={styles.textTouchable}>
                                <Icon name="arrow-alt-circle-right" size={20} color="#fff" />  Siguiente
                            </Text>

                        </TouchableOpacity>
        ;
    }

    return (
        <View>
            <Text style={styles.textStyle}>Ruta:</Text>
            {selectComponent}
            {/* {selectedRutaValue && <Text style={styles.textStyle}>Selected: {selectedRutaValue}</Text>} */}
            {textDescripcion}
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
        marginBottom: 5,
        fontWeight: 'bold',
    },
    containerSection:{
        marginTop: 75,
        marginBottom: 15,
    },
    buttonLogin: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2FA1E7',
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
    textTouchable: {
        color: 'white',
        fontSize: 17,
        fontWeight: 'bold',
        justifyContent: 'center', //Centered vertically
    },
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