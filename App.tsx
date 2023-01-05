/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import { TV_SHOW_TRACKER_API_BASE_URL } from '@env';
import { NavigationContainer } from '@react-navigation/native';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  Header,
  LearnMoreLinks,
} from 'react-native/Libraries/NewAppScreen';
import {
  CURRENT_PAGE_KEY,
  DARK_MODE_KEY,
  DEFAULT_USER,
  IMAGES_BASE_URL,
  IMAGE_DEFAULT_SIZE,
  PAGE_NAME_SEARCH,
  USER_KEY,
} from './constants';
import { useStickyState } from './hooks/sticky-state-hook';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FlatList } from 'react-native-gesture-handler';

const ListViewItem = ({ tvShow }) => {
  return (
    <View>
      <Image
        style={{
          width: '100%',
          height: 500,
        }}
        source={{
          uri:
            IMAGES_BASE_URL + IMAGE_DEFAULT_SIZE + tvShow.poster_path ||
            'https://via.placeholder.com/400',
        }}
      />
      {/* <Text>{tvShow.name}</Text> */}
    </View>
  );
};

function HomeScreen({ darkMode, searchPopular = '' }) {
  const getPopularTVShows = async (title: string = ''): Promise<any[]> => {
    // If title is empty, all popular shows will be fetched
    try {
      const response = fetch(`${TV_SHOW_TRACKER_API_BASE_URL}/SearchTVShows`, {
        method: 'POST',
        body: JSON.stringify({ searchString: title }),
      });
      const tvShows = await (await response).json();
      return tvShows;
    } catch (error) {
      throw error;
    }
  };

  const queryPopularTVShows = useQuery(
    ['popular', searchPopular],
    () => getPopularTVShows(searchPopular),
    {
      // enabled: !isTrackedList,
      staleTime: 60000,
      onError: error => {
        console.log('error happened');
      },
    },
  );

  return (
    <View>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={styles.backgroundStyle.backgroundColor}
      />

      <FlatList
        data={queryPopularTVShows.data}
        renderItem={item => <ListViewItem tvShow={item.item} />}>
        <Header />
        <View
          style={{
            backgroundColor: darkMode ? Colors.black : Colors.white,
          }}>
          <LearnMoreLinks />
        </View>
      </FlatList>
    </View>
  );
}

function SettingsScreen({ darkMode }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings!</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

const getDarkModeStateFromLocalStorage = async () => {
  try {
    return !!JSON.parse((await AsyncStorage.getItem(DARK_MODE_KEY)) || '');
  } catch (error) {
    return false;
  }
};
const queryClient = new QueryClient();

const App = () => {
  const [darkMode, setDarkMode] = useStickyState(
    getDarkModeStateFromLocalStorage,
    DARK_MODE_KEY,
  );
  const [loggedInUser, setLoggedInUser] = useStickyState(
    DEFAULT_USER,
    USER_KEY,
  );
  const [currentPage, setCurrentPage] = useStickyState(
    PAGE_NAME_SEARCH,
    CURRENT_PAGE_KEY,
  );
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  // const [tvShowDetailsToShow, setTVShowDetailsToShow] =
  //   useState<TVShow>(DEFAULT_TV_SHOW);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchPopular, setSearchPopular] = useState('');
  const [searchTracked, setSearchTracked] = useState('');

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  // const getTrackedTVShows = async (searchString: string): Promise<TVShow[]> => {
  //   try {
  //     const token = await AsyncStorage.getItem(JWT_TOKEN_KEY);
  //     const { data } = await axios.post<TVShow[]>(
  //       `${TV_SHOW_TRACKER_API_BASE_URL}/GetTrackedTVShows`,
  //       { token, searchString },
  //     );

  //     return data;
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  // const queryTrackedTVShows = useQuery(
  //   ['tracked', searchTracked],
  //   () => getTrackedTVShows(searchTracked),
  //   {
  //     enabled: isLoggedIn,
  //     staleTime: 60000,
  //     onError: error => {
  //       console.log('error happened');
  //     },
  //   },
  // );

  return (
    <NavigationContainer>
      <QueryClientProvider client={queryClient}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused
                  ? 'ios-information-circle'
                  : 'ios-information-circle-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'ios-list' : 'ios-list-outline';
              } else if (route.name === 'Watchlist') {
                iconName = focused ? 'ios-add' : 'ios-add';
              }
              return (
                <Ionicons name={iconName} size={size} color={Colors.blue} />
              );
            },
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
          })}>
          <Tab.Screen
            name="Home"
            children={() => <HomeScreen darkMode={darkMode} />}
          />
          <Tab.Screen
            name="WatchList"
            children={() => <HomeScreen darkMode={darkMode} />}
          />
          <Tab.Screen
            name="Settings"
            children={() => <SettingsScreen darkMode={darkMode} />}
          />
        </Tab.Navigator>
      </QueryClientProvider>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  // sectionContainer: {
  //   marginTop: 32,
  //   paddingHorizontal: 24,
  // },
  // sectionTitle: {
  //   fontSize: 24,
  //   fontWeight: '600',
  // },
  // sectionDescription: {
  //   marginTop: 8,
  //   fontSize: 18,
  //   fontWeight: '400',
  // },
  // highlight: {
  //   fontWeight: '700',
  // },
  backgroundStyle: {
    backgroundColor: 'blue',
  },
});

export default App;
