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

export const RutasTransportistasList = ({navigation, route}) =>{

    const isFocused = useIsFocused();               /**Cuando tome el foco, si cambia recargara la funcion en useEffect */

    const [ listTransportista, setListTransportista ] = useState([]);

    useEffect(() =>{
        getListaTransportistas();
    }, [isFocused]);

    /**
     * Funcion encargada de obtener la lista de transportistas registrados en sistema.
     */
    const getListaTransportistas = () =>{

        const sql = `SELECT
                            ID_TRANSPORTISTA
                        ,	NOMBRE
                        ,	DUI
                        ,	PLACA
                        ,	PASSWORD
                        ,	CODIGO_USUARIO
                    FROM 
                        TRANSPORTISTA
                    ORDER BY
                        CODIGO_USUARIO ASC
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
                        console.log('No se encontraron transportista registrados');
                    }
                },
                error => {
                console.log("Error obteniendo lista de transportistas registrados " + error.message);
            }
            )
        });
    }


    let table = <Table></Table>;
    let alert = <View></View>;

    if(listTransportista.length > 0){

        let transportistas      = [];
        let transportista       = [];
        let arrItem             = [];

        let cantidad = listTransportista.length;

        for(let index = 0; index < cantidad;index++){

            let idTransportista = listTransportista[index].ID_TRANSPORTISTA;
            let nombre          = listTransportista[index].NOMBRE;
            let dui             = listTransportista[index].DUI;
            let placa           = listTransportista[index].PLACA;
            let password        = listTransportista[index].PASSWORD;
            let codigoUsuario   = listTransportista[index].CODIGO_USUARIO;

            transportista.push(codigoUsuario);
            transportista.push(nombre);
            transportista.push(dui);
            transportista.push(placa);

            transportistas.push(transportista);
            transportista = [];

        }

        const thead = ['Codigo', 'Nombre','Placa', 'Editar'];
        const widthArr = [75, 150, 80, 80];

        const buttonUpdate = (data, index) => (
            <TouchableOpacity onPress={() => navigation.navigate('RutasTransportistasDetail',{ usuario: data}) }>
              <View style={styles.containerBtn}>
                <Text style={[styles.btnText]}>
                    <Icon name="tasks" size={22} color="#000" solid />
                </Text>
              </View>
            </TouchableOpacity>
        );
        
        table =
            <ScrollView vertical={true} >
                <View style={[styles.containerInner, styles.boxShadow]}>

                    <View style={styles.containerTextLabel}>
                        <Text style={[styles.textLabel, styles.textShadow]}>Lista de Transportistas y Rutas</Text>
                    </View>

                    
                        <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                            <Row data={thead} style={styles.head} textStyle={styles.textHead} />

                            {
                                transportistas.map((rowData, index) => (

                                        <TableWrapper key={index} style={styles.row}>
                                        {
                                            rowData.map((cellData, cellIndex) => (
                                                <Cell key={cellIndex} data={cellIndex === 3 ? buttonUpdate(rowData, cellIndex) : cellData} textStyle={styles.tableBody}/>
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
            backgroundColor: '#ffc107'
        ,   justifyContent: 'center'
        ,   borderRadius: 10
        ,   borderColor: '#F0B813'
        ,   borderWidth: 1
        ,   width: '95%'
        ,   margin: 3
    },
    btnText: { 
            textAlign: 'center'
        ,   verticalAlign: 'middle'
        ,   color: '#000' 
        ,   backgroundColor: '#ffc107'
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
        alignItems: 'center',
        width: '100%',
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
    row: { 
            flexDirection: 'row'
        ,   backgroundColor: '#fff' 
    },
    
  
});