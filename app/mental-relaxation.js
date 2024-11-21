import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MentalRelaxationScreen() {
  const [step, setStep] = useState('introduction'); // 'introduction', 'meditation', 'questionnaire', 'completed'
  const [meditationTimeLeft, setMeditationTimeLeft] = useState(600); // 10 minutes in seconds
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [responses, setResponses] = useState({
    stressLevel: null,
    relaxationLevel: null,
  });
  const [progress, setProgress] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  const instructions = [
    { time: 0, text: 'Welcome to the guided meditation session.' },
    { time: 10, text: 'Find a comfortable seated position and close your eyes for 20 seconds. Then open your eyes' },
    { time: 30, text: 'Take a deep breath in... and out.' },
    { time: 60, text: 'Focus on your breathing, feeling the air enter and leave your body.' },
    { time: 90, text: 'Gently tense and relax your muscles starting from your toes to your head.' },
    { time: 180, text: 'Visualize a calming scene, like a peaceful beach or a quiet forest.' },
    { time: 300, text: 'Continue to breathe deeply and let go of any tension.' },
    { time: 480, text: 'You are relaxed and at peace.' },
    { time: 540, text: 'Begin to bring your awareness back to the present moment.' },
    { time: 570, text: 'Gently wiggle your fingers and toes.' },
    { time: 590, text: 'When you are ready, slowly open your eyes.' },
    { time: 600, text: 'Meditation complete. Thank you for participating.' },
  ];

  useEffect(() => {
    if (step === 'meditation') {
      const timer = setInterval(() => {
        setMeditationTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setStep('questionnaire');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'meditation') {
      // Update the current instruction based on the time elapsed
      const elapsed = 600 - meditationTimeLeft;
      const nextInstructionIndex = instructions.findIndex(
        (instruction, index) =>
          elapsed >= instruction.time &&
          (instructions[index + 1] ? elapsed < instructions[index + 1].time : true)
      );
      setCurrentInstructionIndex(nextInstructionIndex);

      // Update progress bar
      Animated.timing(progress, {
        toValue: (elapsed / 600) * 100,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [meditationTimeLeft]);

  const handleStartMeditation = () => {
    setStep('meditation');
  };

  const handleResponseChange = (key, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    const data = {
      paradigm: 'MentalRelaxation',
      ambulatoryUUID: 'dummy',
      time: new Date().toISOString(),
      responses,
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
        // Handle successful response
        console.log('Data submitted successfully');
        Alert.alert('Success', 'Your responses have been submitted.');
        setStep('completed');
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
      {step === 'introduction' && (
        <View style={styles.content}>
          <Text style={styles.title}>Guided Meditation</Text>
          <Text style={styles.instructionText}>
            This meditation will guide you through relaxation techniques over the next 10 minutes.
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStartMeditation}>
            <Text style={styles.startButtonText}>Start Meditation</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'meditation' && (
        <View style={styles.content}>
          <Text style={styles.instructionText}>
            {instructions[currentInstructionIndex]?.text}
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  { width: progress.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) },
                ]}
              />
            </View>
            <Text style={styles.timeLeftText}>
              Time Left: {Math.floor(meditationTimeLeft / 60)}:
              {String(meditationTimeLeft % 60).padStart(2, '0')}
            </Text>
          </View>
        </View>
      )}

      {step === 'questionnaire' && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Post-Meditation Questionnaire</Text>
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>How stressed do you feel right now?</Text>
            <View style={styles.ratingContainer}>
              {[0, 1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={styles.ratingCircle}
                  onPress={() => handleResponseChange('stressLevel', value)}
                >
                  <Text
                    style={[
                      styles.ratingNumber,
                      responses.stressLevel === value && styles.selectedRating,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>How relaxed do you feel right now?</Text>
            <View style={styles.ratingContainer}>
              {[0, 1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={styles.ratingCircle}
                  onPress={() => handleResponseChange('relaxationLevel', value)}
                >
                  <Text
                    style={[
                      styles.ratingNumber,
                      responses.relaxationLevel === value && styles.selectedRating,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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

      {step === 'completed' && (
        <View style={styles.content}>
          <Text style={styles.title}>Thank You!</Text>
          <Text style={styles.instructionText}>
            Your responses have been recorded. You may now return to the main menu.
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('ParadigmSelectionScreen')}
          >
            <Text style={styles.startButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    // justifyContent: 'center',
    marginTop:60,
  },
  // Text styles
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  instructionText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  // Start button styles
  startButton: {
    backgroundColor: '#4682B4',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Progress bar styles
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 20,
    backgroundColor: '#d3d3d3',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4682B4',
  },
  timeLeftText: {
    fontSize: 16,
    color: '#333',
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
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: SCREEN_WIDTH * 0.8,
  },
  ratingCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#d3d3d3',
    // justifyContent: 'center',
    marginTop: 60,
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 18,
    color: '#333',
  },
  selectedRating: {
    fontWeight: 'bold',
    color: '#4682B4',
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
