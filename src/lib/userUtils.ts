import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile, type User } from 'firebase/auth';

/**
 * Kullanıcı adının benzersizliğini sağlamak için Firestore işlemleri.
 * 'usernames' koleksiyonunda {id: lowercase(username), value: uid} şeklinde tutarız.
 */

// Kullanıcı adı uygunluğunu kontrol et
export const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  if (!username || username.trim().length < 3) return false;
  const usernameLower = username.trim().toLowerCase();

  try {
    const docRef = doc(db, 'usernames', usernameLower);
    const docSnap = await getDoc(docRef);
    return !docSnap.exists(); // Eğer yoksa uygundur (true)
  } catch (error) {
    console.error("Username check error", error);
    return false;
  }
};

// İlk kayıt veya Google ile girişte tamamlanan profili kaydet
export const completeUserProfile = async (
  user: User,
  username: string,
  photoPath: string | null
): Promise<void> => {
  const usernameLower = username.trim().toLowerCase();
  const cleanUsername = username.trim();

  // 1. Transactionally username'i al (basit metod)
  try {
    const isAvailable = await checkUsernameAvailable(username);
    if (!isAvailable) {
      throw new Error("Bu kullanıcı adı daha önce alınmış.");
    }

    // Auth'u güncelle
    await updateProfile(user, {
      displayName: cleanUsername,
      photoURL: photoPath || 'default'
    });

    // Username mapping'i rezerve et
    await setDoc(doc(db, 'usernames', usernameLower), {
      uid: user.uid,
      original: cleanUsername,
      createdAt: new Date().toISOString()
    });

    // Kullanıcı detaylarını sakla
    await setDoc(doc(db, 'users', user.uid), {
      username: cleanUsername,
      email: user.email,
      photoURL: photoPath || 'default',
      createdAt: new Date().toISOString()
    }, { merge: true });

  } catch (error) {
    console.error("Profil tamamlama hatası:", error);
    throw error;
  }
};
