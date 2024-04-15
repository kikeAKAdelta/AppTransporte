import React, { useState, useEffect } from 'react';
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import RNFetchBlob from 'rn-fetch-blob';

import {
    StyleSheet,    Text,    useColorScheme,    View, Button
} from 'react-native';

const Stack = createNativeStackNavigator();
const db  = openDatabase(
    {name: 'Tranporte.db', createFromLocation: '~www/Tranporte.db'},
    () => { console.log('Conexion a la Base de Datos Exitosa New');},
    (error) =>{
        console.error(error);
        throw Error("Error conexion a Base de Datos Local New");
    });

export const ExportDataEmpleados = ({navigation}) =>{

    const [ listEmpleados, setListEmpleados ] = useState([]);
    const [ listFechas, setListFechas ] = useState([]);

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
                        console.log('Empleados obtenidos correctamente 22!');
                        
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
                        strftime('%d/%m/%Y', \`FECHA_REGISTRO \`) DIAS_REGISTROS
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

    if(listFechas.length > 0){
        
    }
}