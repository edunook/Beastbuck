import { db } from './config';
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
import { DEFAULT_ACHIEVEMENTS, getAchievementById } from '../../constants/achievements';

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
        console.error('Failed to auto-issue certificate:', err);
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
      console.error('Failed to auto-issue certificate for badge:', err);
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
    // We try to order by the field, if it doesn't exist, it might fail but that's standard Firestore behavior.
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
};
