import React, { useEffect, useCallback, useState } from 'react';
import { openDatabase, SQLiteDatabase} from "react-native-sqlite-storage";

const dataTransportista = [
    [1, 'Jose Maria', '0529891', 'P2678', 1],
    [2, 'Ernesto Marroquin', '098829', 'P2660', 2],
    [3, 'Egnio Flores', '0890993', 'P2567', 3],
];

const dataRutas = [
  [1, 'RSA-01', 'Santa Ana Centro'],
  [2, 'RSN-02', 'Santa Ana Norte'],
  [3, 'RAH-03', 'Ahuachapan'],
  [4, 'RCV-03', 'Santa Ana Unicaes - Calle Vieja'],
];

const dataTransportistaRuta = [
  [1, 1],
  [1, 2],
  [3, 4],
  [2, 2],
];

export const loadTransportista = (db) =>{

    dataTransportista.forEach((item, index ) => {

        const insertQuery = `
            INSERT INTO TRANSPORTISTA (ID_TRANSPORTISTA, NOMBRE, DUI, PLACA, ID_RUTA)
            VALUES (?, ?, ?, ?, ?)
        `

        db.transaction(txn =>{
          txn.executeSql(
              insertQuery,
              item,
              (sqlTxn, res) =>{
                  //console.log('Transportista agregado correctamente!' + item);
              },
              error =>{
                  console.log("Error agregando transportisa " + error.message);
                  console.log(item);
              }
          );
        });

    });

}

export const loadRutas = (db) =>{

  dataRutas.forEach((item, index ) => {

      const insertQuery = `
          INSERT INTO RUTA (ID_RUTA, CODIGO, DESCRIPCION)
          VALUES (?, ?, ?)
      `

      db.transaction(txn =>{
        txn.executeSql(
            insertQuery,
            item,
            (sqlTxn, res) =>{
                console.log('Ruta agregada correctamente!' + item);
            },
            error =>{
                console.log("Error agregando ruta " + error.message);
                console.log(item);
            }
        );
      });

  });

}

export const loadTransportistaRutas = (db) =>{

  dataTransportistaRuta.forEach((item, index ) => {

      const insertQuery = `
          INSERT INTO TRANSPORTISTA_RUTA (ID_TRANSPORTISTA, ID_RUTA)
          VALUES (?, ?)
      `

      db.transaction(txn =>{
        txn.executeSql(
            insertQuery,
            item,
            (sqlTxn, res) =>{
                console.log('Transportista_Ruta agregada correctamente!' + item);
            },
            error =>{
                console.log("Error agregando transportista_ruta " + error.message);
                console.log(item);
            }
        );
      });

  });

}

export const getAllTransportistas = (db, listTransportista, isLoading) =>{

    db.transaction(txn => {
        txn.executeSql(
          `SELECT * FROM TRANSPORTISTA`,
          [],
          (sqlTxn, res) => {
            //console.log("Transportistas obtenidos correctamente");

            let len = res.rows.length;
  
            if (len > 0) {
              let results = [];

              for (let i = 0; i < len; i++) {
                let item = res.rows.item(i);
                //console.log("Mi item::" ,item);
                results.push(item);
              }
  
              console.log(results);
              return results;
              //setListTransportista(results);
              //setIsLoading(false);
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

