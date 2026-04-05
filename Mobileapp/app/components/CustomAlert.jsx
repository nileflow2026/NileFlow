/* eslint-disable react/prop-types */
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const CustomAlert = ({ isVisible, onClose, onSignUp }) => {
    const router = useRouter();

    const handleSignUp = () => {
        onSignUp();
        router.push('/(auth)/sign-up'); // Replace "/signup" with your actual sign-up route
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Sign Up Required</Text>
                    <Text style={styles.modalText}>To proceed to checkout, please create an account.</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.signUpButton]}
                            onPress={handleSignUp}
                        >
                            <Text style={styles.textStyle}>Sign Up</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.textStyle}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#333',
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
        color: '#555',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    button: {
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        elevation: 2,
        marginHorizontal: 5,
    },
    signUpButton: {
        backgroundColor: '#2f9e44', // Your primary color
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default CustomAlert;