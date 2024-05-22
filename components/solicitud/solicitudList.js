import React, { useState, useEffect } from 'react'
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import Icon from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import { createSessionUser, existSessionUser, getSessionUser } from './../login/Session';
import { useIsFocused } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';

import {
    StyleSheet,    Text,    useColorScheme,    View, Button, TouchableOpacity, TextInput, ScrollView
} from 'react-native';

const db  = openDatabase(
    {name: 'Tranporte.db', createFromLocation: '~Tranporte.db'},
    () => { console.log('Conexion a la Base de Datos Exitosa New');},
    (error) =>{
        console.error(error);
        throw Error("Error conexion a Base de Datos Local New");
    }
);


export const SolicitudList = ({navigation}) => {

    const isFocused = useIsFocused();               /**Cuando tome el foco, si cambia recargara la funcion en useEffect */
    const [ listSol, setListSol ] = useState([]);
    let solicitudesComponent = [];

    /**Obtenemos todas las rutas del usuario logueado en Sistema cuando ingrese por primera vez al componente */
    useEffect(() =>{
        getSolicitudes();
    }, [isFocused] );

    /**
     * Funcion encargada de obtener todas las solicitudes que se han creado en sistema.
     */
    const getSolicitudes = () =>{

        db.transaction(txn => {

            txn.executeSql(
                `SELECT 
                        SOL.ID_SOLICITUD
                    ,	SOL.ID_TRANSPORTISTA
                    ,	(SELECT NOMBRE FROM TRANSPORTISTA WHERE ID_TRANSPORTISTA = SOL.ID_TRANSPORTISTA) NOMBRE_TRANSPORTISTA
                    ,	(SELECT CODIGO_USUARIO FROM TRANSPORTISTA WHERE ID_TRANSPORTISTA = SOL.ID_TRANSPORTISTA) CODIGO_TRANSPORTSITA
                    ,	SOL.ID_RUTA
                    ,	(SELECT CODIGO FROM RUTA WHERE ID_RUTA = SOL.ID_RUTA) CODIGO_RUTA
	                ,	(SELECT DESCRIPCION FROM RUTA WHERE ID_RUTA = SOL.ID_RUTA) DESCRIPCION_RUTA
                    ,	SOL.ESTADO
                    ,   CASE
                            WHEN SOL.ESTADO = 0
                                THEN 'PENDIENTE'
                            WHEN SOL.ESTADO = 1
                                THEN 'PROCESO'
                            WHEN SOL.ESTADO = 2
                                THEN 'FINALIZADO'
                            ELSE
                                'SIN ESTADO'
                        END ESTADO_DESCRI
                    ,	strftime('%d/%m/%Y %H:%M:%S', SOL.FECHA_SOLICITUD) FECHA_SOLICITUD
                FROM 
                    SOLICITUD SOL
                ORDER BY
                    SOL.ID_SOLICITUD DESC
                `,
                [],
                (sqlTxn, res) => {
                    
                    let len = res.rows.length;
    
                    if (len > 0) {
    
                        let results = [];
                        setListSol([]);
    
                        for (let i = 0; i < len; i++) {
                            let item = res.rows.item(i);
                            results.push(item);
                        }
    
                        setListSol(results);
                        
                    }else{
                        console.log('No se obtuvieron las solicitudes');
                    }
                },
                error => {
                    console.log("Error obteniendo las solicitudes !!" + error.message);
                },
            );
        });

    }

    let alert = <View></View>;

    /**Si existen registros entonces ingresamos */
    if(listSol.length > 0){

        const cantidad = listSol.length;
        solicitudesComponent = [];

        if(cantidad > 0){

            listSol.forEach((item) => {

                const idSolicitud           = item.ID_SOLICITUD;
                const idRuta                = item.ID_RUTA;
                const idTransportista       = item.ID_TRANSPORTSITA;
                const nombreTransportista   = item.NOMBRE_TRANSPORTISTA;
                const codigoTransportista   = item.CODIGO_TRANSPORTISTA;
                const codigoRuta            = item.CODIGO_RUTA;
                const descripcionRuta       = item.DESCRIPCION_RUTA;
                const estadoSol             = item.ESTADO;
                const estadoSolDescri       = item.ESTADO_DESCRI;
                const fechaSol              = item.FECHA_SOLICITUD;

                let backgroundColorSol = '';

                if(estadoSol == 0){                     /** Pendiente */
                    backgroundColorSol = '#F51717';
                }else if(estadoSol == 1){               /**Proceso */
                    backgroundColorSol = '#239DED';
                }else if(estadoSol == 2){               /**Finalizado */
                    backgroundColorSol = '#3BD512';
                }

                let solicitudComponent =    
                                <TouchableOpacity
                                    style = {[styles.buttonSol, styles.boxShadow] }
                                    onPress = { () => navigation.navigate('SolicitudDetalle', { idSolicitud: idSolicitud }) }
                                >
                                    <View style={styles.containerElementsTouchable}>
                                        <View style={[styles.sectionSolTouchable, {backgroundColor: backgroundColorSol}, styles.boxShadow]}>
                                            <Text style = {styles.textSolTouchable}>
                                                <Icon name="file-signature" size={15} color="#fff" solid /> Sol #{idSolicitud} - { estadoSolDescri }
                                            </Text>
                                        </View>
                                        <View style={styles.sectionFechaTouchable}>
                                            <Text style = {styles.textFechaTouchable}>
                                                { fechaSol }
                                            </Text>
                                        </View>
                                        <View style={styles.sectionRutaTouchable}>
                                            <Text style = {styles.textRutaTouchable}>
                                                { codigoRuta }
                                            </Text>
                                        </View>
                                        <View style={styles.sectionNameTouchable}>
                                            <Text style = {styles.textNameTouchable}>
                                                { nombreTransportista }
                                            </Text>
                                        </View>
                                        
                                    </View>

                                </TouchableOpacity>
                ;

                solicitudesComponent.push(solicitudComponent);
            });
        }
    }else{
        alert = <View style={styles.container}>

                    <View style={[styles.containerInner, styles.boxShadow]}>
                        <View style={[styles.alertDanger]}>
                            <Text style={styles.textDanger}>
                                <Icon name="exclamation-triangle" size={15} color="#fff" /> No existen solicitudes registradas
                            </Text>
                        </View>
                    </View>

                </View>
        ;
    }

    return (
        <View style={styles.container}>
            <ScrollView vertical={true}>
                <View style={styles.containerInner}>

                    <View style={styles.containerButtonCrear}>
                            <TouchableOpacity
                                style={[styles.buttonCrear, styles.boxShadow]}
                                onPress= {() => navigation.navigate('Crear Solicitud')}
                            >

                                <Text style={styles.textTouchable}>
                                    <Icon name="plus-circle" size={18} color="#fff" />  Agregar
                                </Text>

                            </TouchableOpacity>
                    </View>
                    
                    {solicitudesComponent.map(item => {
                        return item;
                    })}

                    {alert}
                </View>
            </ScrollView>
            
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
    buttonCrear: {
        height: 30,
        width: '35%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#59B720',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#74E42F'
    },
    containerButtonCrear:{
        alignItems: 'flex-end',
        marginBottom: 15
    },
    buttonSol: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#C1C1C1',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#B6B6B6',
        marginBottom: 15
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
    containerElementsTouchable:{
        justifyContent: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 3
    },
    textSolTouchable: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
    },
    textNameTouchable: {
        color: 'white',
        fontSize: 13.5,
        fontWeight: 'bold',
        color: '#4c5c68'
    },
    textFechaTouchable: {
        color: 'white',
        fontSize: 13,
        fontWeight: 'bold',
        color: '#000'
        
    },
    textRutaTouchable: {
        color: 'white',
        fontSize: 13.5,
        fontWeight: 'bold',
        color: '#000'
    },
    sectionRutaTouchable:{
        width: '50%'
    },
    sectionNameTouchable:{
        width: '50%',
        alignItems: 'flex-end',
    },
    sectionFechaTouchable:{
        width: '45%',
        alignItems: 'flex-end',
    },
    sectionSolTouchable:{
        width: '55%',
        // El background es dinamico
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
        
    },
    alertDanger:{
        backgroundColor: '#E82D2D',
        borderRadius: 5,
        padding: 3
    },
    textDanger: {
        color: 'white',
        fontWeight: 'bold'
    }
});