import { View, Text, StyleSheet, TextInput, Button, Alert, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { IconSymbol } from '@/components/ui/icon-symbol'
import * as SecureStore from 'expo-secure-store'

export default function practice() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const API_BASE_URL = 'http://172.17.24.213:5000/api'

  // Load user data from SecureStore on app start
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const userData = await SecureStore.getItemAsync('userData')
      if (userData) {
        const user = JSON.parse(userData)
        setCurrentUser(user)
        console.log('User data loaded from storage:', user)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const saveUserData = async (user) => {
    try {
      await SecureStore.setItemAsync('userData', JSON.stringify(user))
      console.log('User data saved to storage:', user)
    } catch (error) {
      console.error('Error saving user data:', error)
    }
  }

  const clearUserData = async () => {
    try {
      await SecureStore.deleteItemAsync('userData')
      console.log('User data cleared from storage')
    } catch (error) {
      console.error('Error clearing user data:', error)
    }
  }

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const endpoint = isLogin ? '/login' : '/register'
      const body = isLogin ? { email, password } : { name, email, password }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        Alert.alert('Success', data.message)
        if (isLogin) {
          console.log('Logged in user:', data.user)
          setCurrentUser(data.user)
          // Save user data to local storage
          await saveUserData(data.user)
          // Clear form fields
          setEmail('')
          setPassword('')
        } else {
          console.log('Registered user:', data.user)
          // Switch to login mode after successful registration
          setIsLogin(true)
          setPassword('')
        }
      } else {
        Alert.alert('Error', data.message || 'Something went wrong')
      }
    } catch (error) {
      console.error('API Error:', error)
      Alert.alert('Error', 'Network error. Please make sure the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setPassword('')
  }

  const handleLogout = async () => {
    await clearUserData()
    setCurrentUser(null)
    Alert.alert('Logged Out', 'You have been logged out successfully')
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        {currentUser ? (
          <View style={styles.userInfo}>
            <IconSymbol size={40} name="person.fill" color="#007AFF" />
            <Text style={styles.userName}>Welcome, {currentUser.name}!</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loginPrompt}>
            <IconSymbol size={40} name="person" color="#666" />
            <Text style={styles.loginPromptText}>Please login to continue</Text>
          </View>
        )}
      </View>

      {/* Login/Register Form - Only show when not logged in */}
      {!currentUser && (
        <View style={styles.formContainer}>
          <Text style={styles.heading}>{isLogin ? 'Login' : 'Register'}</Text>
          
          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="white"
              value={name}
              onChangeText={setName}
            />
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="white"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="white"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a'
  },
  profileHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  userInfo: {
    alignItems: 'center',
    padding: 20
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    marginBottom: 15
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  loginPrompt: {
    alignItems: 'center',
    padding: 20
  },
  loginPromptText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30
  },
  input: {
    borderWidth: 1,
    borderColor: 'white',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    color: 'white',
    width: '80%',
    fontSize: 16
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginTop: 20
  },
  buttonDisabled: {
    backgroundColor: '#666'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  toggleButton: {
    marginTop: 20
  },
  toggleText: {
    color: '#007AFF',
    fontSize: 14
  }
});