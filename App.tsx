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
import { NavigationContainer, useTheme } from '@react-navigation/native';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
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
import * as Keychain from 'react-native-keychain';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // login api call here
    const response = fetch(`${TV_SHOW_TRACKER_API_BASE_URL}/SearchTVShows`, {
      method: 'POST',
      body: JSON.stringify({ searchString: title }),
    });

    console.log(await (await response).json());
    const token = await (await response).json();

    // await Keychain.setGenericPassword(username, token);
    // setIsLoggedIn(true);
    // setUserDetails({ token, username });
  };
  return (
    <View>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign in" onPress={handleLogin} />
    </View>
  );
};

const SignUpScreen = () => {
  return (
    <View>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign in" onPress={() => signIn({ username, password })} />
    </View>
  );
};

const ListViewItem = ({ tvShow }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        height: 181,
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 2,
        borderColor: colors.border,
        borderBottomWidth: 1,
      }}>
      <Image
        style={{
          height: 180,
          width: 120,
        }}
        source={{
          uri:
            IMAGES_BASE_URL + IMAGE_DEFAULT_SIZE + tvShow.poster_path ||
            'https://via.placeholder.com/400',
        }}
      />
      <View style={{ justifyContent: 'center', paddingLeft: 20 }}>
        <Text style={{ color: colors.text }}>{tvShow.name}</Text>
      </View>
    </View>
  );
};

function HomeScreen({ darkMode, searchPopular = '' }) {
  const { colors } = useTheme();

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
        backgroundColor={colors.background}
      />

      <FlatList
        data={queryPopularTVShows.data}
        renderItem={item => <ListViewItem tvShow={item.item} />}
      />
    </View>
  );
}

function SettingsScreen({ darkMode, toggleDarkMode }) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={{ color: colors.text }}>Dark mode</Text>
      <Switch
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={darkMode ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleDarkMode}
        value={darkMode}
      />
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
  const toggleDarkMode = () => setDarkMode(previousState => !previousState);

  useEffect(() => {
    // try {
    //   // Retrieve the credentials
    //   // const credentials = await Keychain.getGenericPassword();
    //   if (credentials) {
    //     console.log(
    //       'Credentials successfully loaded for user ' + credentials.username,
    //     );
    //   } else {
    //     console.log('No credentials stored');
    //   }
    // } catch (error) {
    //   console.log("Keychain couldn't be accessed!", error);
    // }
  }, []);

  const darkTheme = {
    dark: true,
    colors: {
      primary: 'rgb(31, 41, 55)',
      background: 'rgb(31, 41, 55)',
      card: 'rgb(255, 255, 255)',
      text: 'rgb(255, 255, 255)',
      border: 'rgb(156, 163, 175)',
      notification: 'rgb(255, 69, 58)',
    },
  };

  const lightTheme = {
    dark: false,
    colors: {
      primary: 'rgb(31, 41, 55)',
      background: 'rgb(255, 255, 255)',
      card: 'rgb(255, 255, 255)',
      text: 'rgb(0, 0, 0)',
      border: 'rgb(156, 163, 175)',
      notification: 'rgb(255, 69, 58)',
    },
  };

  const currentTheme = darkMode ? darkTheme : lightTheme;
  // const isDarkMode = useColorScheme() === 'dark';

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
    <NavigationContainer theme={darkMode ? darkTheme : lightTheme}>
      <QueryClientProvider client={queryClient}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: {
              backgroundColor: currentTheme.colors.background,
            },
            tabBarStyle: {
              backgroundColor: currentTheme.colors.background,
            },
            tabBarIcon: ({ focused, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused
                  ? 'ios-information-circle'
                  : 'ios-information-circle-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'ios-list' : 'ios-list-outline';
              } else if (route.name === 'Watchlist') {
                iconName = focused ? 'ios-add' : 'ios-add-outline';
              }
              return (
                <Ionicons
                  name={iconName}
                  size={size}
                  color={currentTheme.colors.text}
                />
              );
            },
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: currentTheme.colors.text,
          })}>
          {loggedInUser ? (
            <>
              <Tab.Screen
                name="Home"
                children={() => <HomeScreen darkMode={darkMode} />}
              />
              <Tab.Screen
                name="Watchlist"
                children={() => <HomeScreen darkMode={darkMode} />}
              />
              <Tab.Screen
                name="Settings"
                children={() => (
                  <SettingsScreen
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                  />
                )}
              />
            </>
          ) : (
            <>
              <Tab.Screen
                name="Login"
                children={() => <LoginScreen darkMode={darkMode} />}
              />
              <Tab.Screen
                name="Sign up"
                children={() => <SignUpScreen darkMode={darkMode} />}
              />
            </>
          )}
        </Tab.Navigator>
      </QueryClientProvider>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  backgroundStyle: {
    backgroundColor: Colors.darker,
  },
});

export default App;
