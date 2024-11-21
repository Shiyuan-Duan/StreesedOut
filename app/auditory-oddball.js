import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AuditoryOddballScreen() {
  const [step, setStep] = useState('introduction'); // 'introduction', 'task', 'questionnaire', 'completion'
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isPlaying, setIsPlaying] = useState(false);
  const [responseCount, setResponseCount] = useState(0);
  const [responses, setResponses] = useState({
    stressLevel: null,
  });

  const standardTone = useRef(new Audio.Sound());
  const deviantTone = useRef(new Audio.Sound());
  const toneIntervalRef = useRef(null);
  const timerRef = useRef(null);

  // Load the audio files
  useEffect(() => {
    const loadSounds = async () => {
      try {
        await standardTone.current.loadAsync(require('../assets/1000.wav'));
        await deviantTone.current.loadAsync(require('../assets/1500.wav'));
      } catch (error) {
        console.error('Error loading sounds:', error);
      }
    };

    loadSounds();

    // Unload sounds on unmount
    return () => {
      standardTone.current.unloadAsync();
      deviantTone.current.unloadAsync();
    };
  }, []);

  // Start the task timer
  useEffect(() => {
    if (step === 'task') {
      setIsPlaying(true);

      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            clearInterval(toneIntervalRef.current);
            setIsPlaying(false);
            setStep('questionnaire');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      // Play tones at intervals
      toneIntervalRef.current = setInterval(() => {
        playTone();
      }, 2000); // Play a tone every 2 seconds

      // Cleanup on unmount
      return () => {
        clearInterval(timerRef.current);
        clearInterval(toneIntervalRef.current);
      };
    }
  }, [step]);

  const playTone = async () => {
    // Randomly decide whether to play standard or deviant tone
    const isDeviant = Math.random() < 0.2; // 20% probability
    try {
      // Stop any currently playing sounds
      await standardTone.current.stopAsync().catch(() => {});
      await deviantTone.current.stopAsync().catch(() => {});

      if (isDeviant) {
        await deviantTone.current.replayAsync();
      } else {
        await standardTone.current.replayAsync();
      }
    } catch (error) {
      console.error('Error playing tone:', error);
    }
  };

  const handleUserResponse = () => {
    // Increment response count
    setResponseCount((prevCount) => prevCount + 1);
    // Provide feedback (optional)
    Alert.alert('Response Recorded', 'You pressed the button.');
  };

  const handleSubmit = async () => {
    const data = {
      paradigm: 'AuditoryOddball',
      ambulatoryUUID: 'dummy',
      time: new Date().toISOString(),
      responses,
      responseCount,
    };

    try {
      const response = await fetch('http://localhost:3000/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Data submitted successfully');
        Alert.alert('Success', 'Your responses have been submitted.');
        setStep('completion');
      } else {
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
      {step === 'introduction' && (
        <View style={styles.content}>
          <Text style={styles.title}>Auditory Oddball Task</Text>
          <Text style={styles.description}>
            In this task, you'll hear a series of tones. Press the button whenever you hear the higher-pitched tone.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => setStep('task')}>
            <Text style={styles.buttonText}>Start Task</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'task' && (
        <View style={styles.content}>
          <Text style={styles.title}>Listen Carefully</Text>
          <Text style={styles.description}>
            Press the button below whenever you hear the deviant tone.
          </Text>
          <Text style={styles.timer}>
            Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </Text>
          <TouchableOpacity style={styles.responseButton} onPress={handleUserResponse}>
            <Text style={styles.responseButtonText}>Press when you hear the deviant tone</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'questionnaire' && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Self-Report Questionnaire</Text>
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>How stressed do you feel now?</Text>
            <RatingScale
              questionKey="stressLevel"
              response={responses.stressLevel}
              onPress={(key, rating) => {
                setResponses((prev) => ({ ...prev, [key]: rating }));
              }}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, !isFormComplete && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={!isFormComplete}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 'completion' && (
        <View style={styles.content}>
          <Text style={styles.title}>Thank You!</Text>
          <Text style={styles.description}>
            Your responses have been recorded. We appreciate your participation.
          </Text>
        </View>
      )}
    </View>
  );
}

// RatingScale Component
function RatingScale({ questionKey, response, onPress }) {
  const stressLevels = [
    { level: 0, icon: 'emoticon-sad-outline', color: '#F44336' },
    { level: 1, icon: 'emoticon-neutral-outline', color: '#FF9800' },
    { level: 2, icon: 'emoticon-happy-outline', color: '#FFEB3B' },
    { level: 3, icon: 'emoticon-excited-outline', color: '#8BC34A' },
    { level: 4, icon: 'emoticon-cool-outline', color: '#4CAF50' },
  ];

  return (
    <View style={styles.ratingContainer}>
      {stressLevels.map((item) => (
        <TouchableOpacity
          key={item.level}
          style={styles.iconContainer}
          onPress={() => onPress(questionKey, item.level)}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={50}
            color={response === item.level ? item.color : '#d3d3d3'}
          />
          <Text style={styles.ratingLabel}>{item.level}</Text>
        </TouchableOpacity>
      ))}
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
      flex: 1,
      paddingVertical: 20,
      alignItems: 'center', // Center horizontally
      paddingHorizontal: 20,
      paddingTop:50,
    //   justifyContent: 'center', // Center vertically
    },
    // Text styles
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center',
      marginBottom: 20,
    },
    description: {
      fontSize: 18,
      color: '#555',
      textAlign: 'center',
      marginBottom: 30,
    },
    timer: {
      fontSize: 18,
      color: '#777',
      textAlign: 'center',
      marginBottom: 20,
    },
    // Button styles
    button: {
      backgroundColor: '#4682B4',
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 5,
      marginTop: 30,
    },
    buttonText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
    },
    responseButton: {
      backgroundColor: '#FF9800',
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginTop: 20,
    },
    responseButtonText: {
      color: '#fff',
      fontSize: 18,
      textAlign: 'center',
    },
    // Questionnaire styles
    questionContainer: {
      marginBottom: 40,
      width: '100%',
      alignItems: 'center',
    },
    questionText: {
      fontSize: 20,
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
  