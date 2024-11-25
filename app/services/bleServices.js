// app/services/bleServices.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { EventEmitter } from 'events';
import { BLE_CHARACTERISTICS } from './ble_characteristics'; // Ensure correct characteristic UUIDs

const BLEContext = createContext();

const BLEServiceUUID = 'A0A43180-96BE-4222-B41E-98EA76B0120C'.toLowerCase();
class BLEService {
  constructor() {
    if (!BLEService.instance) {
      this.manager = new BleManager();
      this.emitter = new EventEmitter();
      this.connectedDevices = [];
      this.availableDevices = [];
      this.isScanning = false;
      this.isDisconnecting = false;
      BLEService.instance = this;

      // Monitor BleManager state changes
      this.manager.onStateChange((state) => {
        console.log('BleManager State:', state);
        if (state === 'PoweredOn') {
          // Ready to scan or perform other operations
        } else {
          // Handle other states (e.g., PoweredOff)
          Alert.alert('Bluetooth Off', 'Please turn on Bluetooth to use this feature.');
        }
      }, true);
    }
    return BLEService.instance;
  }

  // Request necessary permissions
  async requestPermissions() {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      const allGranted = permissions.every(
        (perm) => granted[perm] === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        Alert.alert('Permissions Required', 'Bluetooth permissions are required to use this feature.');
        return false;
      }
    }
    // iOS permissions are handled by react-native-ble-plx
    return true;
  }

  // Start scanning for devices
  async scanForDevices() {
    const permission = await this.requestPermissions();

    if (!permission) return;

    this.availableDevices = [];
    this.isScanning = true;
    console.log('Starting device scan...');

    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('Scan Error:', error);
        Alert.alert('Scan Error', error.message);
        this.isScanning = false;
        this.manager.stopDeviceScan();
        return;
      }

      // Log all discovered devices
      // console.log('Discovered Device:', device);
      // console.log("This line is now printed!");

      // Include all devices, regardless of name
      if (device) {
        const exists = this.availableDevices.find((d) => d.id === device.id);
        if (!exists) {
          this.availableDevices.push(device);
          this.emitter.emit('deviceDiscovered', device);
        }
      }
    });

    // Stop scanning after 10 seconds
    setTimeout(() => {
      this.manager.stopDeviceScan();
      this.isScanning = false;
      console.log('Stopped scanning');
    }, 10000);
  }

  // Connect to a device
  async connectToDevice(deviceId) {
    try {
      console.log(`Connecting to device: ${deviceId}`);
      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      const batteryLevel = await this.readBatteryLevel(device);
      const unsyncedData = 0; // Dummy data

      const deviceInfo = {
        id: device.id,
        name: device.name,
        batteryLevel,
        unsyncedData,
      };

      this.connectedDevices.push(deviceInfo);
      console.log(`Connected to device: ${device.name || 'Unnamed Device'}`);

      return true;
    } catch (error) {
      console.error('Connection Error:', error);
      Alert.alert('Connection Error', `Failed to connect to device ${deviceId}: ${error.message}`);
      return false;
    }
  }

  // Disconnect from a device
  async disconnectDevice(deviceId) {
    if (this.isDisconnecting) {
      console.log('Already disconnecting.');
      return false;
    }
    this.isDisconnecting = true;
    try {
      console.log(`Disconnecting device: ${deviceId}`);
      await this.manager.cancelDeviceConnection(deviceId);
      this.connectedDevices = this.connectedDevices.filter((dev) => dev.id !== deviceId);
      console.log(`Disconnected from device: ${deviceId}`);
      console.log('Updated Connected Devices:', this.connectedDevices);
      this.isDisconnecting = false;
      return true;
    } catch (error) {
      console.error('Disconnection Error Details:', error);
      Alert.alert('Disconnection Error', `Failed to disconnect from device ${deviceId}: ${error.message}`);
      this.isDisconnecting = false;
      return false;
    }
  }

  // Read Battery Level
  async readBatteryLevel(device) {
    try {
      const services = await device.services();
      const batteryService = services.find(
        (service) => service.uuid.toLowerCase() === BLEServiceUUID
      );
      console.log('Battery Service:', batteryService);
      if (!batteryService) {
        console.log('Battery Service not found');
        return 'N/A';
      }

      const characteristics = await batteryService.characteristics();
      const batteryCharacteristic = characteristics.find(
        (char) => char.uuid.toLowerCase() === BLE_CHARACTERISTICS.battery
      );

      if (!batteryCharacteristic) {
        console.log('Battery Characteristic not found');
        return 'N/A';
      }

      const batteryData = await batteryCharacteristic.read();
      // Decode base64 to binary
      const batteryBytes = Buffer.from(batteryData.value, 'base64');
      const batteryLevel = batteryBytes.readUInt8(0); // Battery Level is a single byte
      console.log(`Battery Level: ${batteryLevel}%`);
      return batteryLevel;
    } catch (error) {
      console.error('Battery Level Read Error:', error);
      return 'N/A';
    }
  }

  // Subscribe to Notifications
  subscribeToNotifications(deviceId, characteristicUUID, onData) {
    this.manager.monitorCharacteristicForDevice(
      deviceId,
      characteristicUUID,
      (error, characteristic) => {
        if (error) {
          console.error('Notification Error:', error);
          return;
        }
        if (characteristic?.value) {
          const data = Buffer.from(characteristic.value, 'base64').toString('ascii');
          onData(data);
        }
      }
    );
  }

  // Start Recording (Dummy Implementation)
  startRecording(deviceId) {
    Alert.alert('Recording Started', `Recording started for device ID: ${deviceId}`);
    // Implement actual recording logic as needed
  }

  // Destroy BleManager instance
  destroy() {
    this.manager.destroy();
    BLEService.instance = null;
  }
}

const instance = new BLEService();
Object.freeze(instance);

export const BLEProvider = ({ children }) => {
  const [availableDevices, setAvailableDevices] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Listen to 'deviceDiscovered' events
    const onDeviceDiscovered = (device) => {
      setAvailableDevices((prevDevices) => {
        const exists = prevDevices.find((d) => d.id === device.id);
        if (!exists) {
          return [...prevDevices, device];
        }
        return prevDevices;
      });
    };

    instance.emitter.on('deviceDiscovered', onDeviceDiscovered);

    return () => {
      instance.emitter.off('deviceDiscovered', onDeviceDiscovered);
      instance.destroy(); // Ensure BleManager is destroyed when provider unmounts
    };
  }, []);

  useEffect(() => {
    // Update connectedDevices state whenever instance.connectedDevices changes
    setConnectedDevices([...instance.connectedDevices]);
  }, [instance.connectedDevices]);

  return (
    <BLEContext.Provider
      value={{
        scanForDevices: async () => {
          await instance.scanForDevices();
          setIsScanning(instance.isScanning);
        },
        availableDevices,
        connectToDevice: async (deviceId) => {
          const success = await instance.connectToDevice(deviceId);
          if (success) {
            setConnectedDevices([...instance.connectedDevices]);
          }
          return success;
        },
        disconnectDevice: async (deviceId) => {
          const success = await instance.disconnectDevice(deviceId);
          if (success) {
            setConnectedDevices([...instance.connectedDevices]);
          }
          return success;
        },
        isScanning,
        connectedDevices,
        startRecording: (deviceId) => instance.startRecording(deviceId),
        subscribeToNotifications: (deviceId, characteristicUUID, onData) =>
          instance.subscribeToNotifications(deviceId, characteristicUUID, onData),
      }}
    >
      {children}
    </BLEContext.Provider>
  );
};

export const useBLE = () => {
  return useContext(BLEContext);
};
