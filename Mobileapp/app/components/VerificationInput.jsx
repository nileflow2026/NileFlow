import { useRef } from "react";
import { TextInput, View } from "react-native";

const VerificationInput = ({ code, setCode, length = 6 }) => {
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    if (isNaN(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (text, index) => {
    const pastedCode = text.slice(0, length - index).split("");
    const newCode = [...code];

    pastedCode.forEach((char, i) => {
      if (index + i < length && !isNaN(char)) {
        newCode[index + i] = char;
      }
    });

    setCode(newCode);

    // Focus the next empty input or the last one
    const nextIndex = Math.min(index + pastedCode.length, length - 1);
    inputs.current[nextIndex]?.focus();
  };

  return (
    <View className="flex-row justify-center space-x-2">
      {code.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputs.current[index] = ref)}
          className="w-14 h-14 rounded-xl border-2 text-center text-2xl font-bold"
          style={{
            backgroundColor: "rgba(251, 191, 36, 0.1)",
            borderColor: "#fbbf24",
            color: "#fbbf24",
          }}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onPaste={(e) => handlePaste(e.nativeEvent.text, index)}
          maxLength={1}
          keyboardType="numeric"
          selectTextOnFocus
          autoFocus={index === 0}
        />
      ))}
    </View>
  );
};

export default VerificationInput;
