import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // In production, send to crash reporting service (e.g., Sentry)
    if (__DEV__) {
      console.error("ErrorBoundary caught:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-gray-900 px-6">
          <Text className="text-white text-2xl font-bold mb-3">
            Something went wrong
          </Text>
          <Text className="text-gray-400 text-center mb-6">
            We're sorry for the inconvenience. Please try again.
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false })}
            className="bg-amber-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold text-base">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
