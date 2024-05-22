import React, { useState, useEffect } from 'react';
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import RNFetchBlob from 'rn-fetch-blob';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import { authorize } from 'react-native-app-auth';
import { createSessionDropbox, getSessionDropbox, existSessionUser } from './../login/Session.js';
import Mailer from "react-native-mail";
// import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useIsFocused } from '@react-navigation/native';
import RNSmtpMailer from "react-native-smtp-mailer";

import {
    StyleSheet,    Text,    useColorScheme,    View, Button, TouchableOpacity, Alert
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
    const [ miDate, setMiDate ] = useState('');
    const [ sesionDropbox, setSesionDropbox ] = useState({});
    const isFocused = useIsFocused();               /**Cuando tome el foco, si cambia recargara la funcion en useEffect */

    let tableComponent = <Table></Table>;

    useEffect(() => {
        getListFechasRegistros();
    }, [isFocused]);

    useEffect(() => {
        exportDataFecha(miDate);
    }, [listEmpleados]);

    const sendMail = (fecha) => {

        const PATH_TO_THE_FILE = `${RNFetchBlob.fs.dirs.DownloadDir}/TransportePTCA_${fecha}.csv`;

        Mailer.mail({
            subject: 'Asistencia Transporte PTCA' + fecha,
            recipients: ['kike04arevalo@gmail.com'],     //Es el TO, el FROM lo toma de quien este logueado en sesion ya sea Gmail, Outlook, etc
            body: 'Anexo informacion de asistencia de PTCA',
            isHTML: false,
            attachments: [{
                path: PATH_TO_THE_FILE,
                type: 'csv', // Mime Type: jpg, png, doc, ppt, html, pdf, csv
            }]
            },(error, event) => {
            if(error!=undefined){
                alert(AppConfig.AppName + ' cannot open default Email App.');
            }
        }); 
            
    }

    const sendMailSmtp = (fecha) =>{

        const PATH_TO_THE_FILE = `${RNFetchBlob.fs.dirs.DownloadDir}/TransportePTCA_${fecha}.csv`;

        RNSmtpMailer.sendMail({
            mailhost: "smtp.gmail.com",
            port: "465",
            ssl: true, // optional. if false, then TLS is enabled. Its true by default in android. In iOS TLS/SSL is determined automatically, and this field doesn't affect anything
            username: "kike04arevalo@gmail.com",
            password: "znmhhugnczfcbmgm",
            fromName: "kike04arevalo@gmail.com", // optional
            replyTo: "kike04arevalo@gmail.com", // optional
            recipients: "kike04arevalo@gmail.com",
            bcc: ["kike04arevalo@gmail.com",], // optional
            subject: "Asitencia de Transporte de Empleados Pettenati",
            htmlBody: `
                        <h1>Transporte Pettenati Centro America S.A de C.V</h1>
                        <p>Lista de Empleados que hicieron uso del beneficio de transporte de la empresa.</p><br>
                        <p>Se adjunta documento en formato CSV.</p>
            `,
            attachmentPaths: [
                PATH_TO_THE_FILE
            ], // optional
            attachmentNames: [
                `TransportePTCA_${fecha}.csv`,
            ],
            /**attachmentPaths: [
              RNFS.ExternalDirectoryPath + "/image.jpg",
              RNFS.DocumentDirectoryPath + "/test.txt",
              RNFS.DocumentDirectoryPath + "/test2.csv",
              RNFS.DocumentDirectoryPath + "/pdfFile.pdf",
              RNFS.DocumentDirectoryPath + "/zipFile.zip",
              RNFS.DocumentDirectoryPath + "/image.png"
            ], // optional
            attachmentNames: [
              "image.jpg",
              "firstFile.txt",
              "secondFile.csv",
              "pdfFile.pdf",
              "zipExample.zip",
              "pngImage.png"
            ],**/ // required in android, these are renames of original files. in ios filenames will be same as specified in path. In a ios-only application, no need to define it
        })
        .then(
            //success => console.log(success)
            Toast.show({
                type: 'success',
                text1: 'Correo enviado correctamente',
                text2: 'Correo enviado a RRHH',
                visibilityTime: 2000
            })
        )
        .catch(err => console.log(err));

    }

    /**
     * Funcion encargada de obtener la lista de empleados registrados en sistema.
     */
    const getListaEmpleados = (fecha) => {

        const sql = `SELECT 
                            TD.ID_TRANSPORT
                        ,   TD.ID_TRANSPORTISTA
                        ,   (SELECT NOMBRE FROM TRANSPORTISTA WHERE ID_TRANSPORTISTA = TD.ID_TRANSPORTISTA) NOMBRE_TRANSPORTISTA
                        ,   TD.ID_RUTA
                        ,   (SELECT CODIGO FROM RUTA WHERE ID_RUTA = TD.ID_RUTA) CODIGO_RUTA
                        ,   (SELECT DESCRIPCION FROM RUTA WHERE ID_RUTA = TD.ID_RUTA) DESCRIPCION_RUTA
                        ,   TD.CODIGO_EMPLEADO
                        ,   TD.FECHA_REGISTRO
                    FROM 
                        TRANSPORTE_DETALLE TD
                    WHERE
                    strftime('%Y-%m-%d', TD.FECHA_REGISTRO) = '${fecha}'
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

                        setMiDate(fecha);
                        setListEmpleados(results);
                        //console.log('Empleados obtenidos correctamente en export user!');
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
                    ORDER BY
                        FECHA_REGISTRO DESC
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
            const pathToWrite = `${RNFetchBlob.fs.dirs.DownloadDir}/TransportePTCA_${nuevaFecha}.csv`;
            // pathToWrite /storage/emulated/0/Download/data.csv
            RNFetchBlob.fs
            .writeFile(pathToWrite, csvString, 'utf8')
            .then(() => {

                //console.log(`wrote file ${pathToWrite}`);
                //alert('descargado correctamente');
                // wrote file /storage/emulated/0/Download/data.csv

                Toast.show({
                    type: 'success',
                    text1: 'Descarga Exitosa',
                    text2: 'Archivo Generado Exitosamente',
                    visibilityTime: 2000
                })

                setTimeout(function(){
                    // sendDataDropbox(nuevaFecha);
                    //sendMail(nuevaFecha);
                    sendMailSmtp(nuevaFecha);
                }, 2000);

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

            //console.log(authState);
            createSessionDropbox(dropboxUID);
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

    const getSesion = async () =>{
        //console.log(sesionDropbox);
        tokenSesion = await getSessionDropbox()
        //console.log(tokenSesion);
    }

    /**
     * Funcion encargada de poder enviar la informacion a DropBox
     */
    const sendDataDropbox = async (fechaExport) =>{

        //console.log('fecha export sendataDropbox', fechaExport);

        const PATH_TO_THE_FILE = `${RNFetchBlob.fs.dirs.DownloadDir}/TransportePTCA_${fechaExport}.csv`;

        /**El beare lo obtengo de dropbox donde he creado mi proyecto como desarrollador */
        //const bearerTkn = ``;
        const bearerTkn = await getSessionDropbox();
        //console.log(bearerTkn);

        if(bearerTkn != ''){

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
                        path: `/TransportePTCA_${fechaExport}.csv`,
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
                //console.log(res);
                //console.log(res.respInfo.status);

                let statusResponse = res.respInfo.status;

                if(statusResponse != 200){

                    if(statusResponse == 401){
                        
                        Toast.show({
                            type: 'error',
                            text1: 'Dropbox',
                            text2: 'No se pudo cargar en la nube, favor iniciar sesion en Dropbox',
                            visibilityTime: 2000
                        })

                        return;
                    }
                }

                Toast.show({
                    type: 'success',
                    text1: 'Carga',
                    text2: 'Archivo Subido Correctamente',
                    visibilityTime: 2000
                })
            })
            .catch((err) => {
                // error handling ..
                console.log('Error');

                Toast.show({
                    type: 'error',
                    text1: 'Sesion Dropbox',
                    text2: 'Favor inicie sesion en Dropbox',
                    visibilityTime: 2000
                })

            });
        }else{

            Toast.show({
                type: 'error',
                text1: 'Sesion Dropbox',
                text2: 'Favor inicie sesion en Dropbox',
                visibilityTime: 2000
            })
        }

        
    }

    if(listFechas.length > 0){

        let fechasRegistros = [];
        let cantidad = listFechas.length;
        let fecha = [];

        for(let index = 0; index < cantidad; index++){

            
            let fechaRegistro      = listFechas[index].FECHA_REGISTRO;
            fecha.push(fechaRegistro);
            fecha.push(fechaRegistro);                  //De relleno, aca lo opaca el boton

            fechasRegistros.push(fecha);
            fecha = [];
        }

        //console.log(fechasRegistros);

        const element = (data, index) => (
            <TouchableOpacity onPress={() => getListaEmpleados(data) }>
              <View style={styles.containerBtn}>
                <Text style={[styles.btnText]}>
                    <Icon name="paper-plane" size={13} color="#fff" solid />  Enviar Mail
                </Text>
              </View>
            </TouchableOpacity>
        );

        /**const element = (data, index) => (
            <Button title="Enviar Mail" onPress={() => getListaEmpleados(data) } />
        );**/


        const thead = ['Fecha Registro', 'Exportar'];

        tableComponent = 
            <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                    <Row data={thead} style={styles.head} textStyle={styles.textHead} />
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

                          )

                        )
                    }
            </Table>
        ;
    }

    return (
        <View style={styles.container}>
            <View style={[styles.containerInner, styles.boxShadow]}>

                <View style={styles.containerTextLabel}>
                    <Text style={[styles.textLabel, styles.textShadow]}>Exportar Registros a RRHH</Text>
                </View>

                <View style={styles.containerButton}>
                    {/* <Button title="Iniciar Sesion Dropbox" onPress={loginDropBox} /> */}

                    <TouchableOpacity
                            style={[styles.buttonLogin, styles.boxShadow]}
                            onPress={ loginDropBox }
                    >

                        <Text style={styles.textTouchable}>
                            <Icon name="sign-in-alt" size={15} color="#fff" solid /> Sesion Dropbox
                        </Text>

                    </TouchableOpacity>
                    {/* <Button title="Imp Sesion" onPress={getSesion} /> */}
                    {/* <Button title="Send Mail" onPress={sendMail} />  */}
                </View>
                {tableComponent}
            </View>

        </View>
    );
}

const styles = StyleSheet.create({

    head: {
            height: 40
        ,   backgroundColor: '#3792C6'
        ,   color: '#fff'
        ,   fontWeight: 'bold'
    },
    textHead:{
            textAlign: 'center'
        ,   color: '#fff'
        ,   fontWeight: 'bold'
        ,   fontSize: 16
    },
    tableBody:{
            color: 'black'
        ,   textAlign: 'center'
        ,   padding: 10
          
    },
    containerBtn: { 
            backgroundColor: '#78B7BB'
        ,   justifyContent: 'center'
        ,   borderRadius: 50
        ,   flex: 1
    },
    btnText: { 
            textAlign: 'center'
        ,   verticalAlign: 'middle'
        ,   color: '#fff' 
        ,   backgroundColor: '#26B3E8'
        ,   borderRadius: 50
        ,   fontWeight: 'bold'
        ,   height: 30
        ,   justifyContent: 'center'
        ,   alignItems: 'center'
        ,   paddingTop: 5
    },
    row: { 
            flexDirection: 'row'
        ,   backgroundColor: '#fff' 
        
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
    textStyle: {
        color: '#000',
        marginBottom: 5
    },
    containerSection:{
        marginTop: 15,
        marginBottom: 15,
    },
    boxShadow:{
        shadowColor: '#000',
        elevation: 20, // Android
        shadowOffset: { height: -2, width: 4 }, // IOS
        shadowOpacity: 0.2, // IOS
        shadowRadius: 3, //IOS
    },
    containerButton:{
        marginTop: 10,
        marginBottom: 30
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
    buttonLogin: {
        height: 30,
        width: 140,
        justifyContent: 'center',
        backgroundColor: '#2FA1E7',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#1AA1F3'
    },
    textTouchable: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 7,
    },
});