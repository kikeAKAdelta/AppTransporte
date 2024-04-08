import React, { useState, useEffect } from 'react';
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import RNFetchBlob from 'rn-fetch-blob';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import { authorize } from 'react-native-app-auth';


import {
    StyleSheet,    Text,    useColorScheme,    View, Button, TouchableOpacity, Alert
} from 'react-native';

const Stack = createNativeStackNavigator();
const db =  openDatabase({name: 'AppTransporteDB.db'});

export const ExportDataEmpleados = ({navigation}) =>{

    const [ listEmpleados, setListEmpleados ] = useState([]);
    const [ listFechas, setListFechas ] = useState([]);
    const [ miDate, setMiDate ] = useState('');
    const [ sesionDropbox, setSesionDropbox ] = useState({});

    let tableComponent = <Table></Table>;

    useEffect(() =>{
        getListFechasRegistros();
    }, []);

    useEffect(() => {
        exportDataFecha(miDate);
    }, [listEmpleados]);

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
                    strftime('%Y-%m-%d', TD.FECHA_REGISTRO) = '${fecha}'
        `

        console.log(sql);

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

                        setMiDate(fecha);
                        setListEmpleados(results);
                        console.log('Empleados obtenidos correctamente!');
                    }else{
                        setMiDate('');
                        console.log('No se encontraron empleados registrados');
                    }
                },
                error => {
                    setMiDate('');
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
                       -- strftime('%d/%m/%Y', \`FECHA_REGISTRO\`) FECHA_REGISTRO
                        strftime('%Y-%m-%d', \`FECHA_REGISTRO\`) FECHA_REGISTRO
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
    const exportDataFecha = (fecha) => {

        //getListaEmpleados(fecha);       //Debo de hacer que ingrese de manera correcta cuando lis empleado tenga informacion, utilizare useffect
        if(listEmpleados.length > 0){

            console.log('Ingreso al metodo de exportacion');

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

            let nuevaFecha = fecha.replace('-', '');

            const csvString = `${headerString}${rowString}`;
            const pathToWrite = `${RNFetchBlob.fs.dirs.DownloadDir}/dataTransportista_${nuevaFecha}.csv`;
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

    const loginDropBox = async () =>{

        const config = {
            clientId: 'ibutx9ryou5aygl',
            clientSecret: '1w3k80p859d5wvs',
            redirectUrl: 'com.example.app://authorize',
            scopes: [],
            serviceConfiguration: {
              authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
              tokenEndpoint: `https://www.dropbox.com/oauth2/token`,
            },
            /**additionalParameters: {
              token_access_type: 'offline',
            },**/
          };

         try{
            const authState = await authorize(config);
            //const dropboxUID = authState.tokenAdditionalParameters.account_id;
            const dropboxUID = authState.accessToken;

            console.log(authState);
            setSesionDropbox(dropboxUID);
          }catch(error){
            console.log(error);
          }
          
          // Log in to get an authentication token
          

          /**authorize(config)
            .then(res => {
                const sesion = {
                    accessToken: res.accessToken,
                    payload: decodeJWTPayload(res.accessToken),
                    header: decodeJWTHeader(res.accessToken),
                };

                setSesionDropbox(s);
                
                //return EncryptedStorage.setItem('user_session', JSON.stringify(s));
            })
            .catch(err => {
                console.log(err);
                //setProgress(false);
            });**/
    }

    const getSesion = () =>{
        console.log(sesionDropbox);
    }

      

    /**
     * Funcion encargada de poder enviar la informacion a DropBox
     */
    const sendDataDropbox = () =>{

        const PATH_TO_THE_FILE = `${RNFetchBlob.fs.dirs.DownloadDir}/dataTransportista.csv`;

        /**El beare lo obtengo de dropbox donde he creado mi proyecto como desarrollador */
        //const bearerTkn = ``;
        const bearerTkn = sesionDropbox;

        /**La URL de envio para desarrollador de Dropbox siempre debe de ser esa URL (App Console)
         * de acuerdo al BearerToken nuestro archivo se sube en el proyecto correspondiente
         * Para consultar el archivo subido con nombre 'miarchivo.csv' 
         * Nuestro archivo creado en el dispositivo movil lo obtenemos desde las descargas de acuerdo al PathFile
         */
        RNFetchBlob.fetch(
            "POST",
            "https://content.dropboxapi.com/2/files/upload",
            {
                // dropbox upload headers
                Authorization: `Bearer ${bearerTkn}`,
                "Dropbox-API-Arg": JSON.stringify({
                    path: "/miarchivo3.csv",
                    mode: "add",
                    autorename: true,
                    mute: false,
                }), //Descomentar estas lineas despues
                "Content-Type": "application/octet-stream",
                // Change BASE64 encoded data to a file path with prefix `RNFetchBlob-file://`.
                // Or simply wrap the file path with RNFetchBlob.wrap().
            },
            RNFetchBlob.wrap(PATH_TO_THE_FILE)
        )
        .then((res) => {
            console.log(res.text());
            alert('Archivo Subido Correctamente');
        })
        .catch((err) => {
            // error handling ..
            console.log('Error');
        });
    }

    if(listFechas.length > 0){

        let fechasRegistros = [];
        let cantidad = listFechas.length;
        let fecha = [];

        
        for(let index = 0; index < cantidad; index++){

            fecha = [];
            let fechaRegistro      = listFechas[index].FECHA_REGISTRO;
            fecha.push(fechaRegistro);
            fecha.push(fechaRegistro);                  //De relleno, aca lo opaca el boton

            fechasRegistros.push(fecha);
        }

        console.log(fechasRegistros);

        const element = (data, index) => (
            <TouchableOpacity onPress={() => getListaEmpleados(data) }>
              <View style={styles.btn}>
                <Text style={styles.btnText}>button</Text>
              </View>
            </TouchableOpacity>
        );

        const thead = ['FECHA REGISTRO', 'EXPORTAR'];

        tableComponent = 
            <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                    <Row data={thead} style={styles.head} textStyle={styles.textHead}/>
                    {/* <Rows data={fechasRegistros} style={styles.tableBody} textStyle={styles.tableBody} /> */}
                    {
                        fechasRegistros.map((rowData, index) => (

                            <TableWrapper key={index} style={styles.row}>
                              {
                                rowData.map((cellData, cellIndex) => (
                                  <Cell key={cellIndex} data={cellIndex === 1 ? element(cellData, cellIndex) : cellData} textStyle={styles.tableBody}/>
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
            <View>
                <Button title="Iniciar Sesion" onPress={loginDropBox} />
                <Button title="Imp Sesion" onPress={getSesion} />
            </View>
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