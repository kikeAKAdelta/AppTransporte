import React, { useState, useEffect } from 'react';
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import RNFetchBlob from 'rn-fetch-blob';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';


import {
    StyleSheet,    Text,    useColorScheme,    View, Button, TouchableOpacity, Alert
} from 'react-native';

const Stack = createNativeStackNavigator();
const db =  openDatabase({name: 'AppTransporteDB.db'});

export const ExportDataEmpleados = ({navigation}) =>{

    const [ listEmpleados, setListEmpleados ] = useState([]);
    const [ listFechas, setListFechas ] = useState([]);

    let tableComponent = <Table></Table>;

    useEffect(() =>{
        getListFechasRegistros();
    }, []);

    /**
     * Funcion encargada de obtener la lista de empleados registrados en sistema.
     */
    const getListaEmpleados = () =>{

        const sql = `SELECT 
                            TD.ID_TRANSPORT
                        ,   TD.ID_TRANSPORTISTA
                        ,   (SELECT NOMBRE FROM TRANSPORTISTA WHERE ID_TRANSPORTISTA = TD.ID_TRANSPORTISTA) NOMBRE_TRANSPORTISTA
                        ,   TD.ID_RUTA
                        ,   (SELECT CODIGO FROM RUTA WHERE ID_RUTA = TD.ID_RUTA) CODIGO_RUTA
                        ,   (SELECT DESCRIPCION FROM RUTA WHERE ID_RUTA = TD.ID_RUTA) DESCRIPCION_RUTA
                        ,   TD.PLACA
                        ,   TD.CODIGO_EMPLEADO
                        ,   TD.FECHA_REGISTRO
                    FROM 
                        TRANSPORTE_DETALLE TD
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

                        setListEmpleados(results);
                        console.log('Empleados obtenidos correctamente!');
                    }else{
                        console.log('No se encontraron empleados registrados');
                    }
                },
                error => {
                console.log("Error obteniendo lista de empleados registrados " + error.message);
            }
            )
        });
    }

    const getListFechasRegistros = () => {

        /**Sql que obtiene todos las fechas de registros de empleados unicos */
        const sql = `SELECT
                        DISTINCT
                        strftime('%d/%m/%Y', \`FECHA_REGISTRO\`) FECHA_REGISTRO
                    FROM 
                        TRANSPORTE_DETALLE
        `;

        db.transaction(txn => {

            txn.executeSql(
                sql, 
                [],
                (sqlTxn, res) => {
                    
                    let cantidad = res.rows.length;
                    let results = [];
                    setListFechas([]);

                    if(cantidad > 0){
                        
                        for(indice = 0; indice < cantidad; indice++){
                            let item = res.rows.item(indice);

                            results.push(item);
                        }

                        setListFechas(results);

                        console.log('Fechas obtenidas correctamente!');
                    }else{
                        console.log('No se encontraron fechas de registros');
                    }
                },
                error => {
                console.log("Error obteniendo lista de fechas registrados " + error.message);
            }
            )
        });


    }

    const _alertIndex = (index) => {
        Alert.alert(`This is row ${index + 1}`);
    }

    if(listFechas.length > 0){

        let fechasRegistros = [];
        let cantidad = listFechas.length;
        let fecha = [];

        
        for(let index = 0; index < cantidad; index++){

            //console.log(listFechas[index].FECHA_REGISTRO);
            fecha = [];
            let fechaRegistro      = listFechas[index].FECHA_REGISTRO;

            fecha.push(fechaRegistro);
            fecha.push(1);
            console.log(fecha);
            fechasRegistros.push(fecha);
            console.log(fechasRegistros);
        }


        const element = (data, index) => (
            <TouchableOpacity onPress={() => _alertIndex(index)}>
              <View style={styles.btn}>
                <Text style={styles.btnText}>button</Text>
              </View>
            </TouchableOpacity>
        );

        const thead = ['FECHA REGISTRO', 'EXPORTAR'];

        tableComponent = <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                    <Row data={thead} style={styles.head} textStyle={styles.textHead}/>
                    {/* <Rows data={fechasRegistros} style={styles.tableBody} textStyle={styles.tableBody} /> */}
                    {
                        fechasRegistros.map((rowData, index) => (
                            <TableWrapper key={index} style={styles.row}>
                              {
                                rowData.map((cellData, cellIndex) => (
                                  <Cell key={cellIndex} data={cellIndex === 1 ? element(cellData, index) : cellData} textStyle={styles.tableBody}/>
                                ))
                              }
                            </TableWrapper>
                          ))
                    }
                </Table>
        ;
    }

    return (
        <View>
            {tableComponent}
        </View>
    );
}

const styles = StyleSheet.create({

    head: { 
            height: 40
        ,   backgroundColor: '#3792C6'
        ,   color: '#fff !important'
        ,   fontWeight: 'bold'
    },
    textHead:{
        textAlign: 'center'
    },
    tableBody:{
            color: 'black'
        ,   textAlign: 'center'
    },
    btn: { width: 58, height: 18, backgroundColor: '#78B7BB',  borderRadius: 2 },
    btnText: { textAlign: 'center', color: '#fff' },
    row: { flexDirection: 'row', backgroundColor: '#FFF1C1' },
    
});