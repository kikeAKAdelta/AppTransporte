import React, { useState, useEffect } from 'react';
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';

import {
    StyleSheet,    Text,    useColorScheme,    View, Button
} from 'react-native';

const Stack = createNativeStackNavigator();
const db =  openDatabase({name: 'AppTransporteDB.db'});

export const ConsultaEmpleado = ({navigation}) =>{

    console.log('Ingreso al componente consulta Empleado');

    const [ listEmpleados, setListEmpleados ] = useState([]);

    useEffect(() =>{
        getListaEmpleados();
    }, []);


    /**
     * Funcion encargada de obtener la lista de empleados registrados en sistema.
     */
    const getListaEmpleados = () =>{

        console.log('Ingreso a metdoo de obtener lista empleado');

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

    let table = <Table></Table>

    if(listEmpleados.length > 0){

        let empleados = [];
        let empleado = [];
        let arrItem = [];

        console.log(listEmpleados);

        for(let index =0; index < listEmpleados.length;index++){
            console.log(listEmpleados[index]);
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

        const thead = ['TRANSPORT', 'RUTA', 'COD EMP', 'FEC REG'];
        table = <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                    <Row data={thead} style={styles.head} textStyle={styles.textHead}/>
                    <Rows data={empleados} style={styles.tableBody} textStyle={styles.tableBody} />
                </Table>
        ;
    }

    return (
        <View>
            {table}
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
    }
    
  });