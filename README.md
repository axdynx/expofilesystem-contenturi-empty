# Expo FileSystem ContentURI Bug Test

## 🐛 Bug Description

This test project demonstrates a critical bug with `expo-file-system`: when creating a File object from an asset, the `contentUri` property is **never present** in the final File object, even though it should be available according to the File API specification.

### The Problem:

1. **Load Asset**: Use `expo-asset` to load a PDF file from the app bundle
2. **Create File Object**: Create a `FileSystem.File` object from the asset URI
3. **Missing ContentUri**: The `contentUri` property is **never present** in the File object ❌
4. **Cannot Open File**: Without `contentUri`, `IntentLauncher` cannot open the file on Android

### Impact:

- Files loaded from assets cannot be opened with external apps on Android
- The File API is incomplete and doesn't match expected behavior
- Applications requiring `contentUri` for sharing or viewing files will fail

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ 
- Expo CLI
- Android device or emulator (to test IntentLauncher)

### Installation Steps

1. **Clone or download this repository**

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Run on Android** (required to test IntentLauncher)
```bash
npm run android
```

## 📋 How to Reproduce the Bug

### Step 1: Load the PDF
1. Open the app on your Android device
2. Tap the **"📂 Load PDF from Assets"** button
3. The app will:
   - Load `assets/pdf/sample.pdf` using `expo-asset`
   - Create a `FileSystem.File` object from the asset URI
   - Display the complete File object on screen

### Step 2: Inspect the File Object
- Look at the **"File Object"** section displayed on screen
- Check if `contentUri` property is present
- **Expected**: `contentUri` should contain an Android content URI
- **Actual**: `contentUri` is **missing** ❌

### Step 3: Attempt to Open the File
1. Tap the **"📄 Open PDF with IntentLauncher"** button
2. The app will attempt to open the PDF using:
```typescript
await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: file.contentUri,  // This will be undefined/null!
    flags: 1,
    type: 'application/pdf'
});
```
3. **Result**: Error message will appear because `contentUri` is missing

## 🔧 Technical Details

### Code Flow

```typescript
// 1. Load asset
const asset = Asset.fromModule(require('../assets/pdf/sample.pdf'));
await asset.downloadAsync();

// 2. Create File object
const file = new FileSystem.File(asset.localUri || asset.uri);

// 3. Check for contentUri
console.log(file.contentUri);  // ❌ undefined/null

// 4. Attempt to use with IntentLauncher
await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: file.contentUri,  // ❌ Will fail - contentUri is missing
    flags: 1,
    type: 'application/pdf'
});
```

### Expected Behavior
- The `FileSystem.File` object should have a `contentUri` property on Android
- The `contentUri` should be a valid Android content URI (e.g., `content://...`)
- This URI should be usable with `IntentLauncher` to open the file in external apps

### Actual Behavior
- The `FileSystem.File` object **does not have** a `contentUri` property
- Only basic properties are available: `uri`, `name`, `size`, `type`, `exists`
- Cannot open files with `IntentLauncher` or share them with other Android apps

## 📊 Project Structure

```
expofilesystem-contenturi-empty/
├── app/
│   ├── _layout.tsx          # App layout with expo-router
│   └── index.tsx             # Main test screen
├── assets/
│   └── pdf/
│       └── sample.pdf        # Test PDF file
├── app.json                  # Expo configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🎯 Expected vs Actual Output

### Expected File Object
```json
{
  "uri": "file:///data/user/0/com.test.app/files/sample.pdf",
  "name": "sample.pdf",
  "size": 13264,
  "type": "application/pdf",
  "exists": true,
  "contentUri": "content://com.test.app.provider/files/sample.pdf"  // ✅ Should be present
}
```

### Actual File Object (Bug)
```json
{
  "uri": "file:///data/user/0/com.test.app/files/sample.pdf",
  "name": "sample.pdf",
  "size": 13264,
  "type": "application/pdf",
  "exists": true
  // ❌ contentUri is MISSING
}
```

## 📱 App Features

### Button 1: Load PDF from Assets
- Loads the PDF file from `assets/pdf/sample.pdf`
- Creates a `FileSystem.File` object
- Displays the complete File object as JSON on screen
- Shows whether `contentUri` is present or missing

### Button 2: Open PDF with IntentLauncher
- Attempts to open the PDF using Android's IntentLauncher
- Requires `contentUri` to work properly
- Will display an error if `contentUri` is missing (the bug we're testing)
- Only available on Android

## 🧪 Testing Checklist

- [ ] Install dependencies with `npm install`
- [ ] Start the app with `npm start`
- [ ] Run on Android device/emulator
- [ ] Tap "Load PDF from Assets"
- [ ] Verify File object is displayed on screen
- [ ] Check if `contentUri` property is present
- [ ] Tap "Open PDF with IntentLauncher"
- [ ] Observe the error due to missing `contentUri`

## 📊 Environment

- **Expo SDK**: ~54.0.29
- **expo-file-system**: ~19.0.21
- **expo-asset**: ~12.0.11
- **expo-intent-launcher**: ~13.0.8
- **React Native**: ~0.83.0
- **Platform**: Android (iOS doesn't use contentUri)

## 🤝 Contributing

This is a bug reproduction test case. When testing:

1. Follow the exact reproduction steps
2. Document the complete File object output
3. Include device/Android version information
4. Capture console logs and error messages
5. Note any differences in behavior across Android versions

The goal is to provide a clear, reproducible case for the Expo team to investigate the missing `contentUri` property in the `FileSystem.File` API.

## 📝 Related Issues

This bug prevents:
- Opening files with external Android apps
- Sharing files with other applications
- Using Android's native file sharing mechanisms
- Proper integration with Android's file provider system

The `contentUri` is essential for Android's file sharing and viewing capabilities.
