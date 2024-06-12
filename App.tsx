import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import useAxios from "./src/hooks/useAxios";

const { width } = Dimensions.get("window");

const ITEM_SIZE = Platform.OS === "ios" ? width * 0.72 : width * 0.74;
const SPACER_ITEM_SIZE = (width - ITEM_SIZE) / 2;

interface IUrl {
  full: string;
  raw: string;
}

interface IResponse {
  alt_description: string;
  urls: IUrl;
}

interface IData {
  key?: "left" | "right";
  id?: string;
  urls?: {
    full: string;
    raw: string;
  };
  alt_description?: string;
}

export default function App() {
  const {
    data: responseData,
    error,
    loading,
  } = useAxios<IResponse[]>(
    "https://api.unsplash.com/search/photos?query=cat&per_page=8",
    {
      headers: {
        Authorization: "Client-ID pqn8wt_3w_rtYzZNbA7qeeEtNmDh1lssKlQMX7iUhYU",
      },
    }
  );
  const [data, setData] = useState<IData[]>([]);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading && responseData) {
      setData([
        {
          key: "left",
        },
        ...responseData,
        {
          key: "right",
        },
      ]);
    }
  }, [loading]);

  if (loading) return <Text>Carregando...</Text>;

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFillObject}>
        {data.map((el, index) => {
          if (!el.id) {
            return null;
          }

          const inputRange = [
            (index - 2) * ITEM_SIZE,
            (index - 1) * ITEM_SIZE,
            index * ITEM_SIZE,
          ];

          return (
            <Animated.Image
              style={[
                StyleSheet.absoluteFillObject,
                {
                  opacity: scrollX.interpolate({
                    inputRange: inputRange,
                    outputRange: [0, 1, 0],
                  }),
                },
              ]}
              source={{ uri: el.urls?.full }}
              key={index}
              blurRadius={12}
            />
          );
        })}
        <Animated.FlatList
          data={data}
          keyExtractor={(_, index) => `${index}`}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 2) * ITEM_SIZE,
              (index - 1) * ITEM_SIZE,
              index * ITEM_SIZE,
            ];

            if (item.key) {
              return <View style={{ width: SPACER_ITEM_SIZE }} />;
            }
            return (
              <View style={{ width: ITEM_SIZE }}>
                <Animated.View
                  style={{
                    padding: 0,
                    marginHorizontal: 10,
                    alignItems: "center",
                    height: ITEM_SIZE * 1.2,
                    justifyContent: "center",
                    transform: [
                      {
                        translateY: scrollX.interpolate({
                          inputRange,
                          outputRange: [0, -50, -20],
                        }),
                      },
                    ],
                    opacity: scrollX.interpolate({
                      inputRange,
                      outputRange: [0.72, 1, 0.72],
                    }),
                  }}
                >
                  <Animated.Image
                    source={{ uri: item.urls?.full }}
                    style={[
                      styles.productImage,
                      {
                        borderRadius: scrollX.interpolate({
                          inputRange,
                          outputRange: [8, 32, 8],
                        }),
                      },
                    ]}
                  />
                </Animated.View>
              </View>
            );
          }}
          horizontal
          pagingEnabled
          scrollEventThrottle={16}
          decelerationRate={0}
          bounces={false}
          snapToInterval={ITEM_SIZE}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 24,
    margin: 0,
    marginBottom: 10,
  },
});
