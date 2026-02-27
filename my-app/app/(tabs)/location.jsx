import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  Platform
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function LocationScreen() {
  const colorScheme = useColorScheme();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    checkLocationPermission();
  }, []);

  useEffect(() => {
    // Cleanup location subscription when component unmounts
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [locationSubscription]);

  const checkLocationPermission = async () => {
    setIsLoading(true);
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        setPermissionStatus(newStatus);
        
        if (newStatus !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          Alert.alert(
            'Location Permission Required',
            'This app needs location access to show your current position. Please enable location in your device settings.',
            [{ text: 'OK' }]
          );
        } else {
          getCurrentLocation();
        }
      } else {
        getCurrentLocation();
      }
    } catch (error) {
      setErrorMsg('Error checking location permission');
      console.error('Location permission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(locationData);
      setMapRegion({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      setErrorMsg('Unable to get location. Please ensure GPS is enabled.');
      console.error('Location error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const watchLocation = async () => {
    if (isTracking) {
      // Stop tracking
      if (locationSubscription) {
        locationSubscription.remove();
        setLocationSubscription(null);
      }
      setIsTracking(false);
      return;
    }

    setIsLoading(true);
    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 2000, // Update every 2 seconds
          distanceInterval: 5, // Update if moved 5 meters
        },
        (newLocation) => {
          setLocation(newLocation);
          setMapRegion({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          console.log('Updated location:', newLocation);
        }
      );

      setLocationSubscription(subscription);
      setIsTracking(true);
    } catch (error) {
      setErrorMsg('Unable to watch location');
      console.error('Watch location error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCoordinates = (coords) => {
    if (!coords) return 'N/A';
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const calculateSpeed = (location) => {
    if (!location?.coords?.speed) return 'N/A';
    return `${(location.coords.speed * 3.6).toFixed(2)} km/h`;
  };

  const requestPermissionAgain = () => {
    checkLocationPermission();
  };

  if (permissionStatus === null) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Checking location permissions...</Text>
        </View>
      </View>
    );
  }

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <IconSymbol size={60} name="location" color="#666" />
          <Text style={styles.title}>Location Permission Required</Text>
          <Text style={styles.subtitle}>
            This app needs location access to show your current position and provide location-based features.
          </Text>
          
          <TouchableOpacity 
            style={[styles.permissionButton, isLoading && styles.buttonDisabled]} 
            onPress={requestPermissionAgain}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Grant Location Permission</Text>
            )}
          </TouchableOpacity>
          
          <Text style={styles.note}>
            You can change this anytime in your device settings
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={colorScheme.isDark ? "light-content" : "dark-content"} 
        backgroundColor={colorScheme.isDark ? Colors.dark.background : Colors.light.background}
        translucent={false}
        hidden={false}
      />
      <View style={[styles.header, { 
        backgroundColor: colorScheme.isDark ? Colors.dark.background : Colors.light.background,
        borderBottomColor: colorScheme.isDark ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault,
        paddingTop: Platform.OS === 'ios' ? 70 : 40
      }]}>
        <IconSymbol size={40} name="location" color="#007AFF" />
        <Text style={[styles.headerTitle, { color: colorScheme.isDark ? Colors.dark.text : Colors.light.text }]}>GPS Location Tracker</Text>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Getting location...</Text>
        </View>
      )}

      {errorMsg && (
        <View style={styles.errorContainer}>
          <IconSymbol size={24} name="exclamationmark.triangle" color="#FF3B30" />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getCurrentLocation}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map View */}
      <MapView
        style={styles.map}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={isTracking}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            description={`Lat: ${location.coords.latitude.toFixed(6)}, Lng: ${location.coords.longitude.toFixed(6)}`}
          />
        )}
      </MapView>

      {/* Location Info Panel */}
      {location && !errorMsg && (
        <View style={styles.infoPanel}>
          <View style={styles.infoHeader}>
            <IconSymbol size={20} name="location.fill" color="#007AFF" />
            <Text style={styles.infoTitle}>Current Location</Text>
          </View>
          
          <ScrollView style={styles.infoContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Coordinates:</Text>
              <Text style={styles.infoValue}>{formatCoordinates(location.coords)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Altitude:</Text>
              <Text style={styles.infoValue}>
                {location.coords.altitude ? `${location.coords.altitude.toFixed(2)} m` : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Accuracy:</Text>
              <Text style={styles.infoValue}>
                {location.coords.accuracy ? `±${location.coords.accuracy.toFixed(2)} m` : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Speed:</Text>
              <Text style={styles.infoValue}>{calculateSpeed(location)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Heading:</Text>
              <Text style={styles.infoValue}>
                {location.coords.heading ? `${location.coords.heading.toFixed(2)}°` : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Timestamp:</Text>
              <Text style={styles.infoValue}>{formatTimestamp(location.timestamp)}</Text>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={getCurrentLocation}>
          <IconSymbol size={20} name="location" color="white" />
          <Text style={styles.actionButtonText}>Get Current</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, isTracking && styles.trackingButton]} 
          onPress={watchLocation}
        >
          <IconSymbol size={20} name={isTracking ? "pause" : "play"} color="white" />
          <Text style={styles.actionButtonText}>
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 0,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 200,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#666',
    marginTop: 10,
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#fff2f0',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffcccc',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  infoPanel: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    maxHeight: 200,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  infoContent: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'right',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  trackingButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
