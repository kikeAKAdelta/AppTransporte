import React, { useState, useEffect } from 'react'
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import Icon from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import { createSessionUser, existSessionUser, getSessionUser } from './../login/Session';
import { useIsFocused } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';

import {
    StyleSheet,    Text,    useColorScheme,    View, Button, TouchableOpacity, TextInput
} from 'react-native';

const db  = openDatabase(
    {name: 'Tranporte.db', createFromLocation: '~Tranporte.db'},
    () => { console.log('Conexion a la Base de Datos Exitosa New');},
    (error) =>{
        console.error(error);
        throw Error("Error conexion a Base de Datos Local New");
    }
);

export const SolicitudCapa = ({navigation}) =>{

    const [ listRutas, setListRutas ] = useState([]);
    const isFocused = useIsFocused();               /**Cuando tome el foco, si cambia recargara la funcion en useEffect */
    const [ userSession, setUserSession ] = useState('');
    const [ selectedRutaValue, setSelectedRutaValue ]   = useState(null);
    const [ itemRuta, setItemRuta ] = useState([]);

    let selectRutaComponent =<Text>No se carga lista rutas</Text>;
    let btnCreateComponent =<Text>No se carga lista ruta</Text> ;
    let rutaDescriComponent = <TextInput 
                                    style = {styles.input} 
                                    placeholder = 'Detalle de ruta seleccionada' 
                                    placeholderTextColor= '#c4c4c4'
                                    keyboardType="numeric"
                                    editable={false} 
                                    selectTextOnFocus={false}
                                /> 
    ;

    let rutasTransportista = [];

    const placeholder = {
        label: '[ SELECCIONE ]',
        value: null
    }


    /**Obtenemos todas las rutas del usuario logueado en Sistema cuando ingrese por primera vez al componente */
    useEffect(() =>{

        obtenerRutas();

    }, [isFocused] );


    /**Cuando exista un cambio o nueva seleccion en el CMB mostrara la informacion */
    useEffect(() =>{
        obtenerRuta(selectedRutaValue);
    }, [selectedRutaValue]);

    
    /**
     * Funcion encargada de obtener todas las rutas de un transportista logueado en Sistema.
     */
    const obtenerRutas = async () =>{

        const objUser = await getSessionUser({navigation});

        const codigoUsuario     = objUser.codigoUsuario;
        const idTransportista   = objUser.idTransportista;
        const nombreUsuario     = objUser.nombreUsuario;

        setUserSession(nombreUsuario);

        db.transaction(txn => {

            txn.executeSql(
                `SELECT 
                        TR.ID_RUTA
                    ,   TR.ID_TRANSPORTISTA
                    ,   (SELECT CODIGO FROM RUTA WHERE ID_RUTA = TR.ID_RUTA) CODIGO_RUTA
                    ,   (SELECT DESCRIPCION FROM RUTA WHERE ID_RUTA = TR.ID_RUTA) DESCRIPCION_RUTA
                FROM 
                    TRANSPORTISTA_RUTA TR 
                WHERE
                    TR.ID_TRANSPORTISTA = ${idTransportista}
                `,
                [],
                (sqlTxn, res) => {
                    
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

                        console.log('Rutas del modulo de solicitudes creada correctamente');
                        
                    }else{
                        console.log('No se obtuvieron rutas');
                    }
                },
                    error => {
                    console.log("Erro obteniendo las rutas de los transportistas !!" + error.message);
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

    /**
     * Funcion encargada de poder crear una nueva solicitud de registro de trabajadores a nivel de sistema.
     */
    const crearSolicitud = async () => {

        const objUser = await getSessionUser({navigation});

        let idTransportista = objUser.idTransportista;
        let idRuta          = selectedRutaValue;

        console.log(idTransportista);
        console.log(idRuta);

        const solicitud = [
                idTransportista
            ,   idRuta
        ];

        if(idTransportista == '' || idTransportista == null){

            Toast.show({
                type: 'error',
                text1: 'Codigo de Empleado',
                text2: 'No se ha detectado el usuario de sistema',
                visibilityTime: 2000
            })

            return;
        }

        if(idRuta == '' || idRuta == null || idRuta == -1){

            Toast.show({
                type: 'error',
                text1: 'Ruta de Transportista',
                text2: 'No se ha detectado la ruta del transportista, favor seleccionar',
                visibilityTime: 2000
            })

            return;
        }


        const insertQuery = `
            INSERT INTO SOLICITUD 
                (       ID_TRANSPORTISTA
                    ,   ID_RUTA
                )
            VALUES (?, ?)
        `;

        db.transaction(txn =>{
            txn.executeSql(
                    insertQuery,
                    solicitud,
                    (sqlTxn, res) =>{
                        
                        Toast.show({
                            type: 'success',
                            text1: 'Creacion de Solicitud',
                            text2: 'Solicitud creada correctamente',
                            visibilityTime: 2000
                        })

                        navigation.navigate('Listado Solicitud', {navigation})

                    },
                    error =>{
                        console.log("Error creando solicitud " + error.message);
                    }
                );
            }
        );

    }

    /** Si existen rutas entonces creamos el Select (CMB) de Rutas */
    if(listRutas.length > 0){

        const options = [];

        listRutas.forEach((item) => {
            options.push({ label: item.CODIGO_RUTA, value: item.ID_RUTA });
        });
        
        selectRutaComponent = <RNPickerSelect
                                placeholder={placeholder}
                                items={options}
                                value={selectedRutaValue}
                                onValueChange={(value) => setSelectedRutaValue(value)}
                                style={customPickerStyles}
                                useNativeAndroidPickerStyle = {false}
                            />
        ;

        if(selectedRutaValue != null){
            
            btnCreateComponent = 
                                <TouchableOpacity
                                    style = {[styles.buttonLogin, styles.boxShadow]}
                                    onPress = { crearSolicitud }
                                >

                                    <Text style = {styles.textTouchable}>
                                        <Icon name="save" size={20} color="#fff" solid />  Crear Solicitud
                                    </Text>

                                </TouchableOpacity>
            ;

            if(itemRuta.length > 0){
                let descripcion = itemRuta[0].DESCRIPCION;
                rutaDescriComponent = 
                                    <TextInput 
                                                    style = {styles.input} 
                                                    placeholder='Usuario' 
                                                    placeholderTextColor= '#CFD0D0'
                                                    onChangeText = { (text) => setUsuario(text) }
                                                    keyboardType="numeric"
                                                    value = {descripcion}
                                                    editable={false} 
                                                    selectTextOnFocus={false}
                                    />
                ;
            }

        }else{

            btnCreateComponent =    
                            <TouchableOpacity
                                style={[styles.buttonLogin, styles.boxShadow]}
                                onPress={() =>{
                                        Toast.show({
                                            type: 'error',
                                            text1: 'Seleccione su ruta',
                                            
                                            visibilityTime: 2000
                                        })
                                        return;
                                    } 
                                }
                            >
                                <Text style={styles.textTouchable}>
                                    <Icon name="save" size={20} color="#fff" solid />  Crear Solicitud
                                </Text>

                            </TouchableOpacity>
            ;

        }

    }else{
        
        selectRutaComponent = <RNPickerSelect
                                placeholder={placeholder}
                                items={[]}
                                value={selectedRutaValue}
                                onValueChange={(value) => setSelectedRutaValue(value)}
                                style={customPickerStyles}
                                useNativeAndroidPickerStyle = {false}
                            />
                            {selectedRutaValue && <Text>Selected: {selectedRutaValue}</Text>}
        ;

        btnCreateComponent =    <TouchableOpacity
                                        style={[styles.buttonLogin, styles.boxShadow]}
                                        onPress={() =>{
                                            
                                            Toast.show({
                                                type: 'error',
                                                text1: 'Inicie sesion',
                                                visibilityTime: 2000
                                            })

                                            return;
                                            } 
                                        }
                                >

                                    <Text style={styles.textTouchable}>
                                        <Icon name="arrow-alt-circle-right" size={20} color="#fff" />  Crear Solicitud
                                    </Text>

                                </TouchableOpacity>
        ;
    }

    return (

        <View style={styles.container}>

            <View style={[styles.containerInner, styles.boxShadow]}>
                
                <View style={[styles.containerTextLabel]}>
                    <Text style={[styles.textLabel, styles.textShadow]}>Creacion de Nueva Solicitud</Text>
                </View>

                <View style={styles.containerElements}>

                    <View style={styles.containerUsuario}>
                        <Text style={styles.textStyle}>Usuario:  <Text style={styles.textStyleUser}>{userSession}</Text></Text>
                    </View>

                    <View style={styles.containerButtonBack}>
                            <TouchableOpacity
                                style={[styles.buttonBack, styles.boxShadow]}
                                onPress= {() => navigation.navigate('Listado Solicitud')}
                            >

                                <Text style={styles.textTouchable}>
                                    <Icon name="undo" size={15} color="#fff" />  Regresar
                                </Text>

                            </TouchableOpacity>
                    </View>
                </View>


                <View style={styles.containerRuta}>
                    <Text style={styles.textStyle}>Rutas:</Text>
                    { selectRutaComponent }
                </View>

                <View style={styles.containerSection}>
                    <Text style={styles.textStyle}>Descripcion Ruta:</Text>
                    { rutaDescriComponent }
                </View>

                <View style={styles.containerButton}>
                    {btnCreateComponent}
                </View>
            </View>

        </View>

    );

}

const styles = StyleSheet.create({
    input:{
        borderWidth: 1,
        padding: 10,
        marginTop: 5,
        marginBottom: 30,
        borderRadius: 10,
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        borderColor: '#c4c4c4',
        color: '#000'
        //backgroundColor: 'rgba(0,0,0,0.4)', // 40% opaque
    },
    containerTextLabel:{
        alignItems: 'center',
        justifyContent: 'center'
    },
    containerElements:{
        justifyContent: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 3
    },
    buttonLogin: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#59B720',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#62C824'
    },
    styleCmb:{
        backgroundColor: '#000',
        color: '#000'
    },
    textStyle: {
        color: '#000',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    textStyleUser: {
        color: '#00b4d8',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    containerSection:{
        marginTop: 40,
        marginBottom: 15,
    },
    containerRuta:{
        marginTop: 20,
        marginBottom: 15,
    },
    containerButton:{
        marginTop: 25,
        marginBottom: 15,
    },
    buttonLogin: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#59B720',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#62C824'
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
        fontSize: 15.5,
        fontWeight: 'bold',
        justifyContent: 'center', //Centered vertically
    },
    textLabel:{
        fontSize: 20,
        color: '#000',
        fontFamily: '',
        fontWeight: 'bold',
        fontStyle: 'italic',
        marginBottom: 17,
    },
    container:{
        marginLeft: 5,
        marginRight: 5,
        marginTop: 5,
    },
    containerInner:{
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 7
    },
    textShadow: {
        textShadowColor: 'rgba(48, 48, 48, 0.3)',
        textShadowOffset: {width: -3, height: 3},
        textShadowRadius: 10
    },
    buttonBack: {
        height: 30,
        padding: 3,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F51717',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#FF0000'
    },
    containerButtonBack:{
        alignItems: 'flex-end',
        width: '30%',
    },
    containerUsuario: {
        width: '70%',
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