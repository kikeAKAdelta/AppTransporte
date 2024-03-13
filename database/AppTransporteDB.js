import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";

/**Creamos  */
export const connectToDatabase = async () =>{
    return openDatabase(
        {name: 'AppTransporteDB.db', location: 'default'},
        () => { console.log('Conexion a la Base de Datos Exitosa');},
        (error) =>{
            console.error(error);
            throw Error("Error conexion a Base de Datos Local");
        }
    );
}

/**Crearemos las tablas de Sistema */
export const createTables = async(db) =>{

    const createTableTransportista = `
        CREATE TABLE IF NOT EXISTS TRANSPORTISTA(
            ID_TRANSPORTISTA INTEGER PRIMARY KEY AUTOINCREMENT,
            NOMBRE TEXT(150),
            DUI TEXT(10),
            PLACA TEXT(10),
            ID_RUTA INTEGER
        )
    `;

    const createTableRuta = `
        CREATE TABLE IF NOT EXISTS RUTA(
            ID_RUTA INTEGER PRIMARY KEY AUTOINCREMENT,
            CODIGO TEXT(150),
            DESCRIPCION TEXT(150)
        )
    `;

    const createTableRegistroEmpleado = `
        CREATE TABLE IF NOT EXISTS TRANSPORTE_DETALLE(
            ID_TRANSPORT INTEGER PRIMARY KEY AUTOINCREMENT,
            ID_TRANSPORTISTA TEXT(150),
            NOMBRE_TRANSPORTISTA TEXT(150)
            PLACA TEXT(150),
            CODIGO_EMPLEADO TEXT(6),
            FECHA_REGISTRO
        )
    `;

    try{
        await db.executeSql(createTableRuta);
        await db.executeSql(createTableTransportista);
        await db.executeSql(createTableRegistroEmpleado);
        console.log('Tablas creadas correctamente!');
    }catch(error){
        console.log(error);
        throw Error(`Error en la creacion de tablas del Sistema!!`);
    }

}