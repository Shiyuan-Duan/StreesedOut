// app/(tabs)/devices.tsx
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, Modal, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DeviceCard from '../components/DeviceCard';
import AddDeviceModal from '../components/AddDeviceModal';
import { useBLE } from '../services/bleServices';

export default function DevicesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const { connectedDevices } = useBLE(); // Custom hook to manage BLE devices

  const handleAddDevice = () => {
    setModalVisible(true);
  };

  // Append an "Add Device" placeholder to the connected devices list
  const dataWithAddPlaceholder = [
    ...connectedDevices,
    { id: 'add_placeholder', isAddPlaceholder: true },
  ];

  const renderItem = ({ item }) => {
    if (item.isAddPlaceholder) {
      return (
        <TouchableOpacity style={styles.addCard} onPress={handleAddDevice}>
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
          <Text style={styles.addCardText}>Add Device</Text>
        </TouchableOpacity>
      );
    } else {
      return <DeviceCard device={item} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Device List with Add Device Placeholder */}
      <FlatList
        data={dataWithAddPlaceholder}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />

      {/* Add Device Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <AddDeviceModal onClose={() => setModalVisible(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  listContainer: {
    paddingBottom: 20, // Ensure content is not hidden behind the tab bar
  },
  addCard: {
    backgroundColor: '#4682B4',
    paddingVertical: 20,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  addCardText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
