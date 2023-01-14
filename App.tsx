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
import messaging from '@react-native-firebase/messaging';
import { NavigationContainer, useTheme } from '@react-navigation/native';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';

import { DARK_MODE_KEY, IMAGES_BASE_URL, IMAGE_DEFAULT_SIZE, JWT_TOKEN_KEY } from './constants';
import { useAsyncStorage } from './hooks/sticky-state-hook';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button as ThemedButton, SearchBar } from '@rneui/themed';
import { FlatList } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  fetcher,
  getPopularTVShows,
  getTrackedTVShows,
  getUserForToken,
  updateMobileNotificationsToken,
  updateSettings,
} from './api';

const LoginScreen = ({
  emailAddress,
  setEmailAddress,
  setWantsEmailNotifications,
  setWantsMobileNotifications,
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const handleLogin = async () => {
    try {
      // login api call here
      setIsLoading(true);
      const response: any = await fetcher(`${TV_SHOW_TRACKER_API_BASE_URL}/Login`, {
        method: 'POST',
        body: JSON.stringify({ emailAddress, password }),
      });

      await AsyncStorage.setItem(JWT_TOKEN_KEY, response.token);
      setEmailAddress(response.emailAddress);
      setWantsEmailNotifications(response.wantsEmailNotifications);
      setWantsMobileNotifications(response.wantsMobileNotifications);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: 'Please check your credentials and retry',
      });
      console.log(error);
    }
    setIsLoading(false);
  };

  return isLoading ? (
    <View style={styles.container}>
      <ActivityIndicator />
    </View>
  ) : (
    <View style={styles.container}>
      <Image style={styles.image} source={require('./assets/logo.png')} />
      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Email Address"
          textAlign={'center'}
          placeholderTextColor="#003f5c"
          value={emailAddress}
          onChangeText={email => setEmailAddress(email)}
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Password"
          textAlign={'center'}
          placeholderTextColor="#003f5c"
          secureTextEntry
          value={password}
          onChangeText={password => setPassword(password)}
        />
      </View>
      <TouchableOpacity>
        <Text style={styles.forgot_button}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
};

const SignUpScreen = () => {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [repeatedPassword, setRepeatedPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accountCreated, setaccountCreated] = useState(false);

  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const handleSignUp = async () => {
    try {
      if (password !== repeatedPassword) {
        return Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: 'Passwords are not equal',
        });
      }
      setIsLoading(true);
      await fetcher(`${TV_SHOW_TRACKER_API_BASE_URL}/CreateAccount`, {
        method: 'POST',
        body: JSON.stringify({ emailAddress, password }),
      });

      setaccountCreated(true);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: 'Account creation failed',
      });

      console.log(error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return accountCreated ? (
    <View style={styles.container}>
      <Text style={{ color: colors.text, paddingHorizontal: 20 }}>
        Your account has been created!
      </Text>
      <Text style={{ color: colors.text, paddingHorizontal: 40, paddingTop: 10 }}>
        Please verify your email address by clicking the link in the email in your{' '}
        <Text style={{ fontWeight: 'bold' }}>inbox or spam folder</Text>.
      </Text>
    </View>
  ) : (
    <View style={styles.container}>
      <Image style={styles.image} source={require('./assets/logo.png')} />
      <StatusBar style="auto" />
      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          textAlign="center"
          placeholder="Email address"
          placeholderTextColor="#003f5c"
          onChangeText={email => setEmailAddress(email)}
          autoCapitalize="none"
          value={emailAddress}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          textAlign="center"
          placeholder="Password"
          placeholderTextColor="#003f5c"
          secureTextEntry
          value={password}
          onChangeText={input => setPassword(input)}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          textAlign="center"
          placeholder="Repeat password"
          placeholderTextColor="#003f5c"
          secureTextEntry
          value={repeatedPassword}
          onChangeText={input => setRepeatedPassword(input)}
        />
      </View>
      <TouchableOpacity style={styles.loginBtn} onPress={handleSignUp}>
        <Text style={styles.buttonText}>SIGN UP</Text>
      </TouchableOpacity>
    </View>
  );
};

import { PureComponent } from 'react';
import { blob } from 'stream/consumers';
class ListViewItem extends PureComponent<any> {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  render() {
    const iconName = this.props.isWatchlistItem ? 'ios-remove' : 'ios-add';
    const buttonColor = this.props.isWatchlistItem ? 'red' : 'blue';
    const onButtonPress = async tvShow => {
      this.setState({ isLoading: true });
      await this.props.handleButtonClick(tvShow);
      this.setState({ isLoading: false });
    };
    return (
      <View
        style={{
          height: 181,
          width: '100%',
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginBottom: 2,
          borderColor: this.props.colors.border,
          borderBottomWidth: 1,
        }}>
        <Image
          style={{
            height: 180,
            width: 120,
          }}
          source={{
            uri:
              IMAGES_BASE_URL + IMAGE_DEFAULT_SIZE + this.props.tvShow.poster_path ||
              'https://via.placeholder.com/400',
          }}
        />
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ justifyContent: 'center', paddingLeft: 20, flex: 5 }}>
            <Text style={{ color: this.props.colors.text }}>{this.props.tvShow.name}</Text>
          </View>
          <View style={{ justifyContent: 'center', paddingRight: 20, flex: 2 }}>
            {this.props.shouldShowButton ? (
              <ThemedButton
                color={buttonColor}
                onPress={() => onButtonPress(this.props.tvShow)}
                icon={
                  this.state.isLoading ? (
                    <ActivityIndicator />
                  ) : (
                    <Ionicons name={iconName} size={15} color={this.props.colors.card} />
                  )
                }
                iconRight
              />
            ) : null}
          </View>
        </View>
      </View>
    );
  }
}

function HomeScreen({ darkMode, refresh, setRefresh }) {
  const { colors } = useTheme();
  const [searchString, setsearchString] = useState('');
  const styles = makeStyles(colors);

  const queryPopularTVShows = useQuery(
    ['popular', searchString],
    () => getPopularTVShows(searchString),
    {
      staleTime: 60000,
    },
  );
  const queryTrackedTVShows = useQuery(['tracked', ''], () => getTrackedTVShows(''), {
    staleTime: 60000,
  });

  const isAlreadyInTrackedList = (tvShow, trackedTVShows) => {
    if (trackedTVShows) {
      return !!trackedTVShows.some(trackedShow => trackedShow.id === tvShow.id);
    }
    return false;
  };

  const addShow = async tvShow => {
    try {
      const token = await AsyncStorage.getItem(JWT_TOKEN_KEY);
      const response: any = await fetcher(`${TV_SHOW_TRACKER_API_BASE_URL}/UpdateUser`, {
        method: 'POST',
        body: JSON.stringify({
          token,
          updateObject: {
            trackedTVShows: [...queryTrackedTVShows.data, tvShow],
          },
        }),
      });

      queryClient.setQueryData(['tracked', ''], response.trackedTVShows);
      setRefresh(oldrefresh => !oldrefresh);
      Toast.show({
        type: 'info',
        text1: `${tvShow.name} added to watchlist`,
        visibilityTime: 1500,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: 'Failed to add show to watchlist',
      });
    }
  };

  return (
    <View style={styles.flatlistView}>
      <StatusBar />
      <SearchBar
        placeholder="Search..."
        onChangeText={setsearchString}
        value={searchString}
        containerStyle={{ backgroundColor: colors.header }}
        inputStyle={{ backgroundColor: colors.header }}
        inputContainerStyle={{ backgroundColor: colors.header }}
      />

      {queryPopularTVShows.isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={queryPopularTVShows.data}
          keyExtractor={item => item.id}
          extraData={refresh}
          keyboardShouldPersistTaps="handled"
          renderItem={item => {
            return (
              <ListViewItem
                tvShow={item.item}
                isWatchlistItem={false}
                handleButtonClick={addShow}
                shouldShowButton={!isAlreadyInTrackedList(item.item, queryTrackedTVShows.data)}
                colors={colors}
              />
            );
          }}
        />
      )}
    </View>
  );
}

function WatchlistScreen({ darkMode, refresh, setRefresh }) {
  const { colors } = useTheme();
  const [searchString, setsearchString] = useState('');
  const styles = makeStyles(colors);

  const queryTrackedTVShows = useQuery(
    ['tracked', searchString],
    () => getTrackedTVShows(searchString),
    {
      staleTime: 60000,
    },
  );

  const removeShow = async tvShow => {
    try {
      const token = await AsyncStorage.getItem(JWT_TOKEN_KEY);
      const cachedWatchlistShows: any = queryClient.getQueryData(['tracked', '']);

      const newTvShows = cachedWatchlistShows.filter(
        trackedTVShow => trackedTVShow.id !== tvShow.id,
      );
      const response: any = await fetcher(`${TV_SHOW_TRACKER_API_BASE_URL}/UpdateUser`, {
        method: 'POST',
        body: JSON.stringify({
          token,
          updateObject: {
            trackedTVShows: newTvShows,
          },
        }),
      });
      queryClient.setQueryData(['tracked', ''], response.trackedTVShows);
      queryClient.setQueryData(
        ['tracked', searchString],
        response.trackedTVShows.filter(tvShow => tvShow.name.includes(searchString)),
      );
      setRefresh(oldrefresh => !oldrefresh);
      Toast.show({
        type: 'info',
        text1: `${tvShow.name} removed from watchlist`,
        visibilityTime: 1500,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: 'Failed to remove show from watchlist',
      });
    }
  };

  return (
    <View style={styles.flatlistView}>
      <StatusBar />
      <SearchBar
        placeholder="Search..."
        onChangeText={setsearchString}
        value={searchString}
        containerStyle={{ backgroundColor: colors.header }}
        inputStyle={{ backgroundColor: colors.header }}
        inputContainerStyle={{ backgroundColor: colors.header }}
      />
      {queryTrackedTVShows.isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={queryTrackedTVShows.data}
          keyExtractor={item => item.id}
          extraData={refresh}
          keyboardShouldPersistTaps="handled"
          renderItem={item => (
            <ListViewItem
              tvShow={item.item}
              isWatchlistItem={true}
              shouldShowButton={true}
              handleButtonClick={removeShow}
              colors={colors}
            />
          )}
        />
      )}
    </View>
  );
}

function SettingsScreen({
  darkMode,
  toggleDarkMode,
  wantsEmailNotifications,
  setWantsEmailNotifications,
  wantsMobileNotifications,
  setWantsMobileNotifications,
  setIsloggedIn,
  saveUpdatedSettings,
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      //Toggle twice on boot so switch value is correct
      toggleDarkMode();
      toggleDarkMode();
    })();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.setItem(JWT_TOKEN_KEY, '');
    setIsloggedIn(false);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    await saveUpdatedSettings();
    setIsLoading(false);
    Toast.show({
      type: 'info',
      text1: 'New settings saved successfully',
      visibilityTime: 1500,
    });
  };

  return (
    <View style={styles.flatlistView}>
      <View style={{ flex: 8 }}>
        <View style={styles.settingsItem}>
          <Text style={styles.settingsText}>Dark mode</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={darkMode ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleDarkMode}
            value={darkMode}
          />
        </View>
        <View style={styles.settingsItem}>
          <Text style={styles.settingsText}>Email Notifications</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={wantsEmailNotifications ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setWantsEmailNotifications(prevState => !prevState)}
            value={wantsEmailNotifications}
          />
        </View>
        <View style={styles.settingsItem}>
          <Text style={styles.settingsText}>Push Notifications</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={wantsMobileNotifications ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setWantsMobileNotifications(prevState => !prevState)}
            value={wantsMobileNotifications}
          />
        </View>
        <View
          style={{
            justifyContent: 'center',
            alignContent: 'center',
            width: '100%',
            flexDirection: 'row',
          }}>
          <TouchableOpacity
            style={{ ...styles.loginBtn, marginTop: 20 }}
            onPress={handleSaveSettings}
            disabled={isLoading}>
            <Text style={styles.buttonText}>{isLoading ? <ActivityIndicator /> : <>SAVE</>}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 3 }}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.buttonText}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const Tab = createBottomTabNavigator();

const queryClient = new QueryClient();

const App = () => {
  const [darkMode, setDarkMode] = useAsyncStorage(DARK_MODE_KEY, true);
  const [emailAddress, setEmailAddress] = useState('');
  const [wantsEmailNotifications, setWantsEmailNotifications] = useState(false);
  const [wantsMobileNotifications, setWantsMobileNotifications] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isLoggedIn, setisLoggedIn] = useState(false);

  const toggleDarkMode = () => setDarkMode(previousState => !previousState);

  const darkTheme = {
    dark: true,
    colors: {
      primary: 'rgb(67, 56, 202)',
      secondary: 'rgb(238, 75, 43)',
      background: 'rgb(31, 41, 55)',
      header: 'rgb(31, 41, 55)',
      card: 'rgb(255, 255, 255)',
      text: 'rgb(255, 255, 255)',
      border: 'rgb(147,147,147)',
      notification: 'rgb(255, 69, 58)',
      bottomNav: 'rgb(68, 166, 198)',
    },
  };

  const lightTheme = {
    dark: false,
    colors: {
      primary: 'rgb(67, 56, 202)',
      secondary: 'rgb(238, 75, 43)',
      background: 'rgb(225, 225, 225)',
      header: 'rgb(31, 41, 55)',
      card: 'rgb(255, 255, 255)',
      text: 'rgb(0, 0, 0)',
      border: 'rgb(147,147,147)',
      notification: 'rgb(255, 69, 58)',
      bottomNav: 'rgb(68, 166, 198)',
    },
  };

  const currentTheme = darkMode ? darkTheme : lightTheme;

  const saveUpdatedSettings = async () => {
    const jwtToken = await AsyncStorage.getItem(JWT_TOKEN_KEY);
    const updateObject = {
      wantsEmailNotifications,
      wantsMobileNotifications,
    };
    await updateSettings(updateObject, jwtToken);
  };

  useEffect(() => {
    const handleEmailVerification = async url => {
      try {
        const [, stringAfterDoubleSlash] = url.split('//');
        const [, emailAddressToVerify, verifyEmailAddressToken] = stringAfterDoubleSlash.split('/');
        await fetcher(`${TV_SHOW_TRACKER_API_BASE_URL}/UpdateUser`, {
          method: 'POST',
          body: JSON.stringify({
            emailAddress: emailAddressToVerify,
            verifyEmailAddressToken,
          }),
        });
        Toast.show({
          type: 'error',
          text1: 'Successfully verified account',
          text2: 'Please log in to start using TV Tracker',
        });
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Failed to verify account',
          text2: 'Please retry creating an account',
        });
      }
    };
    const linkingEvent = Linking.addEventListener('url', async data => {
      if (data.url) {
        await handleEmailVerification(data.url);
      }
    });
    Linking.getInitialURL().then(url => {
      if (url) {
        handleEmailVerification(url);
      }
    });
    return () => {
      linkingEvent.remove();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem(JWT_TOKEN_KEY);
      if (token) {
        setisLoggedIn(true);
        const response: any = await getUserForToken(token);
        setEmailAddress(response.emailAddress);
        setWantsEmailNotifications(response.wantsEmailNotifications);
        setWantsMobileNotifications(response.wantsMobileNotifications);
        SplashScreen.hide();
      }
      SplashScreen.hide();
    })();

    messaging().onMessage(remoteMessage => {
      console.log('showed toast with notification');
      Toast.show({
        type: 'info',
        text1: remoteMessage.notification?.title,
        text2: remoteMessage?.notification?.body,
      });
    });

    // messaging().onNotificationOpenedApp(remoteMessage => {
    //   console.log('opened app after clicking notification');
    //   Toast.show({
    //     type: 'info',
    //     text1: 'Clicked notificaion to open the app',
    //     text2: remoteMessage?.notification?.toString() || 'no text in notification',
    //   });
    //   // navigation.navigate(remoteMessage.data.type);
    // });

    // // Check whether an initial notification is available
    // messaging()
    //   .getInitialNotification()
    //   .then(remoteMessage => {
    //     if (remoteMessage) {
    //       console.log('there was an initial notification');
    //       Toast.show({
    //         type: 'info',
    //         text1: 'Notification caused app to open from quit state:',
    //         text2: remoteMessage?.notification?.toString() || 'no text in notification',
    //       });
    //       // setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
    //     }
    //     // setLoading(false);
    //   });

    messaging()
      .registerDeviceForRemoteMessages()
      .then(async () => {
        try {
          const notificationsToken = await messaging().getToken();
          const jwtToken = await AsyncStorage.getItem(JWT_TOKEN_KEY);
          await updateMobileNotificationsToken(notificationsToken, jwtToken);
          console.log(`TOKEN: ${notificationsToken}`);
        } catch (error) {
          console.error('failed to set registrationtoken');
        }
      });
  }, []);

  return (
    <NavigationContainer theme={currentTheme}>
      <QueryClientProvider client={queryClient}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: {
              backgroundColor: currentTheme.colors.header,
            },
            headerTintColor: currentTheme.colors.card,
            tabBarStyle: {
              backgroundColor: currentTheme.colors.header,
            },
            tabBarIcon: ({ focused, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'ios-information-circle' : 'ios-information-circle-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'ios-list' : 'ios-list-outline';
              } else if (route.name === 'Watchlist') {
                iconName = focused ? 'ios-add' : 'ios-add-outline';
              } else if (route.name === 'Login') {
                iconName = focused ? 'ios-key' : 'ios-key-outline';
              } else if (route.name === 'Sign up') {
                iconName = focused ? 'ios-person-add' : 'ios-person-add-outline';
              }
              return (
                <Ionicons
                  name={iconName}
                  size={size}
                  color={focused ? currentTheme.colors.bottomNav : currentTheme.colors.card}
                />
              );
            },
            tabBarActiveTintColor: currentTheme.colors.bottomNav,
            tabBarInactiveTintColor: currentTheme.colors.card,
          })}>
          {isLoggedIn ? (
            <>
              <Tab.Screen
                name="Home"
                children={() => (
                  <HomeScreen darkMode={darkMode} refresh={refresh} setRefresh={setRefresh} />
                )}
              />
              <Tab.Screen
                name="Watchlist"
                children={() => (
                  <WatchlistScreen darkMode={darkMode} refresh={refresh} setRefresh={setRefresh} />
                )}
              />
              <Tab.Screen
                name="Settings"
                children={() => (
                  <SettingsScreen
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                    wantsEmailNotifications={wantsEmailNotifications}
                    setWantsEmailNotifications={setWantsEmailNotifications}
                    wantsMobileNotifications={wantsMobileNotifications}
                    setWantsMobileNotifications={setWantsMobileNotifications}
                    setIsloggedIn={setisLoggedIn}
                    saveUpdatedSettings={saveUpdatedSettings}
                  />
                )}
              />
            </>
          ) : (
            <>
              <Tab.Screen
                name="Login"
                children={() => (
                  <LoginScreen
                    emailAddress={emailAddress}
                    setEmailAddress={setEmailAddress}
                    setWantsEmailNotifications={setWantsEmailNotifications}
                    setWantsMobileNotifications={setWantsMobileNotifications}
                  />
                )}
              />
              <Tab.Screen name="Sign up" children={() => <SignUpScreen />} />
            </>
          )}
        </Tab.Navigator>
        <Toast />
      </QueryClientProvider>
    </NavigationContainer>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flatlistView: { flex: 1 },
    image: {
      marginBottom: 40,
    },
    inputView: {
      backgroundColor: '#FFC0CB',
      width: '70%',
      height: 45,
      marginBottom: 20,
      alignItems: 'center',
    },
    TextInput: {
      height: 50,
      flex: 1,
      padding: 10,
      color: '#003f5c',
    },
    forgot_button: {
      height: 30,
      marginBottom: 30,
      color: colors.text,
    },
    loginBtn: {
      width: '80%',
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 40,
      backgroundColor: colors.primary,
    },
    logoutBtn: {
      width: '80%',
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 40,
      backgroundColor: colors.secondary,
    },
    buttonText: {
      color: '#fff',
    },
    settingsText: {
      color: colors.text,
      height: 50,
      textAlignVertical: 'center',
      paddingLeft: 10,
      flex: 4,
    },
    settingsItem: { flexDirection: 'row', borderBottomColor: colors.border, borderBottomWidth: 1 },
  });

export default App;
