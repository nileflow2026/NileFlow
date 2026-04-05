import React, { useState, useEffect } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';

const FilterModal = ({ isVisible, onClose, applyFilters, resetFilters, initialFilters, categories, brands, /* other filter data */ }) => {
    const [selectedCategories, setSelectedCategories] = useState(initialFilters.categories || []);
    const [priceMin, setPriceMin] = useState(initialFilters.priceMin || '');
    const [priceMax, setPriceMax] = useState(initialFilters.priceMax || '');
    const [selectedBrands, setSelectedBrands] = useState(initialFilters.brands || []);
    // ... other filter states

    useEffect(() => {
        // Update local state when initialFilters prop changes (for persistence)
        setSelectedCategories(initialFilters.categories || []);
        setPriceMin(initialFilters.priceMin || '');
        setPriceMax(initialFilters.priceMax || '');
        setSelectedBrands(initialFilters.brands || []);
        // ... update other filter states
    }, [initialFilters]);

    const handleCategorySelect = (category) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(item => item !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const handleApply = () => {
        const filters = {
            categories: selectedCategories,
            priceMin: priceMin,
            priceMax: priceMax,
            brands: selectedBrands,
            // ... other filter values
        };
        applyFilters(filters);
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <ScrollView style={{ flex: 1, backgroundColor: '#1E1E1E', padding: 20 }}>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>Filter</Text>

                <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', marginBottom: 5 }}>Categories</Text>
                    <ScrollView horizontal>
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={{
                                    backgroundColor: selectedCategories.includes(cat) ? '#3B82F6' : '#333',
                                    padding: 10,
                                    borderRadius: 5,
                                    marginRight: 10,
                                }}
                                onPress={() => handleCategorySelect(cat)}
                            >
                                <Text style={{ color: 'white' }}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', marginBottom: 5 }}>Price</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <TextInput
                            style={{ flex: 1, backgroundColor: '#333', color: 'white', padding: 10, borderRadius: 5, marginRight: 10 }}
                            placeholder="Min"
                            placeholderTextColor="gray"
                            value={priceMin}
                            onChangeText={setPriceMin}
                            keyboardType="numeric"
                        />
                        <Text style={{ color: 'white', alignSelf: 'center', marginHorizontal: 5 }}>-</Text>
                        <TextInput
                            style={{ flex: 1, backgroundColor: '#333', color: 'white', padding: 10, borderRadius: 5, marginLeft: 10 }}
                            placeholder="Max"
                            placeholderTextColor="gray"
                            value={priceMax}
                            onChangeText={setPriceMax}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Add more filter options here (Brand, Color, Size, Style, etc.) */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', marginBottom: 5 }}>Brand</Text>
                    <ScrollView horizontal>
                        {brands.map(brand => (
                            <TouchableOpacity
                                key={brand}
                                style={{
                                    backgroundColor: selectedBrands.includes(brand) ? '#3B82F6' : '#333',
                                    padding: 10,
                                    borderRadius: 5,
                                    marginRight: 10,
                                }}
                                onPress={() => {
                                    if (selectedBrands.includes(brand)) {
                                        setSelectedBrands(selectedBrands.filter(item => item !== brand));
                                    } else {
                                        setSelectedBrands([...selectedBrands, brand]);
                                    }
                                }}
                            >
                                <Text style={{ color: 'white' }}>{brand}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 }}>
                    <TouchableOpacity style={{ backgroundColor: '#555', padding: 15, borderRadius: 5, flex: 1, marginRight: 10 }} onPress={resetFilters}>
                        <Text style={{ color: 'white', textAlign: 'center' }}>Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ backgroundColor: '#E53935', padding: 15, borderRadius: 5, flex: 1, marginLeft: 10 }} onPress={handleApply}>
                        <Text style={{ color: 'white', textAlign: 'center' }}>Apply</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={{ marginTop: 20, alignSelf: 'center' }} onPress={onClose}>
                    <Text style={{ color: 'gray' }}>Close</Text>
                </TouchableOpacity>
            </ScrollView>
        </Modal>
    );
};

export default FilterModal;