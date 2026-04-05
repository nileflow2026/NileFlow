import { icons } from '@/constants';
import { useState } from 'react';
import { Dimensions, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../Context/ThemeProvider';

const { width } = Dimensions.get('window');

const FormField = ({ title, value, placeholder, handleChangeText, otherStyles, ...props }) => {
    const [showpassword, setShowpassword] = useState(false);
    const { theme, themeStyles} = useTheme();
    const isDarkMode = theme === 'dark';
    const themedText = isDarkMode ? 'text-white' : 'text-black';
    
    

    // Determine responsive styles based on screen width
    const responsiveHeight = width < 350 ? 50 : 64; // Adjust height
    const responsiveTextSize = width < 350 ? 'text-sm' : 'text-base'; // Adjust text size

    return (
        <View className={`space-y-2 ${otherStyles}`} >
            <Text className={`${themedText} font-pmedium ${responsiveTextSize}`} style={{ color: 'white'}}>{title}</Text>
            <View className={`border-2  border-black-200 w-full px-4   rounded-2xl items-center flex-row`} style={{ backgroundColor: themeStyles.accent, height: responsiveHeight }} >
                <TextInput
                    className={`flex-1 ${themedText} font-psemibold ${responsiveTextSize}`}
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor={isDarkMode ? '#000000' : '#000000'}
                    onChangeText={handleChangeText}
                    secureTextEntry={title === 'Password' && !showpassword}
                />
                {title === 'Password' && (
                    <TouchableOpacity onPress={() => setShowpassword(!showpassword)}> 
                        <Image
                            source={!showpassword ? icons.eye : icons.eyeHide}
                            className="w-6 h-6" resizeMode="contain"
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default FormField;