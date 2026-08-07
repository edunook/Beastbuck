import { db } from '@services/firebase/config';
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { DEFAULT_ACHIEVEMENTS, getAchievementById } from '@shared/constants/achievements';

export const XP_REWARD_TYPES = {
  TASK: 'TASK',
  EXPERIMENT: 'EXPERIMENT',
  PRODUCT: 'PRODUCT',
  ACHIEVEMENT: 'ACHIEVEMENT',
  CEO_BONUS: 'CEO_BONUS',
  CHALLENGE_WIN: 'CHALLENGE_WIN',
  COURSE_COMPLETION: 'COURSE_COMPLETION',
  QUIZ_EXCELLENCE: 'QUIZ_EXCELLENCE',
  PATH_COMPLETION: 'PATH_COMPLETION',
  KNOWLEDGE_PUBLISHED: 'KNOWLEDGE_PUBLISHED',
};

export const LEVEL_XP = 500;

export function calculateStreakXP(streakDay = 1) {
  const day = Math.max(1, Math.floor(streakDay || 1));
  if (day <= 10) {
    return day * 10;
  }
  return 100;
}

export function calculateLevel(xp = 0) {
  return Math.max(1, Math.floor(Number(xp || 0) / LEVEL_XP) + 1);
}

export function getLevelProgress(xp = 0) {
  const currentXP = Number(xp || 0);
  const level = calculateLevel(currentXP);
  const levelStart = (level - 1) * LEVEL_XP;
  const progressXP = Math.max(0, currentXP - levelStart);

  return {
    level,
    currentXP,
    progressXP,
    nextLevelXP: LEVEL_XP,
    remainingXP: Math.max(0, LEVEL_XP - progressXP),
    percent: Math.min(100, Math.max(0, (progressXP / LEVEL_XP) * 100)),
  };
}

function getNestedValue(data, path) {
  return path.split('.').reduce((value, key) => value?.[key], data);
}

function mergeAchievementDefinitions(stored) {
  const merged = new Map(DEFAULT_ACHIEVEMENTS.map(achievement => [achievement.id, achievement]));

  for (const achievement of stored) {
    merged.set(achievement.id, {
      ...merged.get(achievement.id),
      ...achievement,
    });
  }

  return [...merged.values()];
}

export const GamificationService = {
  async seedDefaultAchievements(createdBy) {
    const batch = writeBatch(db);

    for (const achievement of DEFAULT_ACHIEVEMENTS) {
      batch.set(doc(db, 'achievements', achievement.id), {
        ...achievement,
        createdBy,
      }, { merge: true });
    }

    await batch.commit();
  },

  async getAchievements() {
    try {
      const snap = await getDocs(collection(db, 'achievements'));
      return mergeAchievementDefinitions(snap.docs.map(achievementDoc => ({
        id: achievementDoc.id,
        ...achievementDoc.data(),
      })));
    } catch (err) {
      console.error('Achievement catalog read failed:', err);
      return DEFAULT_ACHIEVEMENTS;
    }
  },

  async awardXP({ uid, amount, reason, sourceType, sourceId = null, actorId = null, metadata = {} }) {
    const safeAmount = Math.max(0, Number(amount || 0));

    if (!uid || safeAmount <= 0) {
      throw new Error('XP award requires a member and positive XP amount.');
    }

    const userRef = doc(db, 'users', uid);
    const xpLogRef = doc(collection(db, 'xpLogs'));
    const activityRef = doc(collection(db, 'activityLogs'));

    try {
      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        const currentXP = userSnap.exists() ? Number(userSnap.data().xp || 0) : 0;
        const nextXP = currentXP + safeAmount;

        transaction.update(userRef, {
          xp: nextXP,
          level: calculateLevel(nextXP),
          ...(sourceType === XP_REWARD_TYPES.EXPERIMENT ? { 'stats.experimentsCount': increment(1) } : {}),
          ...(sourceType === XP_REWARD_TYPES.PRODUCT ? { 'stats.productsCount': increment(1) } : {}),
        });

        transaction.set(xpLogRef, {
          userId: uid,
          amount: safeAmount,
          reason,
          sourceType,
          sourceId,
          actorId,
          metadata,
          createdAt: serverTimestamp(),
          timestamp: serverTimestamp(),
        });

        transaction.set(activityRef, {
          type: 'XP_AWARDED',
          title: 'XP Awarded',
          description: `${safeAmount} XP awarded: ${reason}`,
          userId: uid,
          metadata: { sourceType, sourceId, amount: safeAmount, actorId, ...metadata },
          timestamp: serverTimestamp(),
        });
      });
    } catch (err) {
      console.warn('awardXP transaction failed/skipped:', err.message);
    }
  },

  async grantAchievement({ uid, achievementId, actorId }) {
    if (!uid || !achievementId) {
      throw new Error('Achievement grant requires a member and achievement.');
    }

    const achievementRef = doc(db, 'achievements', achievementId);
    const achievementSnap = await getDoc(achievementRef);
    const fallbackAchievement = getAchievementById(achievementId);
    const achievement = achievementSnap.exists()
      ? { id: achievementSnap.id, ...achievementSnap.data() }
      : fallbackAchievement;

    if (!achievement) {
      throw new Error('Achievement does not exist.');
    }

    const rewardXP = Number(achievement.rewardXP || 0);
    const userRef = doc(db, 'users', uid);
    const userAchievementRef = doc(db, 'users', uid, 'achievements', achievementId);
    const notificationRef = doc(collection(db, 'users', uid, 'notifications'));
    const activityRef = doc(collection(db, 'activityLogs'));
    const xpLogRef = rewardXP > 0 ? doc(collection(db, 'xpLogs')) : null;

    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      const currentXP = Number(userData.xp || 0);
      const currentAchievements = Array.isArray(userData.achievements) ? userData.achievements : [];
      const alreadyUnlocked = currentAchievements.some(item =>
        typeof item === 'string' ? item === achievementId : item.id === achievementId
      );
      const nextXP = alreadyUnlocked ? currentXP : currentXP + rewardXP;

      const userUpdate = {
        ...(achievement.badge ? { specializations: arrayUnion(achievement.badge.toLowerCase()) } : {}),
        ...(alreadyUnlocked ? {} : {
          achievements: arrayUnion({
            id: achievementId,
            title: achievement.title,
            description: achievement.description,
            rewardXP,
            unlockedAt: new Date().toISOString(),
          }),
          xp: nextXP,
          level: calculateLevel(nextXP),
          'stats.achievementsEarned': increment(1),
        }),
      };

      transaction.update(userRef, userUpdate);

      transaction.set(userAchievementRef, {
        achievementId,
        title: achievement.title,
        description: achievement.description,
        rewardXP,
        unlockedAt: serverTimestamp(),
        grantedBy: actorId,
      }, { merge: true });

      if (!alreadyUnlocked && rewardXP > 0) {
        transaction.set(xpLogRef, {
          userId: uid,
          amount: rewardXP,
          reason: `Achievement reward: ${achievement.title}`,
          sourceType: XP_REWARD_TYPES.ACHIEVEMENT,
          sourceId: achievementId,
          actorId,
          metadata: { achievementId },
          createdAt: serverTimestamp(),
          timestamp: serverTimestamp(),
        });
      }

      transaction.set(notificationRef, {
        type: 'ACHIEVEMENT',
        title: 'Achievement unlocked',
        message: `${achievement.title} unlocked${!alreadyUnlocked && rewardXP > 0 ? ` for ${rewardXP} XP` : ''}.`,
        link: `/profile/${uid}`,
        read: false,
        createdAt: serverTimestamp(),
        actorId,
      });

      transaction.set(activityRef, {
        type: 'ACHIEVEMENT_UNLOCKED',
        title: 'Achievement Unlocked',
        description: achievement.title,
        userId: uid,
        metadata: { achievementId, rewardXP: alreadyUnlocked ? 0 : rewardXP, actorId },
      });
    });

if (achievement.badge) {
      try {
        const { CertificateService } = await import('./certificates');
        await CertificateService.issueCertificate({
          userId: uid,
          type: 'SPECIALIZATION',
          title: `${achievement.badge} Specialization`,
          description: achievement.title || `Awarded specialization in ${achievement.badge}`,
          actorId,
        });
      } catch (err) {
        console.error('Auto-Issue Certificate failed:', err);
      }
    }
  },

  async assignBadge(uid, badgeId) {
    await updateDoc(doc(db, 'users', uid), {
      specializations: arrayUnion(badgeId),
    });
     
    try {
      const { CertificateService } = await import('./certificates');
      await CertificateService.issueCertificate({
        userId: uid,
        type: 'SPECIALIZATION',
        title: `${badgeId} Specialization`,
        description: `Awarded specialization in ${badgeId}`,
        actorId: 'SYSTEM',
      });
    } catch (err) {
      console.error('Auto-Issue Certificate for Badge failed:', err);
    }
  },

  async getLeaderboard({ type = 'xp', maxCount = 10 } = {}) {
    const fieldMap = {
      xp: 'xp',
      tasks: 'stats.tasksCompleted',
      experiments: 'stats.experimentsCount',
      products: 'stats.productsCount',
      developer: 'stats.programmingXP',
      engineer: 'stats.engineeringXP',
      researcher: 'stats.researchScore',
      inventor: 'stats.inventorScore',
      innovator: 'stats.innovatorScore',
      builder: 'stats.builderScore',
      discovery: 'stats.discoveryScore',
      rising_star: 'stats.velocity',
      most_improved: 'stats.improvement',
      learner: 'stats.learnerScore',
      instructor: 'stats.instructorScore',
      educator: 'stats.educatorScore',
      knowledge: 'stats.knowledgeScore',
    };
    const orderField = fieldMap[type] || fieldMap.xp;
    const snap = await getDocs(query(collection(db, 'users'), orderBy(orderField, 'desc'), limit(maxCount)));

    return snap.docs.map((userDoc, index) => ({
      id: userDoc.id,
      ...userDoc.data(),
      rank: index + 1,
      score: getNestedValue(userDoc.data(), orderField) ?? 0,
    }));
  },

  async getRank(uid, type = 'xp') {
    const leaderboard = await this.getLeaderboard({ type, maxCount: 100 });
    const entry = leaderboard.find(item => item.id === uid);
    return entry?.rank || null;
  },

  async getRecentAchievements(uid, maxCount = 5) {
    const snap = await getDocs(query(
      collection(db, 'users', uid, 'achievements'),
      orderBy('unlockedAt', 'desc'),
      limit(maxCount),
    ));

    return snap.docs.map(achievementDoc => ({
      id: achievementDoc.id,
      ...achievementDoc.data(),
    }));
  },

  async getRecentXPLogs(uid, maxCount = 5) {
    const snap = await getDocs(query(
      collection(db, 'xpLogs'),
      where('userId', '==', uid),
      orderBy('timestamp', 'desc'),
      limit(maxCount),
    ));

    return snap.docs.map(logDoc => ({
      id: logDoc.id,
      ...logDoc.data(),
    }));
  },

  async getUserStats(uid) {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) return null;
    
    const data = userSnap.data();
    return {
      xp: data.xp || 0,
      level: data.level || 1,
      streak: data.stats?.streak || 0,
      lastStreakClaim: data.stats?.lastStreakClaim,
      completedMissions: data.stats?.completedMissions || {},
    };
  },

  async getRecentlyAccessed(uid) {
    const snap = await getDocs(query(
      collection(db, 'users', uid, 'recentActivity'),
      orderBy('lastOpened', 'desc'),
      limit(5),
    ));

    return snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });
  },

  async getDailyDiscoveries() {
    const snap = await getDocs(query(
      collection(db, 'dailyDiscoveries'),
      where('date', '==', new Date().toDateString()),
      limit(10),
    ));

    if (!snap.empty) {
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    return [];
  },

  async getTrendingAcrossPlatform() {
    const snap = await getDocs(query(collection(db, 'trending'), limit(10)));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getFriendsActivity() {
    const snap = await getDocs(query(
      collection(db, 'activityLogs'),
      orderBy('timestamp', 'desc'),
      limit(10),
    ));

    if (snap.empty) {
      const sampleActivities = [
        { id: 1, emoji: '🎉', user: 'Aryan', action: 'completed a challenge', item: 'Robotics Challenge' },
        { id: 2, emoji: '🏆', user: 'Emma', action: 'reached level', item: 'Level 20' },
        { id: 3, emoji: '🎬', user: 'Noah', action: 'uploaded a video', item: 'FunFlix showcase' },
        { id: 4, emoji: '🤖', user: 'Sophia', action: 'created a new AI', item: 'Study Assistant' },
      ];
      return sampleActivities;
    }

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async canClaimDailyReward(uid) {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) return false;

    const data = userSnap.data();
    // Non-members cannot claim daily rewards or earn XP
    if (data.membershipStatus !== 'approved' && data.role !== 'Main CEO' && data.role !== 'Co-CEO') {
      return false;
    }

    const lastClaim = data.stats?.lastStreakClaim?.toDate?.();
    if (!lastClaim) return true;

    return lastClaim.toDateString() !== new Date().toDateString();
  },

  async claimDailyReward(uid) {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const data = userSnap.data();
    // Non-members cannot claim daily rewards or earn XP
    if (data.membershipStatus !== 'approved' && data.role !== 'Main CEO' && data.role !== 'Co-CEO') {
      throw new Error('Only approved BeastBuck members can claim rewards and earn XP.');
    }
    const lastClaim = data.stats?.lastStreakClaim?.toDate?.();
    const today = new Date();
    const isConsecutive = lastClaim &&
      (today.getTime() - lastClaim.getTime()) < 48 * 60 * 60 * 1000;

    const currentStreak = data.stats?.streak || 0;
    const newStreak = isConsecutive ? currentStreak + 1 : 1;
    const streakXP = calculateStreakXP(newStreak);

    const todayStr = today.toDateString();
    const existingHistory = Array.isArray(data.stats?.streakHistory) ? data.stats.streakHistory : [];
    const alreadyClaimedToday = existingHistory.some(date => date === todayStr);

    if (alreadyClaimedToday) return;

    const newHistory = [...existingHistory, todayStr].slice(-14);

    await updateDoc(userRef, {
      xp: increment(streakXP),
      'stats.streak': newStreak,
      'stats.lastStreakClaim': serverTimestamp(),
      'stats.streakHistory': newHistory,
      level: calculateLevel((data.xp || 0) + streakXP),
    });
  },

  async getStreakHistory(uid) {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) return [];

    const data = userSnap.data();
    return data.stats?.streakHistory || [];
  },

  async getUserDailyMissions(uid) {
    const snap = await getDocs(query(
      collection(db, 'users', uid, 'dailyMissions'),
      orderBy('createdAt', 'desc'),
    ));

    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async getDailyHighlights() {
    const snap = await getDocs(query(
      collection(db, 'dailyHighlights'),
      where('date', '==', new Date().toDateString()),
      limit(8),
    ));

    if (!snap.empty) {
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    return [];
  },

  async getTopLeaderboard(maxCount = 3) {
    const snap = await getDocs(query(
      collection(db, 'users'),
      orderBy('xp', 'desc'),
      limit(maxCount),
    ));

    return snap.docs.map((userDoc, index) => ({
      id: userDoc.id,
      ...userDoc.data(),
      rank: index + 1,
    }));
  },

  async getUserProjects(uid) {
    const snap = await getDocs(query(
      collection(db, 'projects'),
      where('members', 'array-contains', uid),
      limit(5),
    ));

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getActiveExperiments(uid) {
    const snap = await getDocs(query(
      collection(db, 'experiments'),
      where('assignedTo', '==', uid),
      limit(5),
    ));

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getLearningJourney(uid) {
    const snap = await getDocs(query(
      collection(db, 'users', uid, 'learningJourney'),
      orderBy('updatedAt', 'desc'),
      limit(1),
    ));

    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }

    return null;
  },

  async getNotifications(uid, maxCount = 5) {
    const snap = await getDocs(query(
      collection(db, 'users', uid, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(maxCount),
    ));

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getMySquad(uid) {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) return [];

    const userData = userSnap.data();
    const teamIds = userData.teamIds || [];
    
    if (teamIds.length === 0) {
      const orgSnap = await getDoc(doc(db, 'organizations', userData.organizationId || 'default'));
      const orgData = orgSnap.exists() ? orgSnap.data() : {};
      const orgMembers = orgData.memberIds || [];
      const memberSnap = await getDocs(query(
        collection(db, 'users'),
        where('__name__', 'in', orgMembers.slice(0, 10)),
        limit(8),
      ));
      
      return memberSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    const squadSnap = await getDocs(query(
      collection(db, 'users'),
      where('__name__', 'in', teamIds.slice(0, 10)),
      limit(10),
    ));

    return squadSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async getCreativeEnergy(uid) {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) return { energy: 0 };

    const data = userSnap.data();
    const stats = data.stats || {};
    
    const energy = Math.min(100, Math.max(0,
      (stats.achievementsEarned || 0) * 5 +
      (stats.experimentsCount || 0) * 3 +
      (stats.productsCount || 0) * 3 +
      (stats.streak || 0) * 2,
    ));

    return { energy };
  },

  async getPersonalGoals(uid) {
    const snap = await getDocs(query(
      collection(db, 'users', uid, 'goals'),
      orderBy('createdAt', 'desc'),
      limit(5),
    ));

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};
