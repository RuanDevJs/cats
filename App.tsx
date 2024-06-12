import { useEffect, useRef, useState } from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";

import useAxios from "./src/hooks/useAxios";
import Animated, {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  interpolate,
  SharedValue,
} from "react-native-reanimated";

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
        Authorization: "Client-ID ",
      },
    }
  );
  const [data, setData] = useState<IData[]>([]);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler(({ contentOffset }) => {
    scrollX.value = contentOffset.x;
  });

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

          const animationData = {
            index,
            scrollX,
          };

          return (
            <AnimatedPoster animation={animationData} source={el.urls?.full} />
          );
        })}
        <Animated.FlatList
          data={data}
          keyExtractor={(_, index) => `${index}`}
          renderItem={({ item, index }) => {
            const animationData = {
              index,
              scrollX,
            };

            if (item.key) {
              return <View style={{ width: SPACER_ITEM_SIZE }} />;
            }

            return (
              <View style={{ width: ITEM_SIZE }}>
                <AnimatedCats
                  animation={animationData}
                  source={item.urls?.full}
                />
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
          onScroll={scrollHandler}
        />
      </View>
    </View>
  );
}

interface IAnimatedCatsProps {
  animation: {
    scrollX: SharedValue<number>;
    index: number;
  };
  source?: string;
}

function AnimatedCats({ animation, source }: IAnimatedCatsProps) {
  const inputRange = [
    (animation.index - 2) * ITEM_SIZE,
    (animation.index - 1) * ITEM_SIZE,
    animation.index * ITEM_SIZE,
  ];

  const rAnimatedContainer = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            animation.scrollX.value,
            inputRange,
            [0, -50, -20]
          ),
        },
      ],
      opacity: interpolate(
        animation.scrollX.value,
        inputRange,
        [0.72, 1, 0.72]
      ),
    };
  });

  const rAnimatedImage = useAnimatedStyle(() => {
    return {
      borderRadius: interpolate(
        animation.scrollX.value,
        inputRange,
        [8, 32, 8]
      ),
    };
  });

  return (
    <Animated.View
      style={[
        {
          padding: 0,
          marginHorizontal: 10,
          alignItems: "center",
          height: ITEM_SIZE * 1.2,
          justifyContent: "center",
        },
        rAnimatedContainer,
      ]}
    >
      <Animated.Image
        source={{ uri: source }}
        style={[styles.productImage, rAnimatedImage]}
      />
    </Animated.View>
  );
}

interface IAnimatedPosterProps {
  animation: {
    scrollX: SharedValue<number>;
    index: number;
  };
  source?: string;
}

function AnimatedPoster({ animation, source }: IAnimatedPosterProps) {
  const inputRange = [
    (animation.index - 2) * ITEM_SIZE,
    (animation.index - 1) * ITEM_SIZE,
    animation.index * ITEM_SIZE,
  ];

  const rAnimatedPoster = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animation.scrollX.value, inputRange, [0, 1, 0]),
    };
  });
  return (
    <Animated.Image
      style={[StyleSheet.absoluteFillObject, rAnimatedPoster]}
      source={{ uri: source }}
      key={animation.index}
      blurRadius={12}
    />
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
