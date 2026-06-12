import { Router, Request, Response } from 'express';
import { db } from '../firebase';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

// ==========================================
// TYPESCRIPT INTERFACES
// ==========================================
export type LmsNodeType = 'CATEGORY' | 'BATCH' | 'MODULE' | 'SUB_MODULE' | 'LECTURE' | 'RESOURCE';

export interface LmsNode {
  id?: string;
  batchId: string;
  parentId: string | null;
  title: string;
  type: LmsNodeType;
  order: number;
  ancestors: string[]; // For fast cascade delete
  metadata?: any;
  createdAt: number;
  updatedAt: number;
}

export interface ReorderPayload {
  updates: { id: string; order: number; parentId?: string | null }[];
}

// ==========================================
// 1. Nested Data Delivery (GET)
// ==========================================

/**
 * Fetch nested tree structure efficiently for a batch.
 * GET /api/batches/:id/content
 */
router.get('/batches/:id/content', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const batchId = req.params.id;
    const uid = (req as any).user.uid; // Mocked decoded token directly giving uid

    // Validation: Admin can bypass purchase check. Normal users need a purchase record.
    // Let's assume 'admin123' token means admin.
    let isAdmin = false;
    if (uid === 'admin123' || uid === process.env.ADMIN_SECRET) {
      isAdmin = true;
    }

    if (!isAdmin) {
      // Check purchase
      const purchaseDoc = await db.collection('user_purchases').doc(`${uid}_${batchId}`).get();
      if (!purchaseDoc.exists) {
        res.status(403).json({ error: 'Access denied. You do not have a valid purchase for this batch.' });
        return;
      }
    }

    // Fetch all content for this batch
    const snapshot = await db.collection('lms_nodes')
      .where('batchId', '==', batchId)
      .get();
      
    const nodes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (LmsNode & { id: string })[];

    // Sort by order ascending BEFORE parsing tree
    nodes.sort((a, b) => a.order - b.order);

    // Build the nested tree
    const tree: any[] = [];
    const lookup: Record<string, any> = {};

    // Initialize all nodes in lookup with a children array
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

    res.json({ success: true, batchId, tree });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch nested content' });
  }
});

// ==========================================
// 2. Validation & Admin Operations
// ==========================================

/**
 * CREATE a node (Category, Batch, Module, Sub-module, Lecture)
 * POST /api/lms/nodes
 */
router.post('/nodes', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { batchId, parentId, title, type, metadata, order } = req.body;

    if (!batchId || !title || !type) {
      res.status(400).json({ error: 'Missing required configuration' });
      return;
    }

    let ancestors: string[] = [];

    if (parentId) {
      const parentDoc = await db.collection('lms_nodes').doc(parentId).get();
      if (!parentDoc.exists) {
        res.status(404).json({ error: 'Parent node not found' });
        return;
      }
      const parentData = parentDoc.data() as LmsNode;
      ancestors = [...(parentData.ancestors || []), parentId];
    }

    const docRef = db.collection('lms_nodes').doc();
    const newNode: LmsNode = {
      batchId,
      parentId: parentId || null,
      title,
      type,
      order: order || 0, // Should be calculated to be placed last, but accepting explicit input
      ancestors,
      metadata: metadata || {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await docRef.set(newNode);

    res.status(201).json({ success: true, id: docRef.id, node: newNode });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create node' });
  }
});

/**
 * EDIT a node (Rename, etc.)
 * PATCH /api/lms/nodes/:id
 */
router.patch('/nodes/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, metadata } = req.body;
    const updateData: any = { updatedAt: Date.now() };
    if (title) updateData.title = title;
    if (metadata) updateData.metadata = metadata;

    await db.collection('lms_nodes').doc(req.params.id).update(updateData);
    res.json({ success: true, message: 'Node updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update node' });
  }
});

/**
 * REORDER nodes
 * PATCH /api/lms/reorder
 */
router.patch('/reorder', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { updates } = req.body as ReorderPayload;
    if (!updates || !Array.isArray(updates)) {
      res.status(400).json({ error: 'Invalid reorder array' });
      return;
    }

    const batch = db.batch();

    for (const update of updates) {
      const ref = db.collection('lms_nodes').doc(update.id);
      
      const payload: any = { order: update.order, updatedAt: Date.now() };
      if (update.parentId !== undefined) {
         payload.parentId = update.parentId;
      }
      
      batch.update(ref, payload);
    }

    await batch.commit();

    res.json({ success: true, message: 'Reordered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder nodes' });
  }
});

// ==========================================
// 3. Complete Cascade Delete Logic
// ==========================================

/**
 * DELETE a node and cascade nested children
 * DELETE /api/lms/nodes/:id
 */
router.delete('/nodes/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Safety check - verify existence
    const nodeDoc = await db.collection('lms_nodes').doc(id).get();
    if (!nodeDoc.exists) {
      res.status(404).json({ error: 'Node not found' });
      return;
    }

    // Max writes in batch is 500, simplified for standard use case without paging logic.
    // A robust system would delete in chunks if expecting >500 items.
    const batch = db.batch();
    
    // 1. Delete target directly
    batch.delete(db.collection('lms_nodes').doc(id));

    // 2. Cascade delete nested items using array-contains
    const childrenSnapshot = await db.collection('lms_nodes')
      .where('ancestors', 'array-contains', id)
      .get();
      
    childrenSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    res.json({ success: true, message: 'Deleted node and cascaded removal of embedded structural children', deletedCount: childrenSnapshot.size + 1 });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to perform cascade delete' });
  }
});

export default router;
