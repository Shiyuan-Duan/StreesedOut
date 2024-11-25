// app/components/DeviceCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBLE } from '../services/bleServices';

export default function DeviceCard({ device }) {
  const { disconnectDevice } = useBLE(); // Access BLE actions

  const handleDisconnect = async () => {
    const success = await disconnectDevice(device.id);
    if (success) {
      Alert.alert('Disconnected', `Successfully disconnected from ${device.name || 'Unnamed Device'}`);
    } else {
      Alert.alert('Disconnection Failed', `Failed to disconnect from ${device.name || 'Unnamed Device'}`);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.infoContainer}>
        <MaterialCommunityIcons name="bluetooth" size={24} color="#4682B4" />
        <Text style={styles.deviceName}>{device.name || 'Unnamed Device'}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Battery: {device.batteryLevel || 'N/A'}%</Text>
        <Text style={styles.detailText}>Unsynced Data: {device.unsyncedData || '0 MB'}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.recordButton} onPress={() => Alert.alert('Recording', 'Start Recording functionality to be implemented.')}>
          <Text style={styles.recordButtonText}>Start Recording</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
          <Text style={styles.disconnectButtonText}>Disconnect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 3, // For Android
    shadowColor: '#000', // For iOS
    shadowOffset: { width: 0, height: 2 }, // For iOS
    shadowOpacity: 0.25, // For iOS
    shadowRadius: 3.84, // For iOS
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceName: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordButton: {
    backgroundColor: '#32CD32',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disconnectButton: {
    backgroundColor: '#FF4500',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  disconnectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
