import { AIMemoryService } from './aiMemory';
import { getDocs, query, collection, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@services/firebase/config';

export const AIRecommendationsService = {
  getPersonalizedRecommendations: async (uid, profile) => {
    if (!uid) return [];
    
    // 1. Fetch AI Memory to get interests
    const memory = await AIMemoryService.getMemory(uid);
    const interests = memory?.data?.interests || [];
    const recentTopics = memory?.data?.recentTopics || [];
    
    const combinedTopics = [...new Set([...interests, ...recentTopics])];
    
    const recs = [];
    
    try {
      // 2. Query real courses matching interests
      if (combinedTopics.length > 0) {
        const coursesRef = collection(db, 'academy_courses');
        const coursesQuery = query(
          coursesRef,
          where('tags', 'array-contains-any', combinedTopics.slice(0, 5)),
          orderBy('enrollments', 'desc'),
          limit(3)
        );
        const coursesSnap = await getDocs(coursesQuery);
        
        coursesSnap.docs.forEach(doc => {
          const data = doc.data();
          recs.push({
            type: 'course',
            id: doc.id,
            title: data.title,
            description: data.description || 'Recommended based on your interests.',
            actionLabel: 'Enroll'
          });
        });
      }

      // 3. Query real projects matching specializations
      if ((profile?.specializations || []).length > 0) {
        const projectsRef = collection(db, 'projects');
        const projectsQuery = query(
          projectsRef,
          where('requiredSkills', 'array-contains-any', profile.specializations.slice(0, 3)),
          where('status', '==', 'open'),
          limit(3)
        );
        const projectsSnap = await getDocs(projectsQuery);
        
        projectsSnap.docs.forEach(doc => {
          const data = doc.data();
          recs.push({
            type: 'project',
            id: doc.id,
            title: data.title,
            description: data.description || 'A project matching your specialization.',
            actionLabel: 'View Project'
          });
        });
      }

      // 4. Query real upcoming events/challenges
      const eventsRef = collection(db, 'events');
      const eventsQuery = query(
        eventsRef,
        where('type', '==', 'challenge'),
        where('status', '==', 'active'),
        orderBy('startDate', 'asc'),
        limit(2)
      );
      const eventsSnap = await getDocs(eventsQuery);
      
      eventsSnap.docs.forEach(doc => {
        const data = doc.data();
        recs.push({
          type: 'event',
          id: doc.id,
          title: data.title,
          description: data.description || 'Test your skills in this challenge.',
          actionLabel: 'Join Challenge'
        });
      });

      // If no real data found, return empty array (no mock data)
      return recs;
    } catch (error) {
      console.error('Failed to fetch personalized recommendations:', error);
      return [];
    }
  }
};
