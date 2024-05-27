import React, { useState, useEffect } from 'react'
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";
import Icon from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import { createSessionUser, existSessionUser, getSessionUser } from './../login/Session';
import { useIsFocused } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import RNFetchBlob from 'rn-fetch-blob';
import RNSmtpMailer from "react-native-smtp-mailer";
import { DocumentDirectoryPath, writeFile, readDir, readFile, unlink } from 'react-native-fs'; //send files for testin

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

export const SolicitudDetalleList = ({navigation, route}) =>{

    const isFocused = useIsFocused();               /**Cuando tome el foco, si cambia recargara la funcion en useEffect */

    const [ listEmpleados, setListEmpleados ] = useState([]);

    useEffect(() =>{
        getListaEmpleados();
    }, [isFocused]);

    /**
     * Funcion encargada de obtener la lista de empleados registrados en sistema.
     */
    const getListaEmpleados = () =>{

        const idSolicitud = route.params.idSolicitud;

        const sql = `SELECT 
                            SOL.ID_SOLICITUD
                        ,	SOL.ID_TRANSPORTISTA
                        ,	(SELECT CODIGO_USUARIO FROM TRANSPORTISTA WHERE ID_TRANSPORTISTA = SOL.ID_TRANSPORTISTA) CODIGO_TRANSPORTISTA
                        ,	(SELECT NOMBRE FROM TRANSPORTISTA WHERE ID_TRANSPORTISTA = SOL.ID_TRANSPORTISTA) NOMBRE_TRANSPORTISTA
                        ,	SOL.ID_RUTA
                        ,	(SELECT CODIGO FROM RUTA WHERE ID_RUTA = SOL.ID_RUTA) CODIGO_RUTA
                        ,	(SELECT DESCRIPCION FROM RUTA WHERE ID_RUTA = SOL.ID_RUTA) DESCRIPCION_RUTA
                        ,	SOL.ESTADO
                        ,	SOL.FECHA_SOLICITUD
                        ,	SDT.CODIGO_EMPLEADO
                        ,	SDT.FECHA_REGISTRO
                        ,   strftime('%d-%m-%Y', \`FECHA_SOLICITUD\`) FECHA_SOLICITUD_FORMAT
                    FROM 
                        SOLICITUD SOL
                    INNER JOIN
                        SOLICITUD_DETALLE SDT
                    ON
                        SOL.ID_SOLICITUD = SDT.ID_SOLICITUD
                    WHERE	
                        SOL.ID_SOLICITUD = ${idSolicitud}
                    ORDER BY
                        SDT.FECHA_REGISTRO DESC
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
                    }else{
                        console.log('No se encontraron trabajadores registrados');
                    }
                },
                error => {
                console.log("Error obteniendo lista de trabajadores registrados " + error.message);
            }
            )
        });
    }

    /**
     * Funcion encargada de crear un documento excel en el dispositivo para poder lo exportar de acuerdo a la fecha en concreto
     */
    const exportDataFecha = async (fecha) => {

        //getListaEmpleados(fecha);       //Debo de hacer que ingrese de manera correcta cuando lis empleado tenga informacion, utilizare useffect
        if(listEmpleados.length > 0){

            let empleados   = [];
            let empleado    = [];
            let arrItem     = [];
    
            for(let index = 0; index < listEmpleados.length;index++){
    
                empleado = [];
                let idSolicitud         = listEmpleados[index].ID_SOLICITUD;
                let idTransportista     = listEmpleados[index].ID_TRANSPORTISTA;
                let codigoTransportista = listEmpleados[index].CODIGO_TRANSPORTISTA;
                let nombreTransportista = listEmpleados[index].NOMBRE_TRANSPORTISTA;
                let idRuta              = listEmpleados[index].ID_RUTA;
                let codigoRuta          = listEmpleados[index].CODIGO_RUTA;
                let descripcionRuta     = listEmpleados[index].DESCRIPCION_RUTA;
                let estado              = listEmpleados[index].ESTADO;
                let codigoEmpleado      = listEmpleados[index].CODIGO_EMPLEADO;
                let fechaSolicitud      = listEmpleados[index].FECHA_SOLICITUD;
                let fechaRegistro       = listEmpleados[index].FECHA_REGISTRO;
    
                empleado.push(idSolicitud);
                empleado.push(idTransportista);
                empleado.push(codigoTransportista);
                empleado.push(nombreTransportista);
                empleado.push(idRuta);
                empleado.push(codigoRuta);
                empleado.push(descripcionRuta);
                empleado.push(estado);
                empleado.push(codigoEmpleado);
                empleado.push(fechaSolicitud);
                empleado.push(fechaRegistro);
    
                empleados.push(empleado);
    
            }

            // const headerString = 'Transportista,Ruta,CodigoEmpleado, FechaRegistro\n';
            const headerString = 'ID_SOLICITUD,ID_TRANSPORTISTA,CODIGO_TRANSPORTISTA,NOMBRE_TRANSPORTISTA,ID_RUTA,CODIGO_RUTA,DESCRIPCION_RUTA,ESTADO_SOLICITUD,CODIGO_EMPLEADO,FECHA_SOLICITUD,FECHA_REGISTRO\n';
            const rowString = empleados.map(d => `${d[0]},${d[1]},${d[2]},${d[3]},${d[4]},${d[5]},${d[6]},${d[7]},${d[8]},${d[9]},${d[10]}\n`).join('');

            let nuevaDate = fecha.replace('-', '');
            let nuevaFecha = nuevaDate.replace('-', '');

            const csvString = `${headerString}${rowString}`;
            const pathToWrite = `${RNFetchBlob.fs.dirs.DownloadDir}/TransportePTCA${nuevaFecha}.csv`;
            // pathToWrite /storage/emulated/0/Download/data.csv
            /**RNFetchBlob.fs
            .writeFile(pathToWrite, csvString, 'utf8')
            .then(() => {

                Toast.show({
                    type: 'success',
                    text1: 'Descarga Exitosa',
                    text2: 'Archivo Generado Exitosamente',
                    visibilityTime: 2000
                })

                setTimeout(function(){
                    sendMailSmtp(nuevaFecha);
                }, 2000);

            }).catch(error => {
                
                console.error(error)

                Toast.show({
                    type: 'error',
                    text1: 'Error Creacion de Archivo',
                    text2: 'Archivo no generado',
                    visibilityTime: 2000
                })
            });**/

            try {
                //create a file at filePath. Write the content data to it
                await writeFile(pathToWrite, csvString, "utf8");

                Toast.show({
                    type: 'success',
                    text1: 'Descarga Exitosa',
                    text2: 'Archivo Generado Exitosamente',
                    visibilityTime: 2000
                })

                setTimeout(function(){
                    sendMailSmtp(nuevaFecha);
                }, 2000);

            } catch (error) { //if the function throws an error, log it out.
                
                console.error(error)

                Toast.show({
                    type: 'error',
                    text1: 'Error Creacion de Archivo',
                    text2: 'Archivo no generado',
                    visibilityTime: 2000
                })
            }
    
            
        }
    }

    /**
     * Funcion encargada de poder enviar un correo por medio de SMTP
     * @param {*} fecha 
     */
    const sendMailSmtp = (fecha) =>{

        const PATH_TO_THE_FILE = `${RNFetchBlob.fs.dirs.DownloadDir}/TransportePTCA${fecha}.csv`;

        RNSmtpMailer.sendMail({
            mailhost: "smtp.gmail.com",
            port: "465",
            ssl: true, // optional. if false, then TLS is enabled. Its true by default in android. In iOS TLS/SSL is determined automatically, and this field doesn't affect anything
            username: "kike04arevalo@gmail.com",
            password: "",
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
     * Funcion encargada de crear un documento excel en el dispositivo para poder lo exportar
     */
    const exportData = () =>{
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
                //console.log(`wrote file ${pathToWrite}`);
                //alert('descargado correctamente');
                // wrote file /storage/emulated/0/Download/data.csv
            }) .catch(error => console.error(error));
    
            
        }
    }

    /**
     * Funcion encargada de poder enviar la informacion a DropBox
     */
    const sendData = () =>{

        const PATH_TO_THE_FILE = `${RNFetchBlob.fs.dirs.DownloadDir}/dataTransportista.csv`;

        /**El beare lo obtengo de dropbox donde he creado mi proyecto como desarrollador */
        const bearerTkn = ``;

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
            //console.log(res.text());
            alert('Archivo Subido Correctamente');
        })
        .catch((err) => {
            // error handling ..
            console.log('Error');
        });
    }

    /**
     * Funcion encargada de poder enviar la informacion a Google Drive
     */
    /**const sendDataDrive = async () =>{

        const CLIENT_ID = '';
        const CLIENT_SECRET = '';
        const REDIRECT_URL = '';

        GoogleSignin.configure({
            webClientId: '',
            scopes: ['']
        });

        const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL); 

        const tokens = await GoogleSignin.getTokens();
        await oauth2Client.setCredentials(tokens);

        const service = google.drive({ version: "v3", auth });

        const fileMetadata = {
            name: "Folder name",
            mimeType: "application/vnd.google-apps.folder",
        };

        const file = await service.files.create({
            resource: fileMetadata,
            fields: "id",
        });

        const jsonFileMetadata = {
            name: "file.json",
            parents: [file.data.id],
        };

        const media = {
                    mimeType: "application/json",
                    body: readable,
                };

        const jsonfile = await service.files.create({
                    resource: JSON_FILE,
                    media: media,
                    fields: "id",
                });
    }**/

    let table = <Table></Table>;
    let alert = <View></View>;

    if(listEmpleados.length > 0){

        let empleados   = [];
        let empleado    = [];
        let arrItem     = [];

        let cantidad = listEmpleados.length;

        let fechaSolicitudFormat = '';
        let idSolicitud = route.params.idSolicitud;

        for(let index = 0; index < cantidad;index++){

            let codigoEmpleado      = listEmpleados[index].CODIGO_EMPLEADO;
            let codigoRuta          = listEmpleados[index].CODIGO_RUTA;
            let fechaRegistro       = listEmpleados[index].FECHA_REGISTRO;
            let nombreTransportista = listEmpleados[index].NOMBRE_TRANSPORTISTA;
            let fechaSolFormat      = listEmpleados[index].FECHA_SOLICITUD_FORMAT;

            empleado.push(nombreTransportista);
            empleado.push(codigoRuta);
            empleado.push(codigoEmpleado);
            empleado.push(fechaRegistro);

            empleados.push(empleado);
            empleado = [];

            if(index == 0){
                fechaSolicitudFormat = fechaSolFormat;
            }

        }

        const thead = ['Transport', 'Ruta', 'Cod\nEmp', 'Fec\nReg'];
        const widthArr = [120, 80, 65, 100];
        
        table = 
        
            <ScrollView horizontal={true} >
                <View style={[styles.containerInner, styles.boxShadow]}>

                    <View style={styles.containerTextLabel}>
                        <Text style={[styles.textLabel, styles.textShadow]}>Marcaciones de Trabajadores</Text>
                        <Text style={[styles.textLabel, styles.textShadow]}>Solicitud #{idSolicitud}</Text>
                    </View>

                    <View style={styles.containerSendMail}>
                        <TouchableOpacity style={styles.containerBtn} onPress={() => exportDataFecha(fechaSolicitudFormat) }>
                            <View>
                                <Text style={[styles.btnText]}>
                                    <Icon name="paper-plane" size={13} color="#fff" solid />  Enviar Mail
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff', color: '#fff'}}>
                        <Row data={thead} style={styles.head} widthArr={widthArr} textStyle={[styles.textHead]}/>
                    </Table>

                    <ScrollView style={styles.dataWrapper}>
                        <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                            <Rows data={empleados} widthArr={widthArr} style={styles.tableBody}
                            textStyle={styles.tableBody} />
                        </Table>
                    </ScrollView>
                </View>
            </ScrollView>
            
        ;
    }else{

        const idSolicitud = route.params.idSolicitud;
        
        alert = 
                <View style={[styles.containerInner, styles.boxShadow]}>

                    <View style={[styles.alertDanger]}>
                        <Text style={styles.textDanger}>
                            <Icon name="exclamation-triangle" size={15} color="#fff" /> No existen trabajadores registrados
                        </Text>
                    </View>

                    <View style={styles.containerButtonBack}>
                        <TouchableOpacity
                            style={[styles.buttonBack, styles.boxShadow]}
                            onPress= {() => navigation.navigate('SolicitudDetalle', { idSolicitud: idSolicitud })}
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
            backgroundColor: '#78B7BB'
        ,   justifyContent: 'center'
        ,   borderRadius: 50
        ,   borderColor: '#24BEF9'
        ,   borderWidth: 1
        ,   width: '90%'
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
    
  });