import React, { useState, useEffect } from 'react';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import {
  Dimensions, View, StyleSheet, Text,
} from 'react-native';
import ActionList from '../components/ActionList';
import FilterAction from '../components/FilterAction';
import Splash from './Splash';
// localhost
const URL = 'http://192.168.1.148:3001'; //131 -> Home


const Main = ({ navigation }) => {
  // states
  const [actions, setActions] = useState([]);
  const [user, setUser] = useState([]);
  const [filter, setFilter] = useState([]);
  const [progressWithOnComplete, setProgressWithOnComplete] = useState(user.curr_exp);
  const [loading, setLoading] = useState(true);

  // get userID and userToken after login
  const userName = navigation.getParam('userName', 'No-USER');
  const password = navigation.getParam('password', 'No-PASSWORD');
  const token = navigation.getParam('token', 'No-TOKEn');

  console.log(userName, password, token);

  // set width of progress bar
  const barWidth = Dimensions.get('screen').width - 150;

  // progressbar increase
  const increaseExp = (value) => {
    const updatedValue = { curr_exp: value + user.curr_exp };
    if (updatedValue.curr_exp <= 100) {
      const updatedUser = Object.assign(user, updatedValue);
      // add experience to progressbar
      setProgressWithOnComplete(prev => prev + value);
      // update current experience of user
      setUser(updatedUser);
      // update current experience of user in database
      updateUser(updatedUser);
    } else {
      const remainingExp = updatedValue.curr_exp - 100;
      nextLevel(remainingExp);
      // set progessbar to the overachieved points
      setProgressWithOnComplete(remainingExp);
      navigation.navigate('LevelUp');
    }
  };


  // level up
  const nextLevel = (exp) => {
    const updatedValue = { curr_level: ++user.curr_level, curr_exp: exp };
    const updatedUser = Object.assign(user, updatedValue);
    setUser(updatedUser);
    // update new level and experience of user
    updateUser(updatedUser);
  }

  // load user
  useEffect(() => {
    fetch(`${URL}/user`)
      .then(response => response.json())
      .then((data) => {
        setUser(data[0]);
        setProgressWithOnComplete(data[0].curr_exp);
      })
      // eslint-disable-next-line no-console
      .catch(error => console.error(error));
  }, []);

  // load all actions
  useEffect(() => {
    fetch(`${URL}/actions`)
      .then(response => response.json())
      .then((data) => {
        setActions(data);
        setFilter(data);
        // load main.js after 1500ms
        setTimeout(() => {
          setLoading(false);
        }, 1000);

      })
      // eslint-disable-next-line no-console
      .catch(error => console.error(error));
  }, []);


  // update current user experience and level
  const updateUser = (data) => {
    fetch(`${URL}/user`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => response.json())
      // eslint-disable-next-line no-console
      .then(updatedUser => setUser(updatedUser))
      // eslint-disable-next-line no-console
      .catch(error => console.error(error));
  };

  // filter for actions
  const filterActions = (difficulty) => {
    const filteredActions = actions.filter(elements => elements.difficulty === difficulty);
    setFilter(filteredActions);
  };

  // create Progressbar
  const createProgressbar = () => {
    return (
      <>
        <Text>
          Lvl
          {' '}
          {user.curr_level}
        </Text>
        <ProgressBarAnimated
          width={barWidth}
          value={progressWithOnComplete}
          maxValue={100}
          backgroundColor="#dc6286"
          onComplete={() => {
            props.navigation.navigate('LevelUp');
            setProgressWithOnComplete(0);
            // set user experience to 0
            nextLevel(0);
          }}
        />
        <Text>
          Lvl
          {' '}
          {user.curr_level + 1}
        </Text>
      </>
    )
  }

  if (loading === true) {
    return <Splash />
  } else {
    return (
      <>
        <View style={styles.progessBar}>{createProgressbar()}</View>
        <FilterAction filter={filterActions} />
        <ActionList actions={filter} addExp={increaseExp} />
      </>
    );
  }
};

const styles = StyleSheet.create({
  progessBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
    padding: 15,
  },
});

export default Main;