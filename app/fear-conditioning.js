import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Easing } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import images from './utils/ImageManager'; // Import images from ImageManager.js

export default function FearConditioningScreen() {
  const navigation = useNavigation();

  const [step, setStep] = useState('start'); // Current step: 'start', 'countdown', 'images', 'break', 'end'
  const [countdown, setCountdown] = useState(15); // Countdown timer for 'countdown' step
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Index of the current image in the set
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0); // Index of the current play sequence
  const [imageSet, setImageSet] = useState([]); // Current set of images to display
  const [timeLeft, setTimeLeft] = useState(0); // Timer for 'break' step
  const [headerVisible, setHeaderVisible] = useState(false); // Controls header visibility
  const [buttonOpacity] = useState(new Animated.Value(1)); // For button fade-in effect

  const IMAGE_DISPLAY_DURATION = 2000; // 2 seconds per image
  const BREAK_DURATION = 10; // 10 seconds break (in seconds)

  // Hard-coded play sequence
  const playSequence = [
    { category: 'Fear', set: 'Set 1' },
    { category: 'Happy', set: 'Set 3' },
    { category: 'Fear', set: 'Set 2' },
    { category: 'Happy', set: 'Set 4' },
    { category: 'Fear', set: 'Set 3' },
  ];

  // Hide or show the navigation header
  useEffect(() => {
    navigation.setOptions({
      headerShown: headerVisible,
    });
  }, [headerVisible]);

  // Show header on screen tap and hide after 3 seconds
  const headerTimeoutRef = useRef(null);

  const handleScreenTap = () => {
    if (step === 'images') {
      setHeaderVisible(true);

      if (headerTimeoutRef.current) {
        clearTimeout(headerTimeoutRef.current);
      }

      headerTimeoutRef.current = setTimeout(() => {
        setHeaderVisible(false);
      }, 3000);
    }
  };

  // Load the next image set when the sequence changes
  useEffect(() => {
    if (currentSequenceIndex < playSequence.length) {
      const { category, set } = playSequence[currentSequenceIndex];
      setImageSet(shuffle(images[category][set])); // Shuffle images in the set
    } else {
      setStep('end');
    }
  }, [currentSequenceIndex]);

  // Handle transitions based on the current step
  useEffect(() => {
    let timer;

    switch (step) {
      case 'countdown':
        if (countdown > 0) {
          timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
        } else {
          setStep('images');
          setCurrentImageIndex(0); // Reset the image index
          setHeaderVisible(false); // Ensure header is hidden
        }
        break;

      case 'images':
        if (currentImageIndex < imageSet.length) {
          timer = setTimeout(() => setCurrentImageIndex((prev) => prev + 1), IMAGE_DISPLAY_DURATION);
        } else {
          setStep('break');
          setTimeLeft(BREAK_DURATION);
        }
        break;

      case 'break':
        if (timeLeft > 0) {
          timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
        } else {
          setCurrentSequenceIndex((prev) => prev + 1); // Move to the next sequence
          setStep('countdown');
          setCountdown(5); // Reset the countdown
        }
        break;

      default:
        break;
    }

    return () => clearTimeout(timer); // Clear the timer when the step changes
  }, [step, countdown, currentImageIndex, timeLeft]);

  // Clean up header timeout when component unmounts
  useEffect(() => {
    return () => {
      if (headerTimeoutRef.current) {
        clearTimeout(headerTimeoutRef.current);
      }
    };
  }, []);

  // Fade-in animation for the start button
  useEffect(() => {
    Animated.timing(buttonOpacity, {
      toValue: 1,
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  // Shuffle an array
  function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.fullScreenTouchable} onPress={handleScreenTap} activeOpacity={1}>
        <View style={styles.content}>
          {step === 'start' && (
            <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity }]}>
              <TouchableOpacity style={styles.startButton} onPress={() => setStep('countdown')}>
                <Text style={styles.buttonText}>Start</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
          {step === 'countdown' && (
            <Text style={styles.countdownText}>Starting in... {countdown} seconds</Text>
          )}
          {step === 'images' && imageSet.length > 0 && (
            <Image
              source={imageSet[currentImageIndex]}
              style={styles.image}
              resizeMode="contain"
            />
          )}
          {step === 'break' && (
            <Text style={styles.breakText}>Take a break... {timeLeft} seconds remaining</Text>
          )}
          {step === 'end' && (
            <Text style={styles.endText}>The session is complete. Thank you!</Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // Ensure background is completely black
  },
  fullScreenTouchable: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
  },
  countdownText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text for visibility on black background
    textAlign: 'center',
  },
  breakText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  endText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    // Optional styling for the button container
  },
  startButton: {
    backgroundColor: '#4682B4', // Steel blue color
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3, // Add shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow for iOS
    shadowOpacity: 0.25, // Shadow for iOS
    shadowRadius: 3.84, // Shadow for iOS
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
