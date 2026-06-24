import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../../theme/colors';

const TimerDisplay = ({ timeRemaining, isHidden, onPress }) => {
  if (isHidden) {
    return (
      <TouchableOpacity style={styles.hiddenContainer} onPress={onPress}>
        <Text style={styles.hiddenText}>Tap to show timer</Text>
      </TouchableOpacity>
    );
  }

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.timerText}>
        {formattedMinutes}:{formattedSeconds}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  hiddenContainer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.3,
  },
  hiddenText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '400',
  },
});

export default TimerDisplay;
