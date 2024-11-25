// app/components/AddDeviceModal.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBLE } from '../services/bleServices';

export default function AddDeviceModal({ onClose }) {
  const {
    scanForDevices,
    availableDevices,
    connectToDevice,
    isScanning,
    connectedDevices,
  } = useBLE();

  const [connectingDeviceId, setConnectingDeviceId] = useState(null);

  useEffect(() => {
    scanForDevices();

    return () => {
      // Cleanup if needed when the modal is closed
    };
  }, []);

  const handleConnect = async (device) => {
    setConnectingDeviceId(device.id);
    const success = await connectToDevice(device.id);
    setConnectingDeviceId(null);
    if (success) {
      Alert.alert(
        'Connected',
        `Successfully connected to ${device.name || 'Unnamed Device'}`
      );
      onClose();
    } else {
      Alert.alert(
        'Connection Failed',
        `Failed to connect to ${device.name || 'Unnamed Device'}`
      );
    }
  };

  const renderItem = ({ item }) => {
    const isAlreadyConnected = connectedDevices.some((dev) => dev.id === item.id);
    return (
      <TouchableOpacity
        style={styles.deviceItem}
        onPress={() => handleConnect(item)}
        disabled={isAlreadyConnected || connectingDeviceId === item.id}
      >
        <View style={styles.deviceInfo}>
          <MaterialCommunityIcons name="bluetooth" size={24} color="#4682B4" />
          <Text style={styles.deviceName}>{item.name || 'Unnamed Device'}</Text>
        </View>
        {isAlreadyConnected ? (
          <Text style={styles.connectedText}>Connected</Text>
        ) : connectingDeviceId === item.id ? (
          <ActivityIndicator size="small" color="#4682B4" />
        ) : (
          <Text style={styles.connectText}>Connect</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Connect to a Device</Text>
        {isScanning ? (
          <ActivityIndicator size="large" color="#4682B4" />
        ) : availableDevices.length === 0 ? (
          <Text style={styles.noDevicesText}>No devices found.</Text>
        ) : (
          <FlatList
            data={availableDevices}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        )}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialCommunityIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5, // For Android
    shadowColor: '#000', // For iOS
    shadowOffset: { width: 0, height: 2 }, // For iOS
    shadowOpacity: 0.25, // For iOS
    shadowRadius: 3.84, // For iOS
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceName: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  connectText: {
    color: '#4682B4',
    fontWeight: 'bold',
  },
  connectedText: {
    color: '#32CD32',
    fontWeight: 'bold',
  },
  noDevicesText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 20,
  },
  closeButton: {
    backgroundColor: '#4682B4',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 20,
  },
});
