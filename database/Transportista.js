import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";

const dataTransportista = [
    [1, 'Jose Maria', '0529891', 'P2678', 1],
    [2, 'Ernesto Marroquin', '098829', 'P2660', 2],
    [3, 'Egnio Flores', '0890993', 'P2567', 3],
];

export const loadTransportista = async (db) =>{

    dataTransportista.forEach((item, index ) => {

        const insertQuery = `
            INSERT INTO TRANSPORTISTA (ID_TRANSPORTISTA, NOMBRE, DUI, PLACA, ID_RUTA)
            VALUES (?, ?, ?, ?, ?)
        `

        const arrResult = Object.values(item);

        console.log(arrResult);

        try {
            const result = db.executeSql(insertQuery, arrResult)
            console.log('Registro agregado '  + result);
        } catch (error) {
            console.error(error)
            throw Error("Failed to add contact")
        }

    });

}


export const getAllTransportistas = async(db) =>{

    db.transaction(txn => {
        txn.executeSql(
          `SELECT * FROM transportista`,
          [],
          (sqlTxn, res) => {
            console.log("categoria obtenida correctamente");
            let len = res.rows.length;
  
            if (len > 0) {
              let results = [];
              for (let i = 0; i < len; i++) {
                let item = res.rows.item(i);
                results.push({ id: item.id, name: item.name });
              }
  
              console.log(results);
            }else{
                console.log('No se obtuvo');
            }
          },
          error => {
            console.log("error on getting categories " + error.message);
          },
        );
      });
}

