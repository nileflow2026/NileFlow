/* eslint-disable react/prop-types */
import React, { createContext, useState, useContext, useEffect, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message'

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const isMounted = useRef(false);


    useEffect(() => {
        const loadFavorites = async () => {
            const storedFavorites = await AsyncStorage.getItem('favorites');
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        };
        loadFavorites();
    }, []);


    useEffect(() => {
        if (isMounted.current) {
            const saveFavorites = async () => {
                await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
            };
            saveFavorites();
        } else {
            isMounted.current = true
        }

    }, [favorites]);

    /* const addToFavorites = (product) => {
        if (!favorites.find((fav) => fav.$id === product.$id)) {
            setFavorites([...favorites, product]);
            Toast.show({
                type: 'success',
                text1: 'Added to favorites'
            })
        }
    }; */


    const addToFavorites = (product) => {
        if (!favorites.find((fav) => fav.$id === product.$id)) {
            setFavorites([...favorites, { ...product, id: product.$id }]); // Add a consistent 'id' property
            Toast.show({ type: 'success', text1: 'Added to favorites' });
        }
    };

    const removeFromFavorites = (productId) => {
        setFavorites(favorites.filter((fav) => fav.$id !== productId));

        Toast.show({
            type: 'info',
            text1: 'Removed from Favorites'
        })
    };

    const isFavorite = (productId) => {
        return favorites.some((fav) => fav.$id === productId);
    };

    const favoritesValue = useMemo(() => ({ 
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
    }), [favorites]);
    return (
        <FavoritesContext.Provider value={favoritesValue}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);
