import { useColorScheme as useColorSchemeNative } from 'react-native';
import { useState, useEffect } from 'react';

export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState('light');
  const nativeColorScheme = useColorSchemeNative();

  useEffect(() => {
    if (nativeColorScheme) {
      setColorScheme(nativeColorScheme);
    }
  }, [nativeColorScheme]);

  return {
    colorScheme,
    setColorScheme,
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',
  };
}
