 
import { useRef, useState } from 'react';


import { Dimensions, FlatList, Image, StyleSheet, View } from 'react-native';


const screenWidth = Dimensions.get('window').width
const ProductCarousel = ({ images }) => {
    const [activeSlide, setActiveSlide] = useState(0)
    const onViewRef = useRef((viewableItems) => {
        if (viewableItems.viewableItems.length > 0) {
            setActiveSlide(viewableItems.viewableItems[0].index)
        }
    })


    if (!Array.isArray(images)) {
        return null; // or return a placeholder component or message
    }
    return (
        <>
            <FlatList
                data={images}
                renderItem={({ item }) => {
                    return (
                        <View style={{ justifyContent: "center", alignItems: "center", width: screenWidth, paddingTop: 12, }}>
                            <Image source={{ uri: item }} style={{ height: 350, width: 350, resizeMode: "cover", borderRadius: 10, }} />
                        </View>
                    )
                }}
                keyExtractor={(item, index) => index}
                horizontal
                onViewableItemsChanged={onViewRef.current}
                pagingEnabled={true}
                showsHorizontalScrollIndicator={false}
                snapToAlignment='center'
                snapToInterval={screenWidth}
                decelerationRate={'fast'}
            />

            <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 10, }}>
                {images.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index === activeSlide && {
                                width: 20,
                                borderRadius: 32,
                            },
                            {
                                backgroundColor:
                                    index === activeSlide ? '#AF6432' : 'lightgray',
                            },
                        ]}
                    />
                ))}
            </View>
        </>
    );
}

export default ProductCarousel;

const styles = StyleSheet.create({
    dot: {
        height: 10,
        width: 10,
        borderRadius: 5,
        marginHorizontal: 12,
        backgroundColor: '#AF6432',
    }
})
 