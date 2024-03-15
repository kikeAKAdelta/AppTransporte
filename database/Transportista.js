import React, { useEffect, useCallback, useState } from 'react';
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

        db.transaction(txn =>{
          txn.executeSql(
              insertQuery,
              item,
              (sqlTxn, res) =>{
                  console.log('Transportista agregado correctamente!' + item);
              },
              error =>{
                  console.log("Error agregando transportisa " + error.message);
                  console.log(item);
              }
          );
        });

    });

}


export const getAllTransportistas = async(db, listTransportista, isLoading) =>{

    db.transaction(txn => {
        txn.executeSql(
          `SELECT * FROM TRANSPORTISTA`,
          [],
          (sqlTxn, res) => {
            console.log("Transportistas obtenidos correctamente");

            let len = res.rows.length;
  
            if (len > 0) {
              let results = [];

              for (let i = 0; i < len; i++) {
                let item = res.rows.item(i);
                //console.log("Mi item::" ,item);
                results.push(item);
              }
  
              //console.log('Mis resultados en foreach: ' + results);
              //return results;
              setListTransportista(results);
              setIsLoading(false);
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

