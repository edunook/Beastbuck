import { db } from '@services/firebase/config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  limit,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const SeasonService = {
  // ---------------------------------------------------------------------------
  // SEASON MANAGEMENT
  // ---------------------------------------------------------------------------
  async getActiveSeason() {
    const now = new Date().toISOString();
    const snap = await getDocs(
      query(
        collection(db, 'seasons'),
        where('status', '==', 'ACTIVE'),
        limit(1)
      )
    );
    
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }

    // Fallback: Check if there's any season where now is between start and end
    const allSeasons = await getDocs(collection(db, 'seasons'));
    const current = docsFrom(allSeasons).find(s => s.startDate <= now && s.endDate >= now);
    
    if (current) return current;

    // No active season
    return null;
  },

  async createSeason(seasonData, actorId) {
    const newDoc = doc(collection(db, 'seasons'));
    await setDoc(newDoc, {
      ...seasonData,
      status: 'ACTIVE',
      createdBy: actorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newDoc.id;
  },

  // ---------------------------------------------------------------------------
  // SEASON LEADERBOARDS
  // ---------------------------------------------------------------------------
  async getSeasonLeaderboard(seasonId, maxCount = 25) {
    if (!seasonId) return [];
    
    const seasonSnap = await getDoc(doc(db, 'seasons', seasonId));
    if (!seasonSnap.exists()) return [];
    
    const season = seasonSnap.data();
    const startDate = season.startDate ? new Date(season.startDate) : null;
    const endDate = season.endDate ? new Date(season.endDate) : new Date();

    // Fetch all XP logs within the season dates
    let xpQuery = query(collection(db, 'xpLogs'));
    if (startDate) {
      xpQuery = query(xpQuery, where('timestamp', '>=', startDate), where('timestamp', '<=', endDate));
    }

    const logsSnap = await getDocs(xpQuery);
    const userTotals = {};

    logsSnap.forEach(log => {
      const data = log.data();
      if (data.userId) {
        userTotals[data.userId] = (userTotals[data.userId] || 0) + (data.amount || 0);
      }
    });

    // Sort users by season XP
    const sortedUserIds = Object.keys(userTotals)
      .sort((a, b) => userTotals[b] - userTotals[a])
      .slice(0, maxCount);

    if (sortedUserIds.length === 0) return [];

    // Fetch the user documents for the top users
    // We do it in chunks of 10 for 'in' query limitations
    const users = [];
    for (let i = 0; i < sortedUserIds.length; i += 10) {
      const chunk = sortedUserIds.slice(i, i + 10);
      const userSnap = await getDocs(query(collection(db, 'users'), where('uid', 'in', chunk)));
      users.push(...docsFrom(userSnap));
    }

    // Merge and rank
    return sortedUserIds.map((uid, index) => {
      const u = users.find(user => user.id === uid) || { id: uid, username: 'Unknown' };
      return {
        ...u,
        seasonXP: userTotals[uid],
        rank: index + 1,
      };
    });
  },

  async getSeasonRank(uid, seasonId) {
    if (!uid || !seasonId) return null;
    // For performance, we'll fetch the top 100
    const leaderboard = await this.getSeasonLeaderboard(seasonId, 100);
    const entry = leaderboard.find(item => item.id === uid);
    return entry ? entry.rank : null;
  }
};
