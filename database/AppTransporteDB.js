import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";

/**Creamos  */
export const connectToDatabase =  () =>{

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
export const createTables = (db) =>{

    const createTableTransportista = `
            CREATE TABLE IF NOT EXISTS TRANSPORTISTA(
                ID_TRANSPORTISTA INTEGER PRIMARY KEY AUTOINCREMENT,
                NOMBRE VARCHAR(150),
                DUI VARCHAR(10),
                PLACA VARCHAR(10),
                ID_RUTA INTEGER
            )
    `;

    /**const createTableTransportista = `
        DROP TABLE TRANSPORTISTA
    `;**/

    db.transaction(txn =>{
        txn.executeSql(
            createTableTransportista,
            [],
            (sqlTxn, res) =>{
                console.log('Tabla Transportista creada correctamente!');
            },
            error =>{
                console.log("Error creando tabla transportisa " + error.message);
            }
        );
    });

    const createTableRuta = `
        CREATE TABLE IF NOT EXISTS RUTA(
            ID_RUTA INTEGER PRIMARY KEY AUTOINCREMENT,
            CODIGO TEXT(150),
            DESCRIPCION TEXT(150)
        )
    `;

    db.transaction(txn =>{
        txn.executeSql(
            createTableRuta,
            [],
            (sqlTxn, res) =>{
                console.log('Tabla Ruta creada correctamente!');
            },
            error =>{
                console.log("Error creando tabla Ruta " + error.message);
            }
        );
    });

    const createTableTransporteDetalle = `
        CREATE TABLE IF NOT EXISTS TRANSPORTE_DETALLE(
            ID_TRANSPORT INTEGER PRIMARY KEY AUTOINCREMENT,
            ID_TRANSPORTISTA TEXT(20),
            ID_RUTA TEXT(50),
            NOMBRE_TRANSPORTISTA TEXT(150),
            PLACA TEXT(150),
            CODIGO_EMPLEADO TEXT(6),
            FECHA_REGISTRO DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    /**const createTableTransporteDetalle = `
        DROP TABLE TRANSPORTE_DETALLE;
    `;**/

    db.transaction(txn =>{
        txn.executeSql(
            createTableTransporteDetalle,
            [],
            (sqlTxn, res) =>{
                console.log('Tabla Transporte Detalle creada correctamente!');
            },
            error =>{
                console.log("Error creando tabla Transporte Detalle " + error.message);
            }
        );
    });

    const createTableTransportistaRuta = `
                    CREATE TABLE IF NOT EXISTS TRANSPORTISTA_RUTA(
                        ID_TRANSPORTISTA INTEGER,
                        ID_RUTA INTEGER,
                        FOREIGN KEY (ID_TRANSPORTISTA)
                        REFERENCES  TRANSPORTISTA(ID_TRANSPORTISTA),
                        FOREIGN KEY (ID_RUTA)
                        REFERENCES  RUTA(ID_RUTA),
                        PRIMARY KEY (ID_TRANSPORTISTA, ID_RUTA)
                    )
    `;

    /**const createTableTransportistaRuta = `
        DROP TABLE TRANSPORTISTA_RUTA;
    `;**/

    db.transaction(txn =>{
        txn.executeSql(
            createTableTransportistaRuta,
            [],
            (sqlTxn, res) =>{
                console.log('Tabla Transportista_Ruta creada correctamente!');
            },
            error =>{
                console.log("Error creando tabla transportista ruta " + error.message);
            }
        );
    });

}