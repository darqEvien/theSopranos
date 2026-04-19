import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { type Comment } from './useComments';
import { useStore } from '../store/useStore';

export function useUserComments() {
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const { user } = useStore();

  useEffect(() => {
    if (!user) {
      setUserComments([]);
      setLoadingComments(false);
      return;
    }

    const q = query(
      collection(db, 'comments'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Comment[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as Comment);
      });
      setUserComments(fetched);
      setLoadingComments(false);
    }, (error) => {
      console.warn("Profil yorumları çekilirken hata (Index hatası olabilir):", error.message);
      setLoadingComments(false);
    });

    return () => unsubscribe();
  }, [user]);

  const removeComment = useCallback(async (commentId: string) => {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (error) {
      console.error("Yorum silme hatası:", error);
      throw error;
    }
  }, []);

  const editComment = useCallback(async (commentId: string, newText: string, newRating: number) => {
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        text: newText.trim(),
        rating: newRating
      });
    } catch (error) {
      console.error("Yorum güncelleme hatası:", error);
      throw error;
    }
  }, []);

  return {
    userComments,
    loadingComments,
    removeComment,
    editComment
  };
}
