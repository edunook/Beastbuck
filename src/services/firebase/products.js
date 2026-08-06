import { db } from './config';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { GamificationService, XP_REWARD_TYPES } from './gamification';

export const PRODUCT_STATUSES = ['DRAFT', 'SHOWCASE', 'AVAILABLE', 'SOLD_OUT', 'ARCHIVED'];
export const PRODUCT_CATEGORIES = [
  'Handmade',
  'Digital',
  'Science Kit',
  'Model',
  'Poster',
  'Tool',
  'Game',
  'Invention',
];

const CREATE_PRODUCT_XP = 75;

function productsRef() {
  return collection(db, 'products');
}

function productRef(productId) {
  return doc(db, 'products', productId);
}

function commentsRef(productId) {
  return collection(db, 'products', productId, 'comments');
}

function clean(value) {
  return String(value || '').trim();
}

function normalizeProduct(data) {
  return {
    title: clean(data.title),
    description: clean(data.description),
    category: data.category || 'Invention',
    teamMembers: Array.isArray(data.teamMembers) ? data.teamMembers : [],
    price: Number(data.price || 0),
    status: data.status || 'DRAFT',
    media: Array.isArray(data.media) ? data.media : [],
    features: clean(data.features),
    technicalDetails: clean(data.technicalDetails),
    usageInstructions: clean(data.usageInstructions),
    warrantyInfo: clean(data.warrantyInfo),
  };
}

function searchableText(product) {
  return [
    product.title,
    product.description,
    product.category,
    product.status,
    product.creatorName,
    product.creatorUsername,
  ].join(' ').toLowerCase();
}

function sortProducts(products, sort = 'newest') {
  return [...products].sort((a, b) => {
    if (sort === 'price_low') return Number(a.price || 0) - Number(b.price || 0);
    if (sort === 'price_high') return Number(b.price || 0) - Number(a.price || 0);
    if (sort === 'popular') return (b.likes?.length || 0) - (a.likes?.length || 0);
    if (sort === 'views') return Number(b.views || 0) - Number(a.views || 0);
    return Number(b.createdAt?.seconds || 0) - Number(a.createdAt?.seconds || 0);
  });
}

export const ProductsService = {
  async createProduct(data, creator) {
    const product = normalizeProduct(data);

    if (!product.title || !product.description) {
      throw new Error('Product title and description are required.');
    }

    const docRef = await addDoc(productsRef(), {
      ...product,
      creatorId: creator.uid,
      creatorName: creator.name,
      creatorUsername: creator.username,
      likes: [],
      views: 0,
      featured: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await GamificationService.awardXP({
      uid: creator.uid,
      amount: CREATE_PRODUCT_XP,
      reason: `Product created: ${product.title}`,
      sourceType: XP_REWARD_TYPES.PRODUCT,
      sourceId: docRef.id,
      actorId: creator.uid,
      metadata: { category: product.category },
    });

    return docRef.id;
  },

  async updateProduct(productId, data) {
    await updateDoc(productRef(productId), {
      ...normalizeProduct(data),
      updatedAt: serverTimestamp(),
    });
  },

  async deleteProduct(productId) {
    await deleteDoc(productRef(productId));
  },

  async archiveProduct(productId) {
    await updateDoc(productRef(productId), {
      status: 'ARCHIVED',
      updatedAt: serverTimestamp(),
    });
  },

  async featureProduct(productId, featured) {
    await updateDoc(productRef(productId), {
      featured,
      updatedAt: serverTimestamp(),
    });
  },

  subscribeToProduct(productId, { onProduct, onError }) {
    return onSnapshot(
      productRef(productId),
      (snap) => onProduct(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      (error) => onError?.(error),
    );
  },

  async incrementViews(productId) {
    await updateDoc(productRef(productId), {
      views: increment(1),
    });
  },

  async toggleLike(productId, uid, hasLiked) {
    await updateDoc(productRef(productId), {
      likes: hasLiked ? arrayRemove(uid) : arrayUnion(uid),
    });
  },

  async searchProducts(filters = {}) {
    const snap = await getDocs(query(productsRef(), orderBy('createdAt', 'desc'), limit(100)));
    const search = clean(filters.search).toLowerCase();

    const products = snap.docs
      .map(productDoc => ({ id: productDoc.id, ...productDoc.data() }))
      .filter(product => product.status !== 'ARCHIVED' || filters.includeArchived)
      .filter(product => !search || searchableText(product).includes(search))
      .filter(product => !filters.category || product.category === filters.category)
      .filter(product => !filters.status || product.status === filters.status)
      .filter(product => !filters.creatorId || product.creatorId === filters.creatorId);

    return sortProducts(products, filters.sort);
  },

  subscribeToComments(productId, { onComments, onError }) {
    const q = query(commentsRef(productId), orderBy('createdAt', 'asc'), limit(100));
    return onSnapshot(
      q,
      (snap) => onComments(snap.docs.map(commentDoc => ({ id: commentDoc.id, ...commentDoc.data() }))),
      (error) => onError?.(error),
    );
  },

  async addComment(productId, { authorId, authorName, text }) {
    const cleanText = clean(text);
    if (!cleanText) throw new Error('Comment cannot be empty.');

    await addDoc(commentsRef(productId), {
      authorId,
      authorName,
      text: cleanText,
      createdAt: serverTimestamp(),
    });
  },

  async deleteComment(productId, commentId) {
    await deleteDoc(doc(db, 'products', productId, 'comments', commentId));
  },

  async getCreators() {
    const snap = await getDocs(query(productsRef(), limit(100)));
    const creators = new Map();

    for (const productDoc of snap.docs) {
      const product = productDoc.data();
      if (product.creatorId && product.status !== 'ARCHIVED') {
        creators.set(product.creatorId, {
          id: product.creatorId,
          name: product.creatorName || product.creatorUsername || 'Member',
        });
      }
    }

    return [...creators.values()].sort((a, b) => a.name.localeCompare(b.name));
  },
};
