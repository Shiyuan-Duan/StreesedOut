import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Vibration,
} from 'react-native';
import { Audio } from 'expo-av'; // Import Audio from expo-av

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MISTScreen() {
  // State variables
  const [step, setStep] = useState('introduction'); // 'introduction', 'task', 'completion', 'questionnaire'
  const [conditionIndex, setConditionIndex] = useState(0); // 0: withoutTimeConstraints, 1: withTimeConstraints
  const [difficultyIndex, setDifficultyIndex] = useState(0); // 0: low, 1: medium, 2: high
  const [trialIndex, setTrialIndex] = useState(0); // 0 to 4
  const [equationIndex, setEquationIndex] = useState(0); // 0 to 4
  const [problems, setProblems] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [results, setResults] = useState([]);
  const [timerRef, setTimerRef] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // New state variables for questionnaire
  const [stressResponse, setStressResponse] = useState(null);
  const [taskStartTime, setTaskStartTime] = useState(null); // To record the start time of the task

  // Sound and vibration
  const [sound, setSound] = useState();

  const conditions = ['withoutTimeConstraints', 'withTimeConstraints'];
  const difficulties = ['low', 'medium', 'high'];

  // Generate problems upon starting a new trial
  useEffect(() => {
    if (step === 'task') {
      const generatedProblems = generateProblemsForTrial(difficulties[difficultyIndex]);
      setProblems(generatedProblems);
      setEquationIndex(0);
    }
  }, [step, trialIndex, difficultyIndex, conditionIndex]);

  // Update currentProblem when equationIndex or problems change
  useEffect(() => {
    if (problems.length === 0) return; // Guard clause to prevent premature execution

    if (equationIndex < problems.length) {
      setCurrentProblem(problems[equationIndex]);
      setUserAnswer(''); // Clear previous user input
      setStartTime(new Date()); // Reset start time for the new problem

      if (conditions[conditionIndex] === 'withTimeConstraints') {
        resetTimer();
      }
    } else {
      // All problems in the trial are completed
      setCurrentProblem(null);
      if (conditions[conditionIndex] === 'withTimeConstraints') {
        clearTimer();
      }
      moveToNextTrialOrDifficulty();
    }
  }, [equationIndex, problems]);

  // Cleanup function for timers and sounds
  useEffect(() => {
    return () => {
      clearTimer();
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const clearTimer = () => {
    if (timerRef) {
      clearInterval(timerRef);
      setTimerRef(null);
    }
  };

  const generateProblemsForTrial = (difficultyLevel) => {
    const generatedProblems = [];
    const equationsPerTrial = 5; // 5 equations per trial
    for (let i = 0; i < equationsPerTrial; i++) {
      switch (difficultyLevel) {
        case 'low':
          generatedProblems.push(generateLowStressProblem());
          break;
        case 'medium':
          generatedProblems.push(generateMediumStressProblem());
          break;
        case 'high':
          generatedProblems.push(generateHighStressProblem());
          break;
        default:
          break;
      }
    }
    return generatedProblems;
  };

  const generateLowStressProblem = () => {
    // Two operations (addition/subtraction) with single-digit numbers, ensuring positive answers
    const operations = ['+', '-'];
    let num1 = getRandomInt(1, 9);
    let num2 = getRandomInt(1, 9);
    let op1 = operations[Math.floor(Math.random() * operations.length)];

    // Adjust to prevent negative answers
    if (op1 === '-' && num1 < num2) {
      [num1, num2] = [num2, num1]; // Swap numbers
    }

    const expression = `${num1} ${op1} ${num2}`;
    const answer = eval(expression);

    return { expression, answer };
  };

  const generateMediumStressProblem = () => {
    // Three operations (addition/subtraction/multiplication) with double and single-digit numbers, ensuring positive answers
    const operations = ['+', '-', '*'];
    let num1 = getRandomInt(10, 99);
    let num2 = getRandomInt(1, 9);
    let num3 = getRandomInt(1, 9);
    let op1 = operations[Math.floor(Math.random() * operations.length)];
    let op2 = operations[Math.floor(Math.random() * operations.length)];

    // Build expression step by step to ensure positive intermediate results
    let expression = `${num1} ${op1} ${num2}`;
    let intermediateResult = eval(expression);

    if (op2 === '-') {
      // Ensure the result does not become negative
      if (intermediateResult < num3) {
        [intermediateResult, num3] = [num3, intermediateResult];
        expression = `${num3} - ${intermediateResult}`;
      } else {
        expression += ` - ${num3}`;
      }
    } else {
      expression += ` ${op2} ${num3}`;
    }

    const answer = eval(expression);

    return { expression, answer };
  };

  const generateHighStressProblem = () => {
    // Four operations (addition/subtraction/multiplication/division) with double and single-digit numbers, ensuring positive answers
    const operations = ['+', '-', '*', '/'];
    let num1 = getRandomInt(10, 99);
    let num2 = getRandomInt(1, 9);
    let num3 = getRandomInt(1, 9);
    let num4 = getRandomInt(1, 9);
    let op1 = operations[Math.floor(Math.random() * operations.length)];
    let op2 = operations[Math.floor(Math.random() * operations.length)];
    let op3 = operations[Math.floor(Math.random() * operations.length)];

    // Avoid division by zero and ensure positive answers
    if (op1 === '/' && num2 === 0) num2 = getRandomInt(1, 9);
    if (op2 === '/' && num3 === 0) num3 = getRandomInt(1, 9);
    if (op3 === '/' && num4 === 0) num4 = getRandomInt(1, 9);

    let expression = `${num1} ${op1} ${num2} ${op2} ${num3} ${op3} ${num4}`;
    let answer = eval(expression);

    // Adjust to prevent negative answers and invalid results
    if (answer < 0 || isNaN(answer) || !isFinite(answer)) {
      return generateHighStressProblem(); // Regenerate problem
    }

    // Round answer to 2 decimal places if necessary
    if (typeof answer === 'number') {
      answer = Math.round((answer + Number.EPSILON) * 100) / 100;
    }

    return { expression, answer };
  };

  const getRandomInt = (min, max) => {
    // Inclusive of min and max
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const handleInputChange = (text) => {
    // Regular expression to match valid numeric input (positive integers)
    const numericRegex = /^-?\d*\.?\d*$/;

    if (numericRegex.test(text)) {
      setUserAnswer(text);
    }
  };

  const handleAnswerSubmit = async () => {
    if (userAnswer.trim() === '') {
      Alert.alert('Input Required', 'Please enter your answer.');
      return;
    }

    const correctAnswer = currentProblem.answer;
    let userAnswerNum = parseFloat(userAnswer);

    if (isNaN(userAnswerNum)) {
      Alert.alert('Invalid Input', 'Please enter a valid number.');
      return;
    }

    // Round user answer to 2 decimal places if necessary
    userAnswerNum = Math.round((userAnswerNum + Number.EPSILON) * 100) / 100;

    const isCorrect = userAnswerNum === correctAnswer;

    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000; // Time in seconds

    const problemResult = {
      condition: conditions[conditionIndex],
      difficulty: difficulties[difficultyIndex],
      trial: trialIndex + 1,
      equation: currentProblem.expression,
      correctAnswer: correctAnswer,
      userAnswer: userAnswerNum,
      isCorrect: isCorrect,
      timeTaken: timeTaken,
    };

    setResults((prevResults) => [...prevResults, problemResult]);

    if (!isCorrect) {
      await triggerFeedback(); // Play sound and vibrate
    }

    // Move to the next equation
    setEquationIndex((prevIndex) => prevIndex + 1);
  };

  const moveToNextTrialOrDifficulty = () => {
    if (trialIndex < 4) {
      // Move to next trial
      setTrialIndex((prevTrialIndex) => prevTrialIndex + 1);
    } else if (difficultyIndex < difficulties.length - 1) {
      // Move to next difficulty level
      setDifficultyIndex((prevDifficultyIndex) => prevDifficultyIndex + 1);
      setTrialIndex(0);
    } else if (conditionIndex < conditions.length - 1) {
      // Move to next condition
      setConditionIndex((prevConditionIndex) => prevConditionIndex + 1);
      setDifficultyIndex(0);
      setTrialIndex(0);
    } else {
      // Task completed
      setStep('completion');
    }
  };

  const startTimer = () => {
    clearTimer(); // Clear any existing interval before starting a new one

    // Set time limit per problem, e.g., 10 seconds
    const timeLimit = 10;
    setTimeRemaining(timeLimit);

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setTimerRef(null);
          handleTimeExpired();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    setTimerRef(timer);
  };

  const resetTimer = () => {
    startTimer(); // startTimer() already clears the previous interval
  };

  const handleTimeExpired = async () => {
    clearTimer();

    Alert.alert('Time Up', 'You did not answer in time.');

    const correctAnswer = currentProblem.answer;

    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000; // Time in seconds

    const problemResult = {
      condition: conditions[conditionIndex],
      difficulty: difficulties[difficultyIndex],
      trial: trialIndex + 1,
      equation: currentProblem.expression,
      correctAnswer: correctAnswer,
      userAnswer: null,
      isCorrect: false,
      timeTaken: timeTaken,
    };

    setResults((prevResults) => [...prevResults, problemResult]);

    await triggerFeedback(); // Play sound and vibrate

    // Move to the next equation
    setEquationIndex((prevIndex) => prevIndex + 1);
  };

  const triggerFeedback = async () => {
    // Vibrate the device
    Vibration.vibrate(500); // Vibrate for 500 milliseconds

    // Play a sound
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/negative_feedback.mp3') // Replace with the correct path to your sound file
    );
    setSound(sound);
    await sound.playAsync();
  };

  const handleStartTask = () => {
    setTaskStartTime(new Date()); // Record the start time of the task
    setStep('task');
  };

  const handleFinish = () => {
    setStep('questionnaire');
  };

  // New function to submit the questionnaire data
  const submitQuestionnaire = async () => {
    if (stressResponse === null) {
      Alert.alert('Input Required', 'Please select your stress level.');
      return;
    }

    // Prepare the data to be sent
    const data = {
      startTime: taskStartTime,
      results: results,
      stressResponse: stressResponse,
    };
    console.log(data)
    try {
      // Replace 'your_api_endpoint' with the actual API endpoint
      const response = await fetch('your_api_endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        Alert.alert('Thank you', 'Your responses have been submitted.');
        // Reset the app or navigate to another screen as needed
        setStep('introduction');
        setConditionIndex(0);
        setDifficultyIndex(0);
        setTrialIndex(0);
        setEquationIndex(0);
        setProblems([]);
        setResults([]);
        setStressResponse(null);
        setTaskStartTime(null);
      } else {
        Alert.alert('Submission Failed', 'Please try again later.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('An error occurred', 'Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      {step === 'introduction' && (
        <View style={styles.content}>
          <Text style={styles.title}>MIST Task (Mental Arithmetic)</Text>
          <Text style={styles.description}>
            You will be presented with arithmetic problems of varying difficulties. Solve each as
            quickly and accurately as possible without using a calculator.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleStartTask}>
            <Text style={styles.buttonText}>Start Task</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'task' && currentProblem && (
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Text style={styles.conditionText}>
            Condition:{' '}
            {conditions[conditionIndex] === 'withoutTimeConstraints'
              ? 'No Time Constraints'
              : 'Time Constraints'}
          </Text>
          <Text style={styles.difficultyText}>
            Difficulty Level:{' '}
            {difficulties[difficultyIndex].charAt(0).toUpperCase() +
              difficulties[difficultyIndex].slice(1)}
          </Text>
          <Text style={styles.trialText}>Trial {trialIndex + 1} of 5</Text>
          <Text style={styles.problemText}>{currentProblem.expression}</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Answer"
            keyboardType="numeric"
            autoCorrect={false}
            autoCapitalize="none"
            value={userAnswer}
            onChangeText={handleInputChange}
          />
          <TouchableOpacity style={styles.button} onPress={handleAnswerSubmit}>
            <Text style={styles.buttonText}>Submit Answer</Text>
          </TouchableOpacity>
          <Text style={styles.progressText}>
            Problem {equationIndex + 1} of {problems.length}
          </Text>
          {conditions[conditionIndex] === 'withTimeConstraints' && (
            <Text style={styles.timerText}>Time Remaining: {timeRemaining} seconds</Text>
          )}
        </KeyboardAvoidingView>
      )}

      {step === 'completion' && (
        <View style={styles.content}>
          <Text style={styles.title}>Task Complete</Text>
          <Text style={styles.description}>Thank you for completing the task.</Text>
          <TouchableOpacity style={styles.button} onPress={handleFinish}>
            <Text style={styles.buttonText}>Proceed to Questionnaire</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'questionnaire' && (
        <View style={styles.content}>
          <Text style={styles.title}>Self-Report Measure</Text>
          <Text style={styles.description}>Please indicate your current level of stress:</Text>
          <View style={styles.stressLevelContainer}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.stressLevelButton,
                  stressResponse === level && styles.stressLevelButtonSelected,
                ]}
                onPress={() => setStressResponse(level)}
              >
                <Text style={styles.stressLevelText}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.button} onPress={submitQuestionnaire}>
            <Text style={styles.buttonText}>Submit Questionnaire</Text>
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
    // justifyContent: 'center', // Center vertically
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
  conditionText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  difficultyText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  trialText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  problemText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: SCREEN_WIDTH * 0.8,
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  progressText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  timerText: {
    fontSize: 18,
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 10,
  },
  // Styles for the stress level buttons
  stressLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  stressLevelButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stressLevelButtonSelected: {
    backgroundColor: '#4682B4',
  },
  stressLevelText: {
    fontSize: 18,
    color: '#fff',
  },
  // Button styles
  button: {
    backgroundColor: '#4682B4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
