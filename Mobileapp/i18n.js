import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';


import Toast from 'react-native-toast-message';
import ar from './locales/ar.json';
import br from './locales/br.json';
import dk from './locales/dk.json';
import en from './locales/en.json';
import kis from './locales/kis.json';
import nr from './locales/nr.json';
import src from './locales/src.json';

const LANGUAGE_KEY = 'app_language'

const i18n = new I18n({
    en,
    ar,
    kis,
    src,
    nr,
    dk,
    br

});


/* i18n.locale = Localization.getLocales()[0]?.languageCode || 'en'; */


i18n.enableFallback = true;

export const initializeLanguage = async () => {
    try {
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        i18n.locale = storedLanguage || Localization.getLocales()[0]?.languageCode || 'en';
        Toast.show({
            type: 'success',
            text1: 'Your language has been set'
        })
    } catch (error) {
        console.error('Error initializing language:', error);
        i18n.locale = 'en'; // Default to English in case of an error
    }
};

export const changeLanguage = async (lang) => {
    try {
        await AsyncStorage.setItem(LANGUAGE_KEY, lang); // Save language to AsyncStorage
        i18n.locale = lang; // Update the locale in i18n
    } catch (error) {
        console.error('Error changing language:', error);
    }
};

export default i18n;
/*  "package": "com.nilemartsouthsudan.app" */