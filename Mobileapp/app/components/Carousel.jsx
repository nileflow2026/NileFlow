/* 
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';


const width = Dimensions.get('window').width
const Carousel = ({ products }) => {
    const scrollViewRef = useRef();
    const { width } = Dimensions.get('window');
    const router = useRouter();

    useEffect(() => {
        let intervalId;

        if (products && products.length > 0) {
            let currentIndex = 0;

            intervalId = setInterval(() => {
                currentIndex = (currentIndex + 1) % products.length;
                scrollViewRef.current.scrollTo({
                    x: currentIndex * width,
                    animated: true,
                });
            }, 3000); // Change slide every 3 seconds
        }

        return () => clearInterval(intervalId);
    }, [products]);

    const renderProductCard = ({ item }) => {
        const imageWidth = width * 0.9;
        const imageHeight = width < 350 ? 120 : 160;
        const textFontSize = width < 350 ? 14 : 16;
        return (
        
             <View style={{ width: width, alignItems: 'center', justifyContent: 'center' }}>
                        <Image
                            source={{ uri: item.image }}
                            style={{ width: '90%', height: 160, borderRadius: 10, marginBottom: 10, backgroundColor: '#F5F5F5' }}
                            resizeMode='contain'
                        />
                        <Text style={{ position: 'absolute', bottom: 10, left: 20, fontSize: 16, fontWeight: 'bold', color: 'black', backgroundColor: 'rgba(0, 0, 0, 0.5', paddingVertical: 8, paddingHorizontal: 8, borderRadius: 5 }}>
                            {item.productName.length > 10 ? item.productName.slice(0, 15) + '.....' : item.productName}
            
                        </Text>
                    </View>
        );
    };

    return (
        <ScrollView
            ref={scrollViewRef}
            horizontal={true}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
        >
            {products.map((item) => (
                <View key={item.$id} style={{ width: width }}>
                    {renderProductCard({ item })}
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        marginTop: 10,
    },
    productCard: {
        width: Dimensions.get('window').width,
    },
});

export default Carousel; */

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';


const width = Dimensions.get('window').width
const Carousel = ({ products }) => {
 const scrollViewRef = useRef();
 const { width } = Dimensions.get('window');
 const router = useRouter();

 useEffect(() => {
  let intervalId;

  if (products && products.length > 0) {
   let currentIndex = 0;

   intervalId = setInterval(() => {
    currentIndex = (currentIndex + 1) % products.length;
    if (scrollViewRef.current) { // Add this check
     scrollViewRef.current.scrollTo({
      x: currentIndex * width,
      animated: true,
     });
    }
   }, 3000); // Change slide every 3 seconds
  }

  return () => clearInterval(intervalId);
 }, [products]);

 const renderProductCard = ({ item }) => {
  const imageWidth = width * 0.9;
  const imageHeight = width < 350 ? 120 : 160;
  const textFontSize = width < 350 ? 14 : 16;
  return (
  
   <View style={{ width: width, alignItems: 'center', justifyContent: 'center' }}>
      <Image
       source={{ uri: item.image }}
       style={{ width: '90%', height: 160, borderRadius: 10, marginBottom: 10, backgroundColor: '#F5F5F5' }}
       resizeMode='contain'
      />
      <Text style={{ position: 'absolute', bottom: 10, left: 20, fontSize: 16, fontWeight: 'bold', color: 'black', backgroundColor: 'rgba(0, 0, 0, 0.5', paddingVertical: 8, paddingHorizontal: 8, borderRadius: 5 }}>
       {item.productName.length > 10 ? item.productName.slice(0, 15) + '.....' : item.productName}
   
      </Text>
     </View>
  );
 };

 return (
  <ScrollView
   ref={scrollViewRef}
   horizontal={true}
   pagingEnabled={true}
   showsHorizontalScrollIndicator={false}
   style={styles.scrollView}
  >
   {products.map((item) => (
    <View key={item.$id} style={{ width: width }}>
     {renderProductCard({ item })}
    </View>
   ))}
  </ScrollView>
 );
};

const styles = StyleSheet.create({
 scrollView: {
  marginTop: 10,
 },
 productCard: {
  width: Dimensions.get('window').width,
 },
});

export default Carousel;