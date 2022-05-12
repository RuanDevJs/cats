import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform , FlatList, Image, Animated, TouchableOpacity} from 'react-native';

import fetchData from './src/services/DATA';

const { width, height } = Dimensions.get('window');

const ITEM_SIZE = Platform.OS === 'ios' ? width * 0.72 : width * 0.74
const SPACER_ITEM_SIZE = (width - ITEM_SIZE) / 2;

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const scrollX = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    (async() => {
      const rows = await fetchData();
      setData([
        {
          key: 'left'
        },
        ...rows,
        {
          urls: {
            full: 'https://github.com/RuanDevJs.png',
            raw: 'https://github.com/RuanDevJs.png'
          }
        },
        {
          key: 'right'
        }
      ])
      setLoading(false);
    })();
  }, []);

  if(loading) null;

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFillObject}>
        {data.map((el, index) => {
          if(!el.urls) {
            return null
          };

          const inputRange = [(index - 2) * ITEM_SIZE, (index - 1) * ITEM_SIZE, index * ITEM_SIZE]

          return(
            <Animated.Image
              style={[StyleSheet.absoluteFillObject, {
                opacity: scrollX.interpolate({
                  inputRange: inputRange,
                  outputRange: [0, 1, 0]
                })
              }]}
              source={{ uri: el.urls.full }}
              key={index}
              blurRadius={12}
            />
          )
        })}
        <Animated.FlatList
          data={data}
          keyExtractor={((_, index) => index)}
          renderItem={(({ item, index }) => {
            const inputRange = [(index - 2) * ITEM_SIZE, (index - 1) * ITEM_SIZE, index * ITEM_SIZE]

            if(!item.urls) {
              return <View style={{ width: SPACER_ITEM_SIZE }} />
            }

            return(
              <View style={{ width: ITEM_SIZE }}>
                <Animated.View style={{
                  padding: 0,
                  marginHorizontal: 10,
                  alignItems: 'center',
                  height: ITEM_SIZE * 1.2,
                  justifyContent: 'center',
                  transform: [ 
                    { 
                      translateY: scrollX.interpolate({
                        inputRange,
                        outputRange: [0, -50, -20],
                      })
                    }
                ],
                opacity: scrollX.interpolate({
                  inputRange,
                  outputRange: [0.5, 1, 0.5],
                }),
                }}>
                  <Animated.Image
                      source={{ uri: item.urls.raw }}
                      style={[styles.productImage, {
                        borderRadius: scrollX.interpolate({
                          inputRange,
                          outputRange: [8, 32, 8]
                        }),
                      }]}
                    />
                </Animated.View>
              </View>
            )
          })}
          horizontal
          pagingEnabled
          scrollEventThrottle={16}
          decelerationRate={0}
          bounces={false}
          snapToInterval={ITEM_SIZE}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: 'center'
          }}
          onScroll={Animated.event([{ nativeEvent: {contentOffset: {x: scrollX}}}], {useNativeDriver: false})}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 24,
    margin: 0,
    marginBottom: 10,
  }
});
