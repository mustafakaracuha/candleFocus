import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle, Share2, Plus } from 'lucide-react-native';
import colors from '../../theme/colors';

// MOCK DATA for the feed
const INITIAL_POSTS = [
  {
    id: '1',
    user: 'Ayşe Yılmaz',
    time: '2 saat önce',
    content: 'Bugün 2 saat kesintisiz matematik çalıştım! Harika bir odaklanma seansıydı. 🕯️📚',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000',
    likes: 24,
    focusTime: '120dk'
  },
  {
    id: '2',
    user: 'Can Gök',
    time: '4 saat önce',
    content: 'Gece çalışmaları her zaman daha verimli oluyor. Herkese iyi çalışmalar!',
    image: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&q=80&w=1000',
    likes: 15,
    focusTime: '45dk'
  }
];

const CommunityFeedScreen = ({ navigation }) => {
  const [posts, setPosts] = useState(INITIAL_POSTS);

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.user.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{item.user}</Text>
            <Text style={styles.postTime}>{item.time}</Text>
          </View>
        </View>
        <View style={styles.focusBadge}>
          <Text style={styles.focusBadgeText}>🔥 {item.focusTime}</Text>
        </View>
      </View>
      
      <Text style={styles.postContent}>{item.content}</Text>
      
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} />
      )}
      
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Heart color={colors.textSecondary} size={22} />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <MessageCircle color={colors.textSecondary} size={22} />
          <Text style={styles.actionText}>Yorumlar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Share2 color={colors.textSecondary} size={22} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Topluluk</Text>
        <TouchableOpacity 
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Plus color={colors.background} size={20} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 100,
  },
  createBtnText: {
    color: colors.background,
    fontWeight: '600',
    marginLeft: 4,
  },
  listContent: {
    padding: 15,
  },
  postContainer: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  userName: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  postTime: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  focusBadge: {
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  focusBadgeText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  postContent: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
  },
  actionText: {
    color: colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  }
});

export default CommunityFeedScreen;
