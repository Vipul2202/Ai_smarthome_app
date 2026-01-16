# 📱 Complete Mobile Setup Guide - Expo Go

## 🚀 **Quick Mobile Setup (3 steps)**

### **Step 1: Install Expo Go App**
Download Expo Go on your mobile device:
- **iOS**: [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779)
- **Android**: [Google Play - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

### **Step 2: Start Backend Server**
```bash
# Terminal 1: Start your backend
cd smart-home
npm run dev
```
✅ Backend runs on `http://localhost:4000`

### **Step 3: Start React Native App for Mobile**
```bash
# Terminal 2: Start React Native app configured for mobile
cd smart-home-frontend
npm install
npm run start:mobile
```

This will:
1. ✅ Detect your computer's IP address
2. ✅ Configure the app for mobile device access
3. ✅ Start the Expo development server
4. ✅ Show a QR code to scan

### **Step 4: Scan QR Code**
1. Open **Expo Go** app on your mobile device
2. **Scan the QR code** displayed in your terminal
3. Wait for the app to load on your device

## 📱 **Manual Mobile Configuration**

If automatic setup doesn't work, configure manually:

### **1. Find Your Computer's IP Address**

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter

**Mac/Linux:**
```bash
ifconfig
```
Look for "inet" address under your WiFi interface

**Example IP:** `192.168.1.100`

### **2. Update Environment Configuration**
```bash
# Get your IP and create mobile config
npm run setup-mobile

# Or manually update .env file:
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:4000
EXPO_PUBLIC_GRAPHQL_URL=http://YOUR_IP_ADDRESS:4000/graphql
EXPO_PUBLIC_UPLOAD_URL=http://YOUR_IP_ADDRESS:4000/upload
```

### **3. Start the App**
```bash
npm start
```

## 🔧 **Backend Configuration for Mobile**

Your backend needs to accept connections from your mobile device:

### **1. Update Backend CORS (if needed)**
In your `smart-home` backend, ensure CORS allows your IP:

```javascript
// In your backend CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://YOUR_IP_ADDRESS:3000',
    'exp://YOUR_IP_ADDRESS:19000', // Expo development
  ],
  credentials: true,
};
```

### **2. Verify Backend Accessibility**
Test if your backend is accessible from mobile network:
```bash
# Check if backend responds to your IP
curl http://YOUR_IP_ADDRESS:4000/health
```

## 📱 **Testing on Mobile Device**

### **Network Requirements**
- ✅ **Same WiFi Network**: Mobile device and computer must be on the same WiFi
- ✅ **Firewall**: Ensure Windows/Mac firewall allows connections on port 4000
- ✅ **Router**: Some routers block device-to-device communication

### **Testing Steps**
1. **Open Expo Go** app on your mobile device
2. **Scan QR code** from terminal
3. **Wait for app to load** (first load takes longer)
4. **Test authentication**:
   - Try logging in with existing credentials
   - Test registration flow
   - Verify forgot password

### **Features to Test on Mobile**
- ✅ **Authentication**: Login, register, forgot password
- ✅ **Navigation**: Tab navigation, screen transitions
- ✅ **UI**: Touch interactions, scrolling, forms
- ✅ **Native Features**: Camera permissions, notifications
- ✅ **Performance**: Loading times, animations

## 🔍 **Troubleshooting Mobile Issues**

### **QR Code Not Working**
1. **Manual Connection**: In Expo Go, tap "Enter URL manually"
2. **Enter**: `exp://YOUR_IP_ADDRESS:19000`

### **Connection Refused Errors**
1. **Check IP Address**: Ensure you're using the correct IP
2. **Firewall**: Disable firewall temporarily to test
3. **Network**: Try mobile hotspot if WiFi has restrictions

### **Backend Not Accessible**
```bash
# Test backend from another device
curl http://YOUR_IP_ADDRESS:4000/graphql

# Check if port 4000 is open
netstat -an | grep 4000
```

### **App Crashes or Won't Load**
1. **Clear Expo Cache**: Shake device → "Reload"
2. **Restart Expo Go**: Close and reopen the app
3. **Check Logs**: Look at terminal output for errors

### **Authentication Errors**
1. **Check API URLs**: Verify .env configuration
2. **Network Connectivity**: Test GraphQL endpoint
3. **CORS Issues**: Check backend CORS configuration

## 🎯 **Production Mobile Testing**

### **Using Expo Development Build**
For more advanced testing:
```bash
# Create development build
npx expo install --fix
eas build --profile development --platform android
```

### **Using Physical Device Debugging**
```bash
# Enable remote debugging
npm start -- --dev-client
```

## 📊 **Performance on Mobile**

### **Expected Performance**
- ✅ **Splash Screen**: Smooth animations
- ✅ **Authentication**: Fast login/register
- ✅ **Navigation**: Smooth transitions
- ✅ **Forms**: Responsive input handling
- ✅ **API Calls**: Quick GraphQL responses

### **Optimization Tips**
- Use WiFi for faster loading
- Close other apps for better performance
- Ensure good network signal strength

## 🎉 **Success Checklist**

When everything works, you should have:
- ✅ **Expo Go app** installed and working
- ✅ **QR code scanning** successful
- ✅ **App loads** on mobile device
- ✅ **Authentication** working (login/register)
- ✅ **Navigation** smooth between screens
- ✅ **Backend connectivity** established
- ✅ **All features** accessible on mobile

## 📞 **Need Help?**

**Common Commands:**
```bash
# Setup for mobile device
npm run start:mobile

# Switch back to localhost
npm run setup-localhost

# Check your IP address
npm run setup-mobile

# Force restart without backend check
npm run start:force
```

**Check Network:**
- Ensure same WiFi network
- Test backend accessibility
- Verify firewall settings
- Check router configuration

Your Smart Home app is now ready to run on mobile! 🚀📱