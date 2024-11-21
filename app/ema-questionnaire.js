import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function EMAQuestionnaireScreen() {
  const [responses, setResponses] = useState({
    stressLevel: null,
    mood: null,
    energy: null,
    independence: null,
  });

  const questions = [
    {
      key: 'stressLevel',
      question: 'How stressed are you feeling today?',
      icons: [
        { level: 0, icon: 'emoticon-excited-outline', color: '#4CAF50' },
        { level: 1, icon: 'emoticon-happy-outline', color: '#8BC34A' },
        { level: 2, icon: 'emoticon-neutral-outline', color: '#FFEB3B' },
        { level: 3, icon: 'emoticon-sad-outline', color: '#FFC107' },
        { level: 4, icon: 'emoticon-dead-outline', color: '#FF9800' },
        { level: 5, icon: 'emoticon-angry-outline', color: '#F44336' },
      ],
    },
    {
      key: 'mood',
      question: 'How do you feel today? (Sad to Cheerful)',
      icons: [
        { level: 0, icon: 'emoticon-cry-outline', color: '#2196F3' },
        { level: 1, icon: 'emoticon-frown-outline', color: '#42A5F5' },
        { level: 2, icon: 'emoticon-neutral-outline', color: '#64B5F6' },
        { level: 3, icon: 'emoticon-happy-outline', color: '#90CAF9' },
        { level: 4, icon: 'emoticon-excited-outline', color: '#BBDEFB' },
        { level: 5, icon: 'emoticon-cool-outline', color: '#E3F2FD' },
      ],
    },
    {
      key: 'energy',
      question: 'How energetic do you feel? (Quiet to Active)',
      icons: [
        { level: 0, icon: 'weather-night', color: '#9C27B0' },
        { level: 1, icon: 'weather-sunset-down', color: '#AB47BC' },
        { level: 2, icon: 'weather-cloudy', color: '#BA68C8' },
        { level: 3, icon: 'weather-sunset', color: '#CE93D8' },
        { level: 4, icon: 'weather-sunny', color: '#E1BEE7' },
        { level: 5, icon: 'white-balance-sunny', color: '#F3E5F5' },
      ],
    },
    {
      key: 'independence',
      question: 'How independent do you feel? (Dependent to Independent)',
      icons: [
        { level: 0, icon: 'account-child-outline', color: '#FF5722' },
        { level: 1, icon: 'account-supervisor-outline', color: '#FF7043' },
        { level: 2, icon: 'account-outline', color: '#FF8A65' },
        { level: 3, icon: 'account', color: '#FFAB91' },
        { level: 4, icon: 'account-star-outline', color: '#FFCCBC' },
        { level: 5, icon: 'account-tie-outline', color: '#FBE9E7' },
      ],
    },
  ];

  const handleRatingPress = (questionKey, rating) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [questionKey]: rating,
    }));
  };

  const handleSubmit = async () => {
    const data = {
      paradigm: 'EMAQuestion',
      ambulatoryUUID: 'dummy',
      time: new Date().toISOString(),
      responses,
    };
    console.log(data)

    try {
      const response = await fetch('http://localhost:3000/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Handle successful response
        console.log('Data submitted successfully');
        Alert.alert('Success', 'Your responses have been submitted.');
      } else {
        // Handle error response
        console.error('Error submitting data');
        Alert.alert('Error', 'There was a problem submitting your responses.');
      }
    } catch (error) {
      console.error('Network error:', error);
      Alert.alert('Error', 'Network error occurred while submitting your responses.');
    }
  };

  const isFormComplete = Object.values(responses).every((value) => value !== null);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {questions.map((question) => (
          <View key={question.key} style={styles.questionContainer}>
            <Text style={styles.title}>{question.question}</Text>
            <View style={styles.ratingContainer}>
              {question.icons.map((item) => (
                <TouchableOpacity
                  key={item.level}
                  style={styles.iconContainer}
                  onPress={() => handleRatingPress(question.key, item.level)}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={50}
                    color={responses[question.key] === item.level ? item.color : '#d3d3d3'}
                  />
                  <Text style={styles.ratingLabel}>{item.level}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, !isFormComplete && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={!isFormComplete}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    paddingVertical: 20,
    alignItems: 'center', // Center horizontally
    paddingHorizontal: 20,
  },
  // Question container
  questionContainer: {
    marginBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  // Text styles
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Rating styles
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: SCREEN_WIDTH * 0.9,
  },
  iconContainer: {
    alignItems: 'center',
  },
  ratingLabel: {
    marginTop: 5,
    fontSize: 14,
    color: '#333',
  },
  // Submit button styles
  submitButton: {
    backgroundColor: '#4682B4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: '#A9A9A9', // Gray color to indicate disabled state
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
