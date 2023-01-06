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
import SplashScreen from 'react-native-splash-screen';
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
  TouchableOpacity,
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
  JWT_TOKEN_KEY,
  PAGE_NAME_SEARCH,
  USER_KEY,
} from './constants';
import { useStickyState } from './hooks/sticky-state-hook';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FlatList } from 'react-native-gesture-handler';
import * as Keychain from 'react-native-keychain';
import { SearchBar } from '@rneui/themed';

const LoginScreen = ({ setIsLoggedIn }) => {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');

  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const handleLogin = async () => {
    try {
      // login api call here
      const response = fetch(`${TV_SHOW_TRACKER_API_BASE_URL}/Login`, {
        method: 'POST',
        body: JSON.stringify({ emailAddress, password }),
      });

      const responseData = await (await response).json();
      await AsyncStorage.setItem(JWT_TOKEN_KEY, responseData.token);
      setIsLoggedIn(true);
    } catch (error) {
      console.log(error);
    }

    // setUserDetails({ token, username });
  };

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require('./assets/logo.png')} />
      <StatusBar style="auto" />
      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Email Address"
          placeholderTextColor="#003f5c"
          onChangeText={email => setEmailAddress(email)}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Password"
          placeholderTextColor="#003f5c"
          secureTextEntry={true}
          onChangeText={password => setPassword(password)}
        />
      </View>
      <TouchableOpacity>
        <Text style={styles.forgot_button}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
};

const SignUpScreen = () => {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [repeatedPassword, setRepeatedPassword] = useState('');

  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const handleSignUp = async () => {
    // login api call here
    const response = fetch(`${TV_SHOW_TRACKER_API_BASE_URL}/CreateAccount`, {
      method: 'POST',
      body: JSON.stringify({ emailAddress, password }),
    });

    console.log(await (await response).json());
    const token = await (await response).json();

    // await Keychain.setGenericPassword(username, token);
    // setIsLoggedIn(true);
    // setUserDetails({ token, username });
  };
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require('./assets/logo.png')} />
      <StatusBar style="auto" />
      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Email address"
          placeholderTextColor="#003f5c"
          onChangeText={email => setEmailAddress(email)}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Password"
          placeholderTextColor="#003f5c"
          secureTextEntry={true}
          onChangeText={input => setPassword(input)}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Repeat password"
          placeholderTextColor="#003f5c"
          secureTextEntry={true}
          onChangeText={input => setRepeatedPassword(input)}
        />
      </View>
      <TouchableOpacity style={styles.loginBtn} onPress={handleSignUp}>
        <Text style={styles.loginText}>SIGN UP</Text>
      </TouchableOpacity>
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

function HomeScreen({ darkMode }) {
  const { colors } = useTheme();
  const [searchString, setsearchString] = useState('');

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
    ['popular', searchString],
    () => getPopularTVShows(searchString),
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
      <SearchBar
        placeholder="Search..."
        onChangeText={setsearchString}
        value={searchString}
      />
      <FlatList
        data={queryPopularTVShows.data}
        renderItem={item => <ListViewItem tvShow={item.item} />}
      />
    </View>
  );
}

function WatchlistScreen({ darkMode }) {
  const { colors } = useTheme();
  const [searchString, setsearchString] = useState('');

  const getTrackedTVShows = async (searchString: string): Promise<any> => {
    try {
      const token = await AsyncStorage.getItem(JWT_TOKEN_KEY);
      const response = fetch(
        `${TV_SHOW_TRACKER_API_BASE_URL}/GetTrackedTVShows`,
        {
          method: 'POST',
          body: JSON.stringify({ token, searchString }),
        },
      );
      const tvShows = await (await response).json();
      return tvShows;
    } catch (error) {
      throw error;
    }
  };

  const queryTrackedTVShows = useQuery(
    ['tracked', searchString],
    () => getTrackedTVShows(searchString),
    {
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
      <SearchBar
        placeholder="Search..."
        onChangeText={setsearchString}
        value={searchString}
      />
      <FlatList
        data={queryTrackedTVShows.data}
        renderItem={item => <ListViewItem tvShow={item.item} />}
      />
    </View>
  );
}

function SettingsScreen({ darkMode, toggleDarkMode, setIsLoggedIn }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const handleLogout = async () => {
    await AsyncStorage.removeItem(JWT_TOKEN_KEY);
    setIsLoggedIn(false);
  };

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
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogout}>
        <Text style={styles.loginText}>LOGOUT</Text>
      </TouchableOpacity>
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleDarkMode = () => setDarkMode(previousState => !previousState);

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

  useEffect(() => {
    const getLoggedInState = async () => {
      try {
        const token = await AsyncStorage.getItem(JWT_TOKEN_KEY);
        if (token) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.log(error);
      }

      SplashScreen.hide();
    };

    // call the function
    getLoggedInState()
      // make sure to catch any error
      .catch(console.error);
  }, []);

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
              } else if (route.name === 'Login') {
                iconName = focused ? 'ios-key' : 'ios-key-outline';
              } else if (route.name === 'Sign up') {
                iconName = focused
                  ? 'ios-person-add'
                  : 'ios-person-add-outline';
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
          {isLoggedIn ? (
            <>
              <Tab.Screen
                name="Home"
                children={() => <HomeScreen darkMode={darkMode} />}
              />
              <Tab.Screen
                name="Watchlist"
                children={() => <WatchlistScreen darkMode={darkMode} />}
              />
              <Tab.Screen
                name="Settings"
                children={() => (
                  <SettingsScreen
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                    setIsLoggedIn={setIsLoggedIn}
                  />
                )}
              />
            </>
          ) : (
            <>
              <Tab.Screen
                name="Login"
                children={() => <LoginScreen setIsLoggedIn={setIsLoggedIn} />}
              />
              <Tab.Screen name="Sign up" children={() => <SignUpScreen />} />
            </>
          )}
        </Tab.Navigator>
      </QueryClientProvider>
    </NavigationContainer>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      marginBottom: 40,
    },
    inputView: {
      backgroundColor: '#FFC0CB',
      borderRadius: 30,
      width: '70%',
      height: 45,
      marginBottom: 20,
      alignItems: 'center',
    },
    TextInput: {
      height: 50,
      flex: 1,
      padding: 10,
      marginLeft: 20,
    },
    forgot_button: {
      height: 30,
      marginBottom: 30,
    },
    loginBtn: {
      width: '80%',
      borderRadius: 25,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 40,
      backgroundColor: '#FF1493',
    },
  });

export default App;
