import React, { useState, useEffect } from 'react'
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import Icon from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import { createSessionUser, existSessionUser, getSessionUser } from './../login/Session';
import { useIsFocused } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import Dropdown from 'react-native-input-select';

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

export const SolicitudDetalle = ({navigation, route}) =>{

    const isFocused = useIsFocused();               /**Cuando tome el foco, si cambia recargara la funcion en useEffect */
    const [ solicitudState, setSolicitudState ] = useState([]);
    const [ selectedEstadoValue, setSelectedEstadoValue ]   = useState([]);
    let solicitudComponent = <View></View>;

    /**Obtenemos todas las rutas del usuario logueado en Sistema cuando ingrese por primera vez al componente */
    useEffect(() =>{
        getSolDetalle();
    }, [isFocused] );

    /**
     * Funcion encargada de obtener el detalle de una solicitud.
     */
    const getSolDetalle = () => {

        const idSolicitud = route.params.idSolicitud;

        db.transaction(txn => {

            txn.executeSql(
                `SELECT 
                        SOL.ID_SOLICITUD
                    ,	SOL.ID_TRANSPORTISTA
                    ,	(SELECT NOMBRE FROM TRANSPORTISTA WHERE ID_TRANSPORTISTA = SOL.ID_TRANSPORTISTA) NOMBRE_TRANSPORTISTA
                    ,	(SELECT CODIGO_USUARIO FROM TRANSPORTISTA WHERE ID_TRANSPORTISTA = SOL.ID_TRANSPORTISTA) CODIGO_TRANSPORTISTA
                    ,	SOL.ID_RUTA
                    ,	(SELECT CODIGO FROM RUTA WHERE ID_RUTA = SOL.ID_RUTA) CODIGO_RUTA
	                ,	(SELECT DESCRIPCION FROM RUTA WHERE ID_RUTA = SOL.ID_RUTA) DESCRIPCION_RUTA
                    ,	SOL.ESTADO
                    ,   CASE
                            WHEN SOL.ESTADO = 0
                                THEN 'Pendiente'
                            WHEN SOL.ESTADO = 1
                                THEN 'Proceso'
                            WHEN SOL.ESTADO = 2
                                THEN 'Finalizado'
                            ELSE
                                'SIN ESTADO'
                        END ESTADO_DESCRI
                    ,	strftime('%d/%m/%Y %H:%M:%S', SOL.FECHA_SOLICITUD) FECHA_SOLICITUD
                FROM 
                    SOLICITUD SOL
                WHERE
                    SOL.ID_SOLICITUD = ${idSolicitud}
                `,
                [],
                (sqlTxn, res) => {
                    
                    let len = res.rows.length;
    
                    if (len > 0) {
    
                        let results         = {};
                        let resultsArr      = [];
                        setSolicitudState([]);
    
                        for (let i = 0; i < len; i++) {

                            let item = res.rows.item(i);

                            results.ID_SOLICITUD            = item.ID_SOLICITUD;
                            results.ID_TRANSPORTISTA        = item.ID_TRANSPORTISTA;
                            results.NOMBRE_TRANSPORTISTA    = item.NOMBRE_TRANSPORTISTA;
                            results.CODIGO_TRANSPORTISTA    = item.CODIGO_TRANSPORTISTA;
                            results.ID_RUTA                 = item.ID_RUTA;
                            results.DESCRIPCION_RUTA        = item.DESCRIPCION_RUTA;
                            results.ESTADO                  = item.ESTADO;
                            results.ESTADO_DESCRI           = item.ESTADO_DESCRI;
                            results.FECHA_SOLICITUD         = item.FECHA_SOLICITUD;

                            resultsArr.push(results);

                            if(i == 0){
                                setSelectedEstadoValue(item.ESTADO);
                            }
                        }
    
                        setSolicitudState(resultsArr);
                        
                    }else{
                        console.log('No se obtuvo la solicitud');
                    }
                },
                error => {
                    console.log("Error obteniendo la solicitud !!" + error.message);
                },
            );
        });
    }

    /**
     * Funcion encargada de actualizar el estado de una solicitud.
     */
    const updateEstadoSol = () =>{

        const idSolicitud   = route.params.idSolicitud;
        const estadoSol     = selectedEstadoValue;

        if(estadoSol == null){
            Toast.show({
                type: 'error',
                text1: 'Error Actualizacion de Estado',
                text2: 'Seleccione un estado valido',
                visibilityTime: 2000
            })
            return;
        }

        const solicitud = [
                estadoSol
            ,   idSolicitud
        ];

        const updateQuery = `
            UPDATE 
                SOLICITUD 
            SET
                ESTADO = ?
            WHERE
                ID_SOLICITUD = ?

        `;

        db.transaction(txn =>{
            txn.executeSql(
                    updateQuery,
                    solicitud,
                    (sqlTxn, res) =>{
                        
                        Toast.show({
                            type: 'success',
                            text1: 'Actualizacion de Estado',
                            text2: 'Solicitud actualizada correctamente',
                            visibilityTime: 2000
                        })

                    },
                    error =>{
                        console.log("Error actualizando solicitud " + error.message);
                    }
                );
            }
        );

    }

    /**
     * Funcion encargada de validar y redireccionar a las marcaciones de usuario.
     */
    const redirectToMarcaciones = () =>{

        const idSolicitud   = route.params.idSolicitud;
        const estadoSol     = selectedEstadoValue;

        if(estadoSol != 1){

            Toast.show({
                type: 'error',
                text1: 'Registro Marcaciones',
                text2: 'La Solicitud debe de estar en Proceso',
                visibilityTime: 2000
            })
            return;
        }

        navigation.navigate('SolicitudDetalleRegistro',{idSolicitud: idSolicitud})
    }

    if(solicitudState.length > 0){

        const idSol                     = solicitudState[0].ID_SOLICITUD;
        const idTransportista           = solicitudState[0].ID_TRANSPORTISTA;
        const nombreTransportista       = solicitudState[0].NOMBRE_TRANSPORTISTA;
        const codigoTransportista       = solicitudState[0].CODIGO_TRANSPORTISTA;
        const idRuta                    = solicitudState[0].ID_RUTA;
        const descripcionRuta           = solicitudState[0].DESCRIPCION_RUTA;
        const estadoSolicitud           = solicitudState[0].ESTADO;
        const estadoDescriSolicitud     = solicitudState[0].ESTADO_DESCRI;
        const fechaSolicitud            = solicitudState[0].FECHA_SOLICITUD;

        const options = [];
        options.push({ label: 'Pendiente'   , value: 0 });
        options.push({ label: 'Proceso'     , value: 1 });
        options.push({ label: 'Finalizado'  , value: 2 });

        const placeholderSelect = {
            label: '[ SELECCIONE ]',
            value: null
        }

        solicitudComponent = 
            <View>

                <View style={styles.containerElements}>
                    <View style={styles.containerBox}>
                        <Text style={styles.textStyle}>Solicitud:</Text>

                        <TextInput 
                            style={styles.input} 
                            placeholder='Id Solicitud' 
                            placeholderTextColor='#CFD0D0'
                            keyboardType="numeric"
                            value = {''+idSol}
                            editable={false} 
                            selectTextOnFocus={false}
                        />
                    </View>

                    <View style={[styles.containerBox, styles.containerButtonMarcacion]}>
                        <Text></Text>
                        <TouchableOpacity
                            style={[styles.buttonMarcaciones, styles.boxShadow]}
                            onPress= {() => { navigation.navigate('SolicitudDetalleList',{idSolicitud: idSol}) } }
                        >

                            <Text style={styles.textTouchable}>
                                <Icon name="list" size={15} color="#fff" />  Detalle Marcaciones
                            </Text>

                        </TouchableOpacity>
                    </View>
                </View>

                <View>
                    <Text style={styles.textStyle}>Transportista:</Text>

                    <TextInput 
                        style = {styles.input} 
                        placeholder='Usuario' 
                        placeholderTextColor= '#CFD0D0'
                        keyboardType="numeric"
                        value = {nombreTransportista}
                        editable={false} 
                        selectTextOnFocus={false}
                    />
                </View>

                <View>
                    <Text style={styles.textStyle}>Ruta:</Text>

                    <TextInput 
                        style = {styles.input} 
                        placeholder='Usuario' 
                        placeholderTextColor= '#CFD0D0'
                        keyboardType="numeric"
                        value = {descripcionRuta}
                        editable={false} 
                        selectTextOnFocus={false}
                    />
                </View>

                <View>
                    <Text style={styles.textStyle}>Fecha Solicitud:</Text>

                    <TextInput 
                        style = {styles.input} 
                        placeholder='Usuario' 
                        placeholderTextColor= '#CFD0D0'
                        keyboardType="numeric"
                        value = {fechaSolicitud}
                        editable={false} 
                        selectTextOnFocus={false}
                    />
                </View>

                <View style={styles.containerEstadoSol}>
                    <Text style={styles.textStyle}>Estado Solicitud:</Text>

                    <RNPickerSelect
                        placeholder={placeholderSelect}
                        items={options}
                        value={selectedEstadoValue}
                        itemKey={selectedEstadoValue}
                        // onValueChange={(value) => setSelectedEstadoValue(value)}
                        onValueChange={(value) => {
                            setSelectedEstadoValue(value);
                            updateEstadoSol();
                        }}
                        style={{...customPickerStyles, iconContainer: {
                            top: 10,
                            paddingRight: 20
                        },}}
                        useNativeAndroidPickerStyle={false}
                        Icon={() => {
                            return <Icon name='chevron-down' size={18} color="gray" />;
                          }}
                    />

                    {/* <Dropdown
                        placeholder=""
                        options={options}
                        selectedValue={selectedEstadoValue}
                        onValueChange={(value) => {setSelectedEstadoValue(value)}}
                        primaryColor={'green'}
                        dropdownStyle={{
                            borderWidth : 1,         // To remove border, set borderWidth to 0
                            minHeight   : 1,
                            height      : 35,
                            padding     :0,
                            paddingVertical: 0,
                            paddingHorizontal: 10,
                            margin: 0,
                            borderColor: '#c4c4c4',
                        }}
                        selectedItemStyle={{
                            fontWeight: 'bold',
                        }}
                        dropdownContainerStyle={{ 
                              marginBottom: 0
                            , padding: 0
                            , height: 35 
                        }}
                        dropdownIconStyle= {{
                            top: 15
                        }}
                    /> */}
                </View>

                <View style={styles.containerButton}>
                    <TouchableOpacity
                        style={[styles.buttonSuccess, styles.boxShadow]}
                        onPress= { redirectToMarcaciones }
                    >

                        <Text style={styles.textTouchable}>
                            <Icon name="arrow-alt-circle-right" size={18} color="#fff" solid />  Registrar Marcaciones
                        </Text>

                    </TouchableOpacity>
                </View>

                <View style={styles.containerElements}>

                    {/* <View style={styles.containerButton}>
                        <TouchableOpacity
                            style={[styles.buttonWarning, styles.boxShadow]}
                            onPress= {() => updateEstadoSol()}
                        >

                            <Text style={[styles.textTouchable, {color: '#000'}]}>
                                <Icon name="edit" size={18} color="#000" solid />  Cambiar Estado
                            </Text>

                        </TouchableOpacity>
                    </View> */}
                    

                </View>

            </View>
        ;

    }

    return (
        <View style={styles.container}>
            <View style={[styles.containerInner, styles.boxShadow]}>
                { solicitudComponent }
            </View>
        </View>
    );

}

const styles = StyleSheet.create({
    input:{
        borderWidth: 1,
        padding: 3,
        paddingLeft: 7,
        marginTop: 5,
        marginBottom: 20,
        borderRadius: 10,
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 'bold',
        borderColor: '#c4c4c4',
        color: '#000',
        //backgroundColor: 'rgba(0,0,0,0.4)', // 40% opaque
    },
    containerTextLabel:{
        alignItems: 'center',
        justifyContent: 'center'
    },
    styleCmb:{
        backgroundColor: '#000',
        color: '#000'
    },
    textStyle: {
        color: '#000',
        marginBottom: 5,
        fontSize: 14.5
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
        width: '100%'
    },
    containerBox:{
        width: '48%'
    },
    buttonSuccess: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2FA1E7',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#1AA1F3',
        width: '100%',
    },
    buttonWarning: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffc107',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FFBF00',
        width: '100%',
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
        fontSize: 14,
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
    buttonMarcaciones: {
        height: 35,
        padding: 3,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#59B720',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#62C824'
    },
    containerButtonBack:{
        width: '40%',
        marginLeft: 40
    },
    containerButtonMarcacion:{
        width: '45%',
        marginLeft: 25,
    },
    containerUsuario: {
        width: '70%',
    },
    containerElements:{
        justifyContent: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '10'
    },
    containerEstadoSol:{
        marginBottom: 40
    },
    selectCss: {
        backgroundColor: 'red'
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
      fontSize: 15,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderWidth: 1,
      borderColor: '#c4c4c4',
      borderRadius: 5,
      color: '#000',
      backgroundColor: '#DBDCDD',
      padding: 15, // to ensure the text is never behind the icon
    },

});