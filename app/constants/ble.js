// app/constants/ble.js

export const BLE_SERVICES = {
    BATTERY_SERVICE: '0000180F-0000-1000-8000-00805f9b34fb', // Standard Battery Service UUID
    // Add other service UUIDs as needed
  };
  
  export const BLE_CHARACTERISTICS = {
    BATTERY_LEVEL: '00002A19-0000-1000-8000-00805f9b34fb', // Standard Battery Level Characteristic UUID
    NOTIFICATION_CHARACTERISTIC_1: '0000yyyy-0000-1000-8000-00805f9b34fb',
    NOTIFICATION_CHARACTERISTIC_2: '0000zzzz-0000-1000-8000-00805f9b34fb',
    // Add more characteristic UUIDs as needed
  };
  
  // If you have multiple notification characteristics, list them in an array
  export const BLE_NOTIFICATION_CHARACTERISTICS = [
    BLE_CHARACTERISTICS.NOTIFICATION_CHARACTERISTIC_1,
    BLE_CHARACTERISTICS.NOTIFICATION_CHARACTERISTIC_2,
    // Add more as needed
  ];
  