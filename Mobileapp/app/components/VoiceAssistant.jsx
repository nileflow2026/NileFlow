import * as Speech from 'expo-speech';
import { useState } from 'react';
import { Button, KeyboardAvoidingView, Platform, StyleSheet, TextInput } from 'react-native';
import { getAIResponse } from '../../utils/ai';

const VoiceAssistant = () => {
  const [question, setQuestion] = useState('');

/*   const handleSend = () => {
    if (question.trim() === '') return;

    const answer = "This is a test response."; 
    Speech.speak(answer);
    console.log("User asked:", question);
    setQuestion('');
  }; */

    const handleSend = async () => {
    if (question.trim() === '') return;

    try {
      const answer = await getAIResponse(question);
      Speech.speak(answer);
      console.log("AI answered:", answer);
    } catch (error) {
      console.error("AI error:", error);
      Speech.speak("Sorry, I couldn't get an answer.");
    }

    setQuestion('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TextInput
        placeholder="Type your question..."
        style={styles.input}
        value={question}
        onChangeText={setQuestion}
      />
      <Button title="Ask" onPress={handleSend} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default VoiceAssistant;
