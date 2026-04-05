/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter, useSearchParams } from 'expo-router/build/hooks';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { account } from '../../Appwrite';

const Verify = () => {
    const router = useRouter();
  const params = useSearchParams();
  const { userId, secret } = params;

  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!userId || !secret) {
        setStatus('Invalid verification link.');
        return;
      }

      try {
        await account.updateVerification(userId, secret);
        setStatus('Email verified successfully! Redirecting...');
        
        // Redirect to main app after 3 seconds
        setTimeout(() => {
          router.replace('/(tabs)/BottomTabs');
        }, 3000);

      } catch (error) {
        console.error('Email verification failed:', error);
        setStatus('Verification failed. Please try again or contact support.');
        Alert.alert('Verification Error', error.message || 'Something went wrong.');
      }
    };

    verifyEmail();
  }, [userId, secret]);
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.text}>
                We've sent a verification link to your email. Please check your inbox and verify your email to continue.
            </Text>
            <Text style={styles.status}>{status}</Text>
      {status === 'Verifying...' && <ActivityIndicator size="large" color="#004aad" />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
          flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f4f4',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
    },
     status: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default Verify;
