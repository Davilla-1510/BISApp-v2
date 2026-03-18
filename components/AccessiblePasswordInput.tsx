import React, { useState, useCallback, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { AccessibleTextInput } from './AccessibleTextInput';

interface AccessiblePasswordInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: boolean;
  accessibilityLabel?: string;
}

export const AccessiblePasswordInput = React.forwardRef<
  TextInput,
  AccessiblePasswordInputProps
>(
  (
    {
      placeholder,
      value,
      onChangeText,
      label,
      error = false,
      accessibilityLabel,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = useCallback(() => {
      setShowPassword((prev) => !prev);
    }, []);

    return (
      <View style={styles.container}>
        <AccessibleTextInput
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          label={label}
          error={error}
          accessibilityLabel={accessibilityLabel}
          speakLabel={true}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={toggleShowPassword}
          accessibilityLabel={
            showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
          }
          accessibilityRole="button"
        >
          <Text style={styles.eyeText}>{showPassword ? '👁️' : '🙈'}</Text>
        </TouchableOpacity>
      </View>
    );
  }
);

AccessiblePasswordInput.displayName = 'AccessiblePasswordInput';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeText: {
    fontSize: 18,
  },
});
