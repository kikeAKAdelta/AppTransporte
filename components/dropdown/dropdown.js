import React, { useState } from 'react';
import type {Node} from 'react';
import RNPickerSelect from 'react-native-picker-select';

import {
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';

export const DropDownTransportista = ({listTransportista}) =>{

    console.log(`Datos pasados ` + listTransportista);

    const [selectedValue, setSelectedValue ] = useState(null);

    const placeholder = {
        label: '[ SELECCIONE ]',
        value: null
    }

    const options = [
        { label: 'Juan Garcia', value: 'jgarcia' },
        { label: 'Mario Zetino', value: 'mzetino' },
        { label: 'Sofia Alvarenga', value: 'salvarenga' },
    ];

    return (
        <View>
            <Text>Seleccione Transportista:</Text>
            <RNPickerSelect
                placeholder={placeholder}
                items={options}
                value={selectedValue}
                onValueChange={(value) => setSelectedValue(value)}
            />
            {selectedValue && <Text>Selected: {selectedValue}</Text>}
        </View>
    );
}