import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

// List of selections remains the same
const selections = [
  { id: '1', title: 'MIST question', route: 'mist-question' },
  { id: '2', title: 'Fear conditioning', route: 'fear-conditioning' },
  { id: '3', title: 'Mental relaxation', route: 'mental-relaxation' },
  { id: '4', title: 'Motor imagery', route: 'motor-imagery' },
  { id: '5', title: 'Auditory oddball', route: 'auditory-oddball' },
  { id: '6', title: 'EMA', route: 'ema-questionnaire'},
];

export default function ParadigmSelectionScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.listContainer}>
        {selections.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.selectionButton}
            onPress={() => router.push(item.route)} // Navigate to the appropriate route
          >
            <Text style={styles.selectionText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// Styles remain the same as updated earlier
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d3d3d3',
    paddingTop:50,
    paddingBottom:70,
  },
  listContainer: {
    paddingVertical: 20,
  },
  selectionButton: {
    height: SCREEN_HEIGHT / 7,
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: '#4682B4',
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    alignSelf: 'center', // Center the buttons horizontally
  },
  selectionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});
