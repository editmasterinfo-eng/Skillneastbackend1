import { Router, Request, Response } from 'express';
import { db } from '../firebase';

const router = Router();

// ==========================================
// TYPESCRIPT INTERFACES
// ==========================================
export type ItemType = 'MODULE' | 'FOLDER' | 'LECTURE' | 'RESOURCE';

export interface CourseNode {
  id?: string;
  courseId: string;
  parentId: string | null; // null if it's a top-level module
  title: string;
  type: ItemType;
  ancestors: string[]; // Materialized path (Array of parent IDs)
  metadata?: {
    url?: string; // e.g. Video or PDF link
    duration?: number; // Video length
    fileSize?: number;
    [key: string]: any;
  };
  createdAt: number;
  updatedAt: number;
}

export interface NodePayload {
  title: string;
  type: ItemType;
  parentId: string | null; // Null if adding to course root
  metadata?: any;
}

// ==========================================
// 1. CRUD APIs for Infinite Nested Folders
// ==========================================

/**
 * INSERT a new node (Folder, Lecture, Resource)
 * POST /api/learn/courses/:courseId/items
 */
router.post('/courses/:courseId/items', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { title, type, parentId, metadata } = req.body as NodePayload;

    if (!title || !type) {
       return res.status(400).json({ error: 'Title and type are required' });
    }

    let ancestors: string[] = [];

    // If there is a parent, fetch it to inherit its ancestors and add parentId to the path
    if (parentId) {
      const parentDoc = await db.collection('course_nodes').doc(parentId).get();
      if (!parentDoc.exists) {
        return res.status(404).json({ error: 'Parent folder/module not found' });
      }
      const parentData = parentDoc.data() as CourseNode;
      if (parentData.courseId !== courseId) {
        return res.status(400).json({ error: 'Parent does not belong to this course' });
      }
      ancestors = [...parentData.ancestors, parentId];
    }

    const newNode: CourseNode = {
      courseId,
      parentId: parentId || null,
      title,
      type,
      ancestors,
      metadata: metadata || {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const docRef = db.collection('course_nodes').doc();
    await docRef.set(newNode);

    res.status(201).json({ success: true, id: docRef.id, node: newNode });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add item', details: error.message });
  }
});

/**
 * FETCH entire course tree (Optimized - 1 Query)
 * GET /api/learn/courses/:courseId/items
 * Uses flat fetch, then transforms to nested JSON tree in backend
 */
router.get('/courses/:courseId/items', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    
    // Fetch all nodes for the course
    const snapshot = await db.collection('course_nodes')
      .where('courseId', '==', courseId)
      .orderBy('createdAt', 'asc')
      .get();
      
    const nodes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (CourseNode & { id: string })[];

    // Convert Flat List to Nested Tree
    const tree: any[] = [];
    const lookup: Record<string, any> = {};

    nodes.forEach(node => {
      lookup[node.id] = { ...node, children: [] };
    });

    nodes.forEach(node => {
      if (node.parentId && lookup[node.parentId]) {
        lookup[node.parentId].children.push(lookup[node.id]);
      } else {
        tree.push(lookup[node.id]);
      }
    });

    res.json({ success: true, tree });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch course data', details: error.message });
  }
});

/**
 * UPDATE an item (Rename, update metadata)
 * PATCH /api/learn/items/:itemId
 */
router.patch('/items/:itemId', async (req: Request, res: Response) => {
  try {
    const { title, metadata } = req.body;
    const updateData: any = { updatedAt: Date.now() };
    if (title) updateData.title = title;
    if (metadata) updateData.metadata = metadata;

    await db.collection('course_nodes').doc(req.params.itemId).update(updateData);
    
    res.json({ success: true, message: 'Item updated' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

/**
 * DELETE item and all nested offspring recursively
 * DELETE /api/learn/items/:itemId
 */
router.delete('/items/:itemId', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    
    const batch = db.batch();
    
    // 1. Delete target item
    const targetRef = db.collection('course_nodes').doc(itemId);
    batch.delete(targetRef);

    // 2. Optimized Recursive Delete using Materialized Path (ancestors array)
    // Find all documents where ancestors array contains the itemId
    const childrenSnapshot = await db.collection('course_nodes')
      .where('ancestors', 'array-contains', itemId)
      .get();
      
    childrenSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    res.json({ success: true, deletedCount: childrenSnapshot.size + 1 });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete item structure' });
  }
});

// ==========================================
// 2. Progress Tracking Logic
// ==========================================

export interface ProgressSummary {
  courseId: string;
  totalLeafItems: number;       // Total Lectures/Resources
  completedLeafItems: number;   // Number user has completed
  progressPercentage: number;   // Overall %
}

/**
 * CALCULATE User Progress for a Course
 * GET /api/learn/courses/:courseId/progress/:userId
 */
router.get('/courses/:courseId/progress/:userId', async (req: Request, res: Response) => {
  try {
    const { courseId, userId } = req.params;

    // 1. Fetch all nodes in the course
    const allNodesSnapshot = await db.collection('course_nodes')
      .where('courseId', '==', courseId)
      .get();
      
    const allNodes = allNodesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as CourseNode }));

    // Leaf nodes are actionable items (e.g. LECTURE, RESOURCE), Folders/Modules don't count towards completion directly
    const leafNodes = allNodes.filter(n => n.type === 'LECTURE' || n.type === 'RESOURCE');
    const totalLeafItems = leafNodes.length;

    if (totalLeafItems === 0) {
      return res.json({ progressPercentage: 0, completedLeafItems: 0, totalLeafItems: 0 });
    }

    // 2. Fetch User's completed nodes
    const progressDoc = await db.collection('user_course_progress').doc(`${userId}_${courseId}`).get();
    const completedNodeIds: string[] = progressDoc.exists ? (progressDoc.data()?.completedNodeIds || []) : [];

    // 3. Count valid completions
    // We intersect user's completed IDs with actual leaf node IDs to ensure accuracy
    const activeLeafIds = new Set(leafNodes.map(n => n.id));
    const completedCount = completedNodeIds.filter(id => activeLeafIds.has(id)).length;

    const progressPercentage = Math.round((completedCount / totalLeafItems) * 100);

    res.json({
      courseId,
      userId,
      totalLeafItems,
      completedLeafItems: completedCount,
      progressPercentage
    });

  } catch (error: any) {
    res.status(500).json({ error: 'Failed to calculate progress' });
  }
});

/**
 * MARK Item Complete
 * POST /api/learn/items/:itemId/complete
 */
router.post('/items/:itemId/complete', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { userId, courseId } = req.body;

    if (!userId || !courseId) return res.status(400).json({ error: 'Missing logic fields' });

    const progressRef = db.collection('user_course_progress').doc(`${userId}_${courseId}`);
    
    // Use Firestore arrayUnion to safely append without duplications
    await progressRef.set({
      userId,
      courseId,
      completedNodeIds: require('firebase-admin').firestore.FieldValue.arrayUnion(itemId),
      lastUpdated: Date.now()
    }, { merge: true });

    res.json({ success: true, message: 'Progress marked' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

export default router;
