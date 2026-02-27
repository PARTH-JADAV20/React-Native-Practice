# Camera Feature Documentation

## Overview
This document explains the complete camera implementation in our React Native app using Expo Camera, Image Picker, and Media Library.

## Features Implemented
- 📸 **Camera Capture**: Take photos using device camera
- 🖼️ **Image Picker**: Select images from device gallery
- 💾 **Save to Gallery**: Save captured photos to device gallery
- 🔐 **Permission Handling**: Request and manage camera/storage permissions
- 🔄 **Camera Switch**: Toggle between front and back cameras
- 📱 **Cross-Platform**: Works on both iOS and Android

## Libraries Used

### 1. Expo Camera (`expo-camera`)
**Purpose**: Native camera functionality
**Installation**: `npm install expo-camera`

**Key Features**:
- Access device camera
- Take photos and videos
- Switch between front/back cameras
- Flash control
- Focus and exposure control

**Usage Example**:
```javascript
import { Camera } from 'expo-camera';

<Camera
  ref={cameraRef}
  style={styles.camera}
  type={cameraType}
  onCameraReady={() => setIsCameraReady(true)}
/>
```

### 2. Expo Image Picker (`expo-image-picker`)
**Purpose**: Access device photo gallery
**Installation**: `npm install expo-image-picker`

**Key Features**:
- Access photo library
- Select images/videos
- Built-in image editor
- Multiple selection support

**Usage Example**:
```javascript
import * as ImagePicker from 'expo-image-picker';

const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.8,
});
```

### 3. Expo Media Library (`expo-media-library`)
**Purpose**: Save and access device media files
**Installation**: `npm install expo-media-library`

**Key Features**:
- Save photos/videos to gallery
- Create albums
- Access media metadata
- Delete media files

**Usage Example**:
```javascript
import * as MediaLibrary from 'expo-media-library';

const asset = await MediaLibrary.createAssetAsync(photoUri);
await MediaLibrary.createAlbumAsync('MyAppCamera', asset, false);
```

## Permission System

### Types of Permissions Required

#### 1. Camera Permission
- **Purpose**: Access device camera
- **iOS**: `NSCameraUsageDescription`
- **Android**: `android.permission.CAMERA`

#### 2. Storage/Media Permission
- **Purpose**: Save photos to gallery
- **iOS**: `NSPhotoLibraryAddUsageDescription`
- **Android**: `android.permission.WRITE_EXTERNAL_STORAGE`

### Permission Implementation

#### Step 1: Request Permissions
```javascript
const checkPermissions = async () => {
  // Camera permission
  const cameraStatus = await Camera.requestCameraPermissionsAsync();
  
  // Gallery permission (platform-specific)
  if (Platform.OS === 'android') {
    const galleryStatus = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );
  } else {
    const galleryStatus = await MediaLibrary.requestPermissionsAsync();
  }
};
```

#### Step 2: Handle Permission States
- **granted**: Permission is available
- **denied**: Permission was denied by user
- **undetermined**: Permission hasn't been requested yet

#### Step 3: Permission Modal
The app shows a modal explaining why permissions are needed before requesting them.

## Camera Component Architecture

### State Management
```javascript
const [hasPermission, setHasPermission] = useState(null);
const [cameraPermission, setCameraPermission] = useState(null);
const [galleryPermission, setGalleryPermission] = useState(null);
const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
const [capturedImage, setCapturedImage] = useState(null);
const [isCameraReady, setIsCameraReady] = useState(false);
```

### Key Functions

#### 1. Take Picture
```javascript
const takePicture = async () => {
  if (!cameraRef.current) return;
  
  const photo = await cameraRef.current.takePictureAsync({
    quality: 0.8,
    base64: false,
  });
  setCapturedImage(photo);
};
```

#### 2. Pick from Gallery
```javascript
const pickImageFromGallery = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });
  
  if (!result.canceled) {
    setCapturedImage(result.assets[0]);
  }
};
```

#### 3. Save to Gallery
```javascript
const saveToGallery = async () => {
  const asset = await MediaLibrary.createAssetAsync(capturedImage.uri);
  await MediaLibrary.createAlbumAsync('MyAppCamera', asset, false);
  Alert.alert('Success', 'Image saved to gallery!');
};
```

## Platform-Specific Considerations

### iOS
- Uses Photos framework
- Automatic album creation
- No explicit storage permission needed for saving

### Android
- Requires WRITE_EXTERNAL_STORAGE permission
- Saves to Downloads folder by default
- May need additional permissions on newer Android versions

## User Interface Flow

### 1. Permission Request
- Modal appears on app launch
- Explains why permissions are needed
- User can grant or deny permissions

### 2. Camera View
- Live camera preview
- Control buttons for capture, gallery, and switch
- Loading states and error handling

### 3. Photo Preview
- Shows captured/selected photo
- Options to retake or save
- Loading indicator during save operation

## Error Handling

### Common Errors and Solutions

#### 1. Permission Denied
```javascript
if (!hasPermission) {
  return (
    <View>
      <Text>No camera permission</Text>
      <Button onPress={checkPermissions} title="Retry" />
    </View>
  );
}
```

#### 2. Camera Not Available
```javascript
try {
  const photo = await cameraRef.current.takePictureAsync();
} catch (error) {
  Alert.alert('Error', 'Failed to take picture');
}
```

#### 3. Save Failed
```javascript
try {
  await MediaLibrary.createAssetAsync(photoUri);
} catch (error) {
  Alert.alert('Error', 'Failed to save image');
}
```

## Best Practices

### 1. Permission UX
- Explain why permissions are needed
- Provide clear retry options
- Handle graceful degradation

### 2. Performance
- Use appropriate image quality (0.8 for good balance)
- Clean up camera references
- Handle memory management

### 3. User Experience
- Show loading states
- Provide clear feedback
- Allow easy retry options

## Configuration Required

### app.json Permissions
```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera"
        }
      ],
      [
        "expo-media-library",
        {
          "photosPermission": "Allow $(PRODUCT_NAME) to access your photos",
          "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos"
        }
      ]
    ]
  }
}
```

### Android Permissions (app.json)
```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

## Testing Considerations

### 1. Permission Testing
- Test on both iOS and Android
- Test permission denial scenarios
- Test app restart with saved permissions

### 2. Camera Testing
- Test on different devices
- Test front/back camera switching
- Test in different lighting conditions

### 3. Gallery Testing
- Test save functionality
- Test album creation
- Test with existing photos

## Troubleshooting

### Common Issues

#### 1. Camera Not Working
- Check permissions in device settings
- Ensure camera hardware is available
- Restart the app

#### 2. Save to Gallery Failing
- Check storage permissions
- Ensure sufficient storage space
- Check if album already exists

#### 3. Image Picker Not Opening
- Check gallery permissions
- Ensure photos exist in gallery
- Test on different devices

## Future Enhancements

### Possible Additions
- Video recording
- Image filters
- Multiple photo selection
- Cloud storage integration
- Image compression options
- Camera settings (flash, focus, etc.)

### Advanced Features
- Real-time filters
- Face detection
- QR code scanning
- Document scanning
- Panorama mode

## Security Considerations

### Data Protection
- Images are stored locally only
- No network transmission of photos
- User has full control over saved images

### Privacy
- Clear permission explanations
- User can revoke permissions anytime
- No access to other photos in gallery

## Conclusion

This camera implementation provides a complete, production-ready solution for photo capture and management in React Native apps using Expo. It handles permissions properly, works across platforms, and provides a good user experience with proper error handling and feedback.
