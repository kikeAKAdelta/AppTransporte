import React, { useState, useEffect } from 'react'
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import Icon from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import { useIsFocused } from '@react-navigation/native';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import database from '@react-native-firebase/database';

import {
    StyleSheet,    Text,    useColorScheme,    View, Button, TouchableOpacity, TextInput, ScrollView, SafeAreaView, StatusBar
} from 'react-native';

const db  = openDatabase(
    {name: 'Tranporte.db', createFromLocation: '~Tranporte.db'},
    () => { console.log('Conexion a la Base de Datos Exitosa New');},
    (error) =>{
        console.error(error);
        throw Error("Error conexion a Base de Datos Local New");
    }
);

export const RutasTransportistasDetail = ({navigation, route}) =>{

    const isFocused = useIsFocused();               /**Cuando tome el foco, si cambia recargara la funcion en useEffect */

    const [ listTransportista, setListTransportista ] = useState([]);
    const [ isDelete, setIsDelete ] = useState(false);

    useEffect(() =>{
        getListaRutasTransportistas();
    }, [isFocused, route]);

    /**
     * Funcion encargada de obtener la lista de transportistas registrados en sistema.
     */
    const getListaRutasTransportistas = () =>{

        let codigoTransportista = route.params.usuario[0];
        console.log('codigo usuario',route.params.usuario[0]);

        const sql = `SELECT 
                            TR.ID_RUTA
                        ,   TR.ID_TRANSPORTISTA
                        ,   TP.CODIGO_USUARIO
                        ,   (SELECT CODIGO FROM RUTA WHERE ID_RUTA = TR.ID_RUTA) CODIGO_RUTA
                        ,   (SELECT DESCRIPCION FROM RUTA WHERE ID_RUTA = TR.ID_RUTA) DESCRIPCION_RUTA
                    FROM 
                        TRANSPORTISTA_RUTA TR
                    INNER JOIN
                        TRANSPORTISTA TP
                    ON
                        TR.ID_TRANSPORTISTA = TP.ID_TRANSPORTISTA
                    WHERE
                        TP.CODIGO_USUARIO = ${codigoTransportista}
        `
        
        db.transaction(txn => {
            txn.executeSql(
                sql,
                [],
                (sqlTxn, res) => {
                    
                    let cantidad = res.rows.length;
                    let results = [];

                    if(cantidad > 0){

                        for(indice = 0; indice < cantidad; indice++){
                            let item = res.rows.item(indice);
                            results.push(item);
                        }

                        setListTransportista(results);
                    }else{
                        console.log('No se encontraron rutas de transportista registrados');
                    }
                },
                error => {
                console.log("Error obteniendo lista de rutas de transportistas registrados " + error.message);
            }
            )
        });
    }

    /**
     * Funcion encargada de eliminar una ruta de un transportista.
     * @param {*} data Informacion de la ruta y el transportista.
     */
    const eliminarRutaTransportista = (data) =>{

        let arrRutaTransport = data[2];

        let idRuta          = arrRutaTransport[0];
        let idTransportista = arrRutaTransport[1];

        let usuario = [
                idRuta
            ,   idTransportista 
        ];

        const insertQuery = `
            DELETE FROM
                TRANSPORTISTA_RUTA 
            WHERE
                    ID_RUTA             = ?
                AND ID_TRANSPORTISTA    = ?
        `;

        db.transaction(txn =>{
            txn.executeSql(
                    insertQuery,
                    usuario,
                    (sqlTxn, res) =>{
                        
                        Toast.show({
                            type: 'success',
                            text1: 'Eliminacion de Ruta de Transportista',
                            text2: 'Registro eliminado correctamente',
                            visibilityTime: 2000
                        })

                        getListaRutasTransportistas();

                    },
                    error =>{
                        console.log("Error actualizando ruta " + error.message);
                    }
                );
            }
        );
    }


    let table = <Table></Table>;
    let alert = <View></View>;

    if(listTransportista.length > 0){

        let transportistas      = [];
        let transportista       = [];
        let arrItem             = [];

        let cantidad = listTransportista.length;

        for(let index = 0; index < cantidad;index++){

            let idRuta              = listTransportista[index].ID_RUTA;
            let idTransportista     = listTransportista[index].ID_TRANSPORTISTA;
            let codigoUsuario       = listTransportista[index].CODIGO_USUARIO;
            let codigoRuta          = listTransportista[index].CODIGO_RUTA;
            let descripcionRuta     = listTransportista[index].DESCRIPCION_RUTA;

            transportista.push(codigoRuta);
            transportista.push(descripcionRuta);
            transportista.push([idRuta, idTransportista]);
            
            transportistas.push(transportista);
            transportista = [];

        }

        const thead     = ['Ruta', 'Descripcion','Eliminar'];
        const widthArr  = [75, 150, 80];

        const buttonDelete = (data, index) => (
            <TouchableOpacity onPress={() => eliminarRutaTransportista(data) }>
              <View style={styles.containerBtn}>
                <Text style={[styles.btnText]}>
                    <Icon name="trash" size={22} color="#fff" solid />
                </Text>
              </View>
            </TouchableOpacity>
        );
        
        table =
            <ScrollView vertical={true} >
                <View style={[styles.containerInner, styles.boxShadow]}>

                    <View style={styles.containerTextLabel}>
                        <Text style={[styles.textLabel, styles.textShadow]}>Detalle de Rutas de Transportista</Text>
                    </View>

                    <View style={[styles.containerTextName]}>
                        <Text style={[styles.textName]}>Usuario: { route.params.usuario[1] } </Text>
                    </View>

                    <View style={[styles.containerButtonCrear]}>
                            <TouchableOpacity
                                style={[styles.buttonCrear, styles.boxShadow]}
                                onPress= {() => navigation.navigate('RutasTransportistasAdd', { codigoTransportista: route.params.usuario[0], nombreTransportista: route.params.usuario[1]})}
                            >

                                <Text style={styles.textTouchable}>
                                    <Icon name="plus-circle" size={18} color="#fff" />  Agregar
                                </Text>

                            </TouchableOpacity>
                    </View>
                    
                        <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                            <Row data={thead} style={styles.head} textStyle={styles.textHead} />

                            {
                                transportistas.map((rowData, index) => (

                                        <TableWrapper key={index} style={styles.row} >
                                        {
                                            rowData.map((cellData, cellIndex) => (
                                                <Cell key={cellIndex} data={cellIndex === 2 ? buttonDelete(rowData, cellIndex) : cellData} textStyle={styles.tableBody}/>
                                            ))
                                        }
                                        </TableWrapper>

                                    )

                                )
                            }
                        </Table>
                    
                </View>
            </ScrollView>
            
        ;
    }else{
        
        alert = 
                <View style={[styles.containerInner, styles.boxShadow]}>

                    <View style={[styles.alertDanger]}>
                        <Text style={styles.textDanger}>
                            <Icon name="exclamation-triangle" size={15} color="#fff" /> No existen transportistas registrados.
                        </Text>
                    </View>

                    <View style={styles.containerElements}>
                    <View style={styles.containerButtonBack}>
                        <TouchableOpacity
                            style={[styles.buttonBack, styles.boxShadow]}
                            onPress= {() => navigation.navigate('Menu')}
                        >

                            <Text style={styles.textTouchable}>
                                <Icon name="undo" size={15} color="#fff" />  Regresar
                            </Text>

                        </TouchableOpacity>
                    </View>

                    <View style={[styles.containerButtonCrearElse]}>
                            <TouchableOpacity
                                style={[styles.buttonCrearElse, styles.boxShadow]}
                                onPress= {() => navigation.navigate('RutasTransportistasAdd', { codigoTransportista: route.params.usuario[0], nombreTransportista: route.params.usuario[1]})}
                            >

                                <Text style={styles.textTouchable}>
                                    <Icon name="plus-circle" size={18} color="#fff" />  Agregar
                                </Text>

                            </TouchableOpacity>
                    </View>
                    </View>

                    

                </View>
        ;
    }

    return (
        <View style={styles.container}>
            {table}
            {alert}
        </View>
    );

}

const styles = StyleSheet.create({
    head: { 
            height: 40
        ,   backgroundColor: '#3792C6'
        ,   fontWeight: 'bold'
    },
    textHead:{
            textAlign: 'center'
        ,   color: '#fff'
        ,   fontWeight: 'bold'
    },
    tableBody:{
            color: 'black'
        ,   textAlign: 'center'
        ,   borderCollapse: 'collapse'
        ,   fontSize: 13
    },
    dataWrapper: { marginTop: -1 },
    container:{
        marginLeft: 5,
        marginRight: 5,
        marginTop: 5,
        marginBottom: 10
    },
    container:{
        marginLeft: 5,
        marginRight: 5,
        marginTop: 5,
    },
    containerInner:{
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 4,
        width: '100%'
    },
    boxShadow:{
        shadowColor: '#000',
        elevation: 20, // Android
        shadowOffset: { height: -2, width: 4 }, // IOS
        shadowOpacity: 0.2, // IOS
        shadowRadius: 3, //IOS
    },
    textLabel:{
        fontSize: 20,
        color: '#000',
        fontFamily: '',
        fontWeight: 'bold',
        fontStyle: 'italic',
        marginBottom: 17,
    },
    textShadow: {
        textShadowColor: 'rgba(48, 48, 48, 0.3)',
        textShadowOffset: {width: -3, height: 3},
        textShadowRadius: 10
    },
    containerTextLabel:{
        alignItems: 'center',
        justifyContent: 'center'
    },
    containerTextName:{
    },
    alertDanger:{
        backgroundColor: '#E82D2D',
        borderRadius: 5,
        padding: 3
    },
    textDanger: {
        color: 'white',
        fontWeight: 'bold'
    },
    containerBtn: { 
            backgroundColor: '#E81111'
        ,   justifyContent: 'center'
        ,   borderRadius: 10
        ,   borderColor: '#F31B1B'
        ,   borderWidth: 1
        ,   width: '95%'
        ,   margin: 3
    },
    btnText: { 
            textAlign: 'center'
        ,   verticalAlign: 'middle'
        ,   color: '#fff' 
        ,   backgroundColor: '#E81111'
        ,   borderRadius: 10
        ,   fontWeight: 'bold'
        ,   height: 30
        ,   justifyContent: 'center'
        ,   alignItems: 'center'
        ,   paddingTop: 5
    },
    containerSendMail:{
        marginBottom: 20,
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    containerButtonBack:{
        width: '30%',
        marginTop: 40,
        marginBottom: 20
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
    textTouchable: {
        color: 'white',
        fontSize: 15.5,
        fontWeight: 'bold',
        justifyContent: 'center', //Centered vertically
    },
    containerButtonCrear:{
        alignItems: 'flex-end',
        marginBottom: 15
    },
    containerButtonCrearElse:{
        width: '30%',
        marginTop: 40,
        marginBottom: 20
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
    buttonCrearElse: {
        width: '100%',
        backgroundColor: '#59B720',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#74E42F',
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: { 
            flexDirection: 'row'
        ,   backgroundColor: '#fff' 
    },
    textName:{
        fontWeight: 'bold',
        fontSize: 15
    },
    containerElements:{
        justifyContent: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 3,
    },
  
});