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
    const getListaEmpleados = (fecha) =>{

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
                    WHERE
                        TD.FECHA_REGISTRO = '${fecha}'
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

    /**
     * Funcion encargada de obtener las fechas unicas en las cuales se han tenido registro de empleados.
     */
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

    /**
     * Funcion encargada de crear un documento excel en el dispositivo para poder lo exportar de acuerdo a la fecha en concreto
     */
    const exportDataFecha = (fecha) =>{

        getListaEmpleados(fecha);

        if(listEmpleados.length > 0){

            let empleados   = [];
            let empleado    = [];
            let arrItem     = [];
    
            for(let index = 0; index < listEmpleados.length;index++){
    
                empleado = [];
                let codigoEmpleado      = listEmpleados[index].CODIGO_EMPLEADO;
                let codigoRuta          = listEmpleados[index].CODIGO_RUTA;
                let fechaRegistro       = listEmpleados[index].FECHA_REGISTRO;
                let nombreTransportista = listEmpleados[index].NOMBRE_TRANSPORTISTA;
    
                empleado.push(nombreTransportista);
                empleado.push(codigoRuta);
                empleado.push(codigoEmpleado);
                empleado.push(fechaRegistro);
    
                empleados.push(empleado);
    
            }

            const headerString = 'Transportista,Ruta,CodigoEmpleado, FechaRegistro\n';
            const rowString = empleados.map(d => `${d[0]},${d[1]},${d[2]},${d[3]}\n`).join('');

            const csvString = `${headerString}${rowString}`;
            const pathToWrite = `${RNFetchBlob.fs.dirs.DownloadDir}/dataTransportista.csv`;
            // pathToWrite /storage/emulated/0/Download/data.csv
            RNFetchBlob.fs
                .writeFile(pathToWrite, csvString, 'utf8')
                .then(() => {
                console.log(`wrote file ${pathToWrite}`);
                alert('descargado correctamente');
                // wrote file /storage/emulated/0/Download/data.csv
            }) .catch(error => console.error(error));
    
            
        }
    }

    const _alertIndex = (index) => {
        Alert.alert(`This is row ${index + 1}`);
    }

    if(listFechas.length > 0){

        let fechasRegistros = [];
        let cantidad = listFechas.length;
        let fecha = [];

        
        for(let index = 0; index < cantidad; index++){

            fecha = [];
            let fechaRegistro      = listFechas[index].FECHA_REGISTRO;
            fecha.push(fechaRegistro);
            fecha.push(1);                  //De relleno, aca lo opaca el boton

            fechasRegistros.push(fecha);
        }

        const element = (data, index) => (
            <TouchableOpacity onPress={() => exportDataFecha(data) }>
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