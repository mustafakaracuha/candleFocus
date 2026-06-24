import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { X, Camera, Image as ImageIcon } from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import colors from '../../theme/colors';

const CreatePostScreen = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const handleTakePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Hata', 'Kamera açılamadı.');
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Hata', 'Galeri açılamadı.');
    }
  };

  const handleShare = () => {
    if (!content.trim() && !imageUri) {
      Alert.alert('Hata', 'Lütfen paylaşmak için bir şeyler yazın veya fotoğraf ekleyin.');
      return;
    }

    // MOCK SHARE: normally we would send this to the backend
    Alert.alert('Başarılı', 'Gönderiniz paylaşıldı!', [
      { text: 'Tamam', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <X color={colors.textPrimary} size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Yeni Gönderi</Text>
        <TouchableOpacity 
          style={[styles.shareBtn, (!content && !imageUri) && styles.shareBtnDisabled]}
          onPress={handleShare}
          disabled={!content && !imageUri}
        >
          <Text style={styles.shareBtnText}>Paylaş</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Şu an ne üzerine odaklanıyorsun?"
          placeholderTextColor={colors.textSecondary}
          multiline
          autoFocus
          value={content}
          onChangeText={setContent}
        />
        
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity 
              style={styles.removeImageBtn}
              onPress={() => setImageUri(null)}
            >
              <X color={colors.textPrimary} size={20} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn} onPress={handlePickImage}>
          <ImageIcon color={colors.primary} size={24} />
          <Text style={styles.toolText}>Galeri</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={handleTakePhoto}>
          <Camera color={colors.primary} size={24} />
          <Text style={styles.toolText}>Kamera</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  shareBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareBtnDisabled: {
    opacity: 0.5,
  },
  shareBtnText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  inputContainer: {
    flex: 1,
    padding: 20,
  },
  textInput: {
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 26,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imageContainer: {
    marginTop: 20,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 15,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    borderRadius: 15,
  },
  toolText: {
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '600',
  }
});

export default CreatePostScreen;
