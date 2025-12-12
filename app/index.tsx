import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
    const [fileObject, setFileObject] = useState<FileSystem.File | null>(null);
    const [fileInfo, setFileInfo] = useState<string>('');
    const [errorText, setErrorText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const loadFileFromAsset = async () => {
        setErrorText('');
        setFileInfo('');
        setFileObject(null);

        try {
            setIsLoading(true);

            console.log('📂 Loading PDF from assets...');

            // Load the asset using expo-asset
            const asset = Asset.fromModule(require('../assets/pdf/sample.pdf'));
            await asset.downloadAsync();

            console.log('✅ Asset downloaded:', {
                uri: asset.uri,
                localUri: asset.localUri,
                name: asset.name,
                type: asset.type,
                hash: asset.hash,
            });

            // Read the file as base64 or binary to create a File object
            const fileUri = asset.localUri || asset.uri;
            
            if (!fileUri) {
                throw new Error('No valid URI from asset');
            }

            // Get file info
            const file = new FileSystem.File(fileUri);
            console.log('📄 File info:', file);

            if (!file.exists) {
                throw new Error('File does not exist');
            }

            console.log('🔍 Checking for contentUri...', file.contentUri);

            setFileObject(file);

            Alert.alert(
                'File Loaded',
                `File object created from asset\nName: ${file.name}\nSize: ${file.size} bytes\nType: ${file.type}`
            );

        } catch (error: any) {
            console.error('❌ Error loading file:', error);
            setErrorText(`Error: ${error.message}\n\n${JSON.stringify(error, null, 2)}`);
            Alert.alert('Error', `Failed to load file: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const openFileWithIntent = async () => {
        if (!fileObject) {
            Alert.alert('No File', 'Please load the file first');
            return;
        }

        if (Platform.OS !== 'android') {
            setErrorText('IntentLauncher is only available on Android');
            Alert.alert('Android Only', 'IntentLauncher is only available on Android');
            return;
        }

        try {
            setErrorText('');
            console.log('🚀 Attempting to open file with IntentLauncher...');

            const fileWithUri = fileObject as any;

            if (!fileWithUri.contentUri) {
                const error = 'contentUri is missing from the File object. This is the bug we are testing!';
                setErrorText(error);
                Alert.alert(
                    'ContentURI Missing',
                    error
                );
                console.error('❌', error);
                return;
            }

            console.log('📄 Using contentUri:', fileWithUri.contentUri);

            await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                data: fileWithUri.contentUri,
                flags: 1,
                type: 'application/pdf'
            });

            console.log('✅ File opened successfully with IntentLauncher');
            Alert.alert('Success', 'PDF opened with IntentLauncher');

        } catch (error: any) {
            const errorMsg = `Error opening file: ${error.message}\n\n${JSON.stringify(error, null, 2)}`;
            console.error('❌ Error opening file:', error);
            setErrorText(errorMsg);
            Alert.alert('Error', `Failed to open PDF: ${error.message}`);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>🧪 File Object + ContentURI Test</Text>
                <Text style={styles.description}>
                    This test loads a PDF from assets using expo-asset, creates a File object,
                    and checks if the contentUri property is present.
                </Text>

                <View style={styles.buttonContainer}>
                    <Pressable
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={loadFileFromAsset}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? '⏳ Loading...' : '📂 Load PDF from Assets'}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.button, styles.buttonTertiary, !fileObject && styles.buttonDisabled]}
                        onPress={openFileWithIntent}
                        disabled={!fileObject}
                    >
                        <Text style={styles.buttonText}>
                            📄 Open PDF with IntentLauncher
                        </Text>
                    </Pressable>
                </View>

                {fileObject && (
                    <View style={styles.selectedBox}>
                        <Text style={styles.infoTitle}>File Object:</Text>
                        <Text style={styles.infoText}>{JSON.stringify(fileObject, null, 2)}</Text>
                    </View>
                )}

                {errorText && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorTitle}>❌ Error:</Text>
                        <ScrollView style={styles.scrollableInfo} nestedScrollEnabled={true}>
                            <Text style={styles.errorText}>{errorText}</Text>
                        </ScrollView>
                    </View>
                )}

                <View style={styles.noteBox}>
                    <Text style={styles.noteTitle}>📝 Note:</Text>
                    <Text style={styles.noteText}>
                        This test creates a File object from an asset PDF and checks if contentUri is present.
                        Without contentUri, IntentLauncher cannot open the file.
                    </Text>
                    <Text style={styles.noteText}>
                        Platform: {Platform.OS}
                    </Text>
                    <Text style={styles.noteText}>
                        Version: {Platform.Version}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        gap: 12,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonSecondary: {
        backgroundColor: '#34C759',
    },
    buttonTertiary: {
        backgroundColor: '#FF9500',
    },
    buttonDisabled: {
        backgroundColor: '#888',
        opacity: 0.6,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    selectedBox: {
        backgroundColor: '#e8f5e9',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#a5d6a7',
    },
    infoBox: {
        backgroundColor: '#e8f4f8',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#b3d9e6',
        maxHeight: 400,
    },
    scrollableInfo: {
        maxHeight: 300,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#2c5282',
    },
    infoText: {
        fontSize: 14,
        color: '#2c5282',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginBottom: 4,
    },
    debugText: {
        fontSize: 12,
        color: '#333',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    errorBox: {
        backgroundColor: '#fee',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#fcc',
        maxHeight: 400,
    },
    errorTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#c00',
    },
    errorText: {
        fontSize: 12,
        color: '#900',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    noteBox: {
        backgroundColor: '#fff9e6',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffe066',
    },
    noteTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#996600',
    },
    noteText: {
        fontSize: 14,
        color: '#996600',
        marginBottom: 4,
        lineHeight: 20,
    },
});
