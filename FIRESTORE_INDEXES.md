# Required Firestore Composite Indexes

This file documents all the Firestore composite indexes that need to be created in Firebase Console for the AI features to work properly.

## How to Create Indexes

1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Add Index" for each index below
3. Configure the index with the exact fields and order specified
4. Click "Create"

## Required Indexes

### AI Recommendations (aiRecommendations.js)

#### 1. Academy Courses Index
- **Collection**: `academy_courses`
- **Fields**: 
  - `tags` → Array contains
  - `enrollments` → Descending
- **Query**: Lines 22-27 in aiRecommendations.js

#### 2. Projects Index  
- **Collection**: `projects`
- **Fields**:
  - `requiredSkills` → Array contains
  - `status` → Equals
- **Query**: Lines 45-50 in aiRecommendations.js

#### 3. Events Index
- **Collection**: `events`
- **Fields**:
  - `type` → Equals
  - `status` → Equals
  - `startDate` → Ascending
- **Query**: Lines 67-72 in aiRecommendations.js

### AI Context Builder (aiContextBuilder.js)

#### 4. Projects Index
- **Collection**: `projects`
- **Fields**:
  - `assignedTo` → Equals
  - `updatedAt` → Descending
- **Query**: Lines 505-510 in aiContextBuilder.js

#### 5. Experiments Index
- **Collection**: `experiments`
- **Fields**:
  - `createdBy` → Equals
  - `createdAt` → Descending
- **Query**: Lines 515-520 in aiContextBuilder.js

#### 6. Tasks Index
- **Collection**: `tasks`
- **Fields**:
  - `assignedTo` → Equals
  - `createdAt` → Descending
- **Query**: Lines 525-530 in aiContextBuilder.js

#### 7. Products Index
- **Collection**: `products`
- **Fields**:
  - `createdBy` → Equals
  - `createdAt` → Descending
- **Query**: Lines 535-540 in aiContextBuilder.js

## Priority

**CRITICAL** (Queries will fail without these):
- Indexes 1-3 (AI Recommendations)

**HIGH** (Queries will fail without these):
- Indexes 4-7 (AI Context Builder)

## Testing

After creating these indexes, test the following features:
1. AI Recommendations tab in AIOS
2. AI Context building in AI Assistant
3. Personalized recommendations for courses, projects, and events

## Notes

- These indexes are required for Firestore queries that use multiple where clauses or orderBy with where clauses
- Without these indexes, queries will fail with "FirebaseError: The query requires an index" error
- Index creation may take several minutes to complete in Firebase Console
