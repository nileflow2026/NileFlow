import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const OrderConfiramton = () => {
    const router = useRouter();

    return (
        <View className="flex-1 bg-gray-100 p-4 items-center justify-center">
            <Text className="text-2xl font-bold text-gray-800 mb-4">Thank You!</Text>
            <Text className="text-lg text-gray-600 mb-6">Your order has been placed successfully.</Text>

            <TouchableOpacity
                onPress={() => router.push("/")}
                className="bg-orange-500 rounded-lg p-4"
            >
                <Text className="text-white text-lg font-bold">Go to Home</Text>
            </TouchableOpacity>
        </View>
    );
}

export default OrderConfiramton; 
