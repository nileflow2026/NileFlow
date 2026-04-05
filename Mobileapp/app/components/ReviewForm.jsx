import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ReviewForm = ({
    reviewText,
    setReviewText,
    selectedImage,
    setSelectedImage,
    handleAddReview,
    handlePickimage,
    reviewFontSize,
    paddingHorizontal,
    paddingVertical,
    buttonFontSize,
    themeStyles
}) => {
    return (
        <View className='mb-6'>
            <TextInput
                value={reviewText}
                onChangeText={setReviewText}
                placeholder='Let Us Know About the Product'
                placeholderTextColor={'black'}
                className='flex-1 border border-gray-100 rounded-lg px-4 py-2 text-white'
                style={{ fontSize: reviewFontSize, borderColor: '#AF6432' }}
            />

            <TouchableOpacity
                onPress={handlePickimage}
                className='bg-gray-200 px-4 py-2 ml-2 mt-4 font-semibold rounded-lg mb-4 flex-row items-center justify-center'
                style={{ paddingHorizontal, paddingVertical, backgroundColor: '#AF6432' }}
            >
                <Text className='text-gray-700 font-psemibold' style={{ fontSize: buttonFontSize,  color: 'white' }}>Pick an Image</Text>
            </TouchableOpacity>

            {selectedImage && (
                <Image source={{ uri: selectedImage }} className='w-full h-40 mb-4 rounded-lg' />
            )}

            <TouchableOpacity
                onPress={handleAddReview}
                className='bg-[#2f9e44] ml-2 px-4 py-2 rounded-lg'
                style={{ paddingHorizontal, paddingVertical, backgroundColor: '#AF6432'}}
            >
                <Text className='text-white font-psemibold' style={{ fontSize: buttonFontSize, color: 'white'}}>Post Review</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ReviewForm;
