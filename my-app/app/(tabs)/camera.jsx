import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Image, 
  ActivityIndicator,
  Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState('back');
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [galleryPermission, setGalleryPermission] = useState(null);
  const [testMode, setTestMode] = useState(false); // Testing mode
  const cameraRef = useRef(null);

  useEffect(() => {
    checkGalleryPermission();
  }, []);

  const checkGalleryPermission = async () => {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      setGalleryPermission(status === 'granted');
    } catch (error) {
      console.log('Gallery permission check failed:', error);
      setGalleryPermission(false);
    }
  };

  const requestGalleryPermission = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setGalleryPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.log('Gallery permission request failed:', error);
      setGalleryPermission(false);
      return false;
    }
  };

  const handlePermissionRequest = async () => {
    setIsLoading(true);
    try {
      const result = await requestPermission();
      
      if (result.granted) {
        Alert.alert('Success', 'Camera permission granted!');
      } else {
        Alert.alert(
          'Permission Required', 
          'Camera access is required to take photos. Please enable camera permission in your device settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert('Error', 'Failed to request camera permission');
    } finally {
      setIsLoading(false);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || !permission?.granted) return;

    setIsLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      setCapturedImage(photo);
      console.log('Photo taken:', photo);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take picture');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImageFromGallery = async () => {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setCapturedImage(result.assets[0]);
        console.log('Image picked:', result.assets[0]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    } finally {
      setIsLoading(false);
    }
  };

  const saveToGallery = async () => {
    if (!capturedImage) return;

    if (!galleryPermission) {
      const granted = await requestGalleryPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Gallery access is required to save photos. Please enable storage permission in settings.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      const asset = await MediaLibrary.createAssetAsync(capturedImage.uri);
      await MediaLibrary.createAlbumAsync('MyAppCamera', asset, false);
      Alert.alert('Success', 'Image saved to gallery!');
      console.log('Image saved to gallery');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save image to gallery');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCameraType = () => {
    setCameraType(cameraType === 'back' ? 'front' : 'back');
  };

  const resetCamera = () => {
    setCapturedImage(null);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Checking permissions...</Text>
          
          {/* Testing Controls */}
          <View style={styles.testControls}>
            <Text style={styles.testTitle}>🧪 Test Permission States:</Text>
            <TouchableOpacity style={styles.testButton} onPress={() => setTestMode('denied')}>
              <Text style={styles.testButtonText}>Simulate Denied</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.testButton} onPress={() => setTestMode('granted')}>
              <Text style={styles.testButtonText}>Simulate Granted</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (testMode === 'denied') {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <IconSymbol size={60} name="camera" color="#666" />
          <Text style={styles.title}>Camera Permission Required</Text>
          <Text style={styles.subtitle}>
            This app needs camera access to take photos. Please grant permission to continue.
          </Text>
          
          <TouchableOpacity style={styles.permissionButton} onPress={() => setTestMode('granted')}>
            <Text style={styles.buttonText}>Grant Camera Permission</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.testButton} onPress={() => setTestMode(false)}>
            <Text style={styles.testButtonText}>Exit Test Mode</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (testMode === 'granted' || !permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <IconSymbol size={60} name="camera" color="#666" />
          <Text style={styles.title}>Camera Permission Required</Text>
          <Text style={styles.subtitle}>
            This app needs camera access to take photos. Please grant permission to continue.
          </Text>
          
          <TouchableOpacity 
            style={[styles.permissionButton, isLoading && styles.buttonDisabled]} 
            onPress={handlePermissionRequest}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Grant Camera Permission</Text>
            )}
          </TouchableOpacity>
          
          <Text style={styles.note}>
            You can change this anytime in your device settings
          </Text>
        </View>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage.uri }} style={styles.previewImage} />
        
        <View style={styles.previewActions}>
          <TouchableOpacity style={styles.actionButton} onPress={resetCamera}>
            <IconSymbol size={24} name="xmark" color="white" />
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={saveToGallery}>
            <IconSymbol size={24} name="square.and.arrow.down" color="white" />
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
        
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Saving...</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        onCameraReady={() => setIsCameraReady(true)}
      />
      
      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.controlButton} onPress={pickImageFromGallery}>
          <IconSymbol size={30} name="photo" color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.captureButton, !isCameraReady && styles.buttonDisabled]} 
          onPress={takePicture}
          disabled={!isCameraReady}
        >
          <View style={styles.captureInner} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
          <IconSymbol size={30} name="camera.rotate" color="white" />
        </TouchableOpacity>
      </View>
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  note: {
    fontSize: 12,
    color: '#888',
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
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  controlButton: {
    padding: 15,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
  },
  previewImage: {
    flex: 1,
  },
  previewActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testControls: {
    marginTop: 30,
    alignItems: 'center',
  },
  testTitle: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  testButton: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginVertical: 5,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
  },
});
