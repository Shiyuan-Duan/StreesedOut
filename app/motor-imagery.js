import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Image } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MotorImageryScreen() {
  const [step, setStep] = useState('introduction'); // Updated steps
  const [cycleTimeLeft, setCycleTimeLeft] = useState(5); // Time left in the current squeeze/release cycle
  const [totalTimeLeft, setTotalTimeLeft] = useState(60); // Total time left for the squeezing/releasing cycles
  const [isSqueezing, setIsSqueezing] = useState(true); // Indicates whether the participant should be squeezing or releasing

  const cycleTimerRef = useRef(null);
  const totalTimerRef = useRef(null);

  // Start the squeezing/releasing cycles
  useEffect(() => {
    if (step === 'physical_squeezing' || step === 'imagery_squeezing') {
      let totalTime = step === 'physical_squeezing' ? 60 : 300; // 1 minute for physical, 5 minutes for imagery
      setTotalTimeLeft(totalTime);
      setCycleTimeLeft(5);
      setIsSqueezing(true);

      // Start total timer
      totalTimerRef.current = setInterval(() => {
        setTotalTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(totalTimerRef.current);
            clearInterval(cycleTimerRef.current);
            if (step === 'physical_squeezing') {
              setStep('ball_taken');
            } else {
              setStep('completion');
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      // Start cycle timer
      cycleTimerRef.current = setInterval(() => {
        setCycleTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsSqueezing((prev) => !prev); // Toggle between squeezing and releasing
            return 5; // Reset cycle time
          }
          return prevTime - 1;
        });
      }, 1000);

      // Cleanup on unmount or when step changes
      return () => {
        clearInterval(totalTimerRef.current);
        clearInterval(cycleTimerRef.current);
      };
    }
  }, [step]);

  const handleNextStep = async () => {
    switch (step) {
      case 'introduction':
        // Upon clicking 'Begin', send the JSON to the dummy API
        const data = {
          ambulatoryUUID: 'dummy',
          paradigm: 'MotorImagery',
          time: new Date().toISOString(),
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
            // Proceed to the next step
            setStep('relaxation');
          } else {
            console.error('Error submitting data');
            Alert.alert('Error', 'There was a problem submitting your data.');
          }
        } catch (error) {
          console.error('Network error:', error);
          Alert.alert('Error', 'Network error occurred while submitting your data.');
          setStep('relaxation');
        }
        break;

      case 'relaxation':
        setStep('preparation');
        break;
      case 'preparation':
        setStep('physical_squeezing');
        break;
      case 'ball_taken':
        setStep('imagery_introduction');
        break;
      case 'imagery_introduction':
        setStep('imagery_squeezing');
        break;
      case 'completion':
        // Navigate back or provide additional options
        Alert.alert('Task Completed', 'Thank you for participating in the motor imagery task.');
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      {step === 'introduction' && (
        <View style={styles.content}>
          <Text style={styles.title}>Motor Imagery Task</Text>
          <Text style={styles.description}>
            In this task, you'll perform a motor imagery exercise using a stress ball.
            We'll guide you through the steps.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleNextStep}>
            <Text style={styles.buttonText}>Begin</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'relaxation' && (
        <View style={styles.content}>
          <Text style={styles.title}>Relaxation Exercise</Text>
          <Text style={styles.description}>
            Take a moment to relax. Close your eyes and take a few deep breaths.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleNextStep}>
            <Text style={styles.buttonText}>I'm Ready</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'preparation' && (
        <View style={styles.content}>
          <Text style={styles.title}>Get Your Stress Ball</Text>
          <Text style={styles.description}>
            Please hold the stress ball in your hand.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleNextStep}>
            <Text style={styles.buttonText}>Start Exercise</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'physical_squeezing' && (
        <View style={styles.content}>
          <Text style={styles.title}>
            {isSqueezing ? 'Squeeze the Stress Ball' : 'Release the Tension'}
          </Text>
          <Text style={styles.timer}>
            {cycleTimeLeft} second{cycleTimeLeft !== 1 ? 's' : ''} left
          </Text>
          <Text style={styles.totalTimer}>
            Total Time Left: {totalTimeLeft} second{totalTimeLeft !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {step === 'ball_taken' && (
        <View style={styles.content}>
          <Text style={styles.title}>Set the Stress Ball Aside</Text>
          <Text style={styles.description}>
            Please set the stress ball aside. We will now proceed to the next part of the exercise.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleNextStep}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'imagery_introduction' && (
        <View style={styles.content}>
          <Text style={styles.title}>Motor Imagery Exercise</Text>
          <Text style={styles.description}>
            Now, imagine holding a stress ball in your hand. Visualize it as clearly as possible.
          </Text>
          {/* Visual cue, e.g., an image or animation */}
          {/* Replace with your own image or animation */}
          <View style={styles.imagePlaceholder}>
            <Text>Stress Ball Image</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleNextStep}>
            <Text style={styles.buttonText}>Start Imagery Exercise</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'imagery_squeezing' && (
        <View style={styles.content}>
          <Text style={styles.title}>
            {isSqueezing ? 'Imagine Squeezing the Stress Ball' : 'Imagine Releasing the Tension'}
          </Text>
          <Text style={styles.timer}>
            {cycleTimeLeft} second{cycleTimeLeft !== 1 ? 's' : ''} left
          </Text>
          <Text style={styles.totalTimer}>
            Total Time Left: {totalTimeLeft} second{totalTimeLeft !== 1 ? 's' : ''}
          </Text>
          {/* Visual cue, e.g., an image or animation */}
          {/* Replace with your own image or animation */}
          <View style={styles.imagePlaceholder}>
            <Text>Stress Ball Image</Text>
          </View>
          {/* Optional guidance or reminders */}
          <Text style={styles.description}>
            Keep focusing on the sensation of squeezing and releasing the stress ball in your mind.
          </Text>
        </View>
      )}

      {step === 'completion' && (
        <View style={styles.content}>
          <Text style={styles.title}>Task Complete</Text>
          <Text style={styles.description}>
            Thank you for completing the motor imagery task.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleNextStep}>
            <Text style={styles.buttonText}>Finish</Text>
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
    paddingVertical: 20,
    alignItems: 'center', // Center horizontally
    paddingHorizontal: 20,
    marginTop: 50,
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  totalTimer: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
  },
  // Image placeholder styles
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
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
});
