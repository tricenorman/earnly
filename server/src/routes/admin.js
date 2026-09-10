import express from 'express';
import { adminMiddleware } from '../middleware/auth.js';
import { query, getClient } from '../db.js';

const router = express.Router();

// Admin middleware for all routes
router.use(adminMiddleware);

// ===== USERS =====

// Get all users
router.get('/users', async (req, res) => {
  try {
    const status = req.query.status || 'active';
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const result = await query(
      `SELECT id, email, membership_active, balance_cents, account_status, created_at
       FROM users
       WHERE account_status = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM users WHERE account_status = $1',
      [status]
    );

    const users = result.rows.map(u => ({
      ...u,
      balance: `$${(u.balance_cents / 100).toFixed(2)}`,
    }));

    res.json({
      success: true,
      data: users,
      total: parseInt(countResult.rows[0].total),
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users',
    });
  }
});

// Get user details
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const userResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const user = userResult.rows[0];
    user.balance = `$${(user.balance_cents / 100).toFixed(2)}`;

    // Get user activity
    const logsResult = await query(
      'SELECT action, metadata, created_at FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [userId]
    );

    user.recentActivity = logsResult.rows;

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user',
    });
  }
});

// Update user account status
router.patch('/users/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'review', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
      });
    }

    const result = await query(
      'UPDATE users SET account_status = $1 WHERE id = $2 RETURNING id, account_status',
      [status, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Log action
    await query(
      'INSERT INTO audit_logs (user_id, action, metadata) VALUES ($1, $2, $3)',
      [req.userId, 'user_status_updated', JSON.stringify({ targetUser: userId, status })]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status',
    });
  }
});

// ===== TASKS =====

// Get all tasks
router.get('/tasks', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM tasks ORDER BY created_at DESC',
      []
    );

    const tasks = result.rows.map(t => ({
      ...t,
      reward: `$${(t.reward_cents / 100).toFixed(2)}`,
    }));

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tasks',
    });
  }
});

// Create task
router.post('/tasks', async (req, res) => {
  try {
    const { title, description, rewardAmount, active, oneTime } = req.body;

    if (!title || !rewardAmount) {
      return res.status(400).json({
        success: false,
        error: 'Title and reward amount required',
      });
    }

    const rewardCents = Math.round(parseFloat(rewardAmount) * 100);

    const result = await query(
      `INSERT INTO tasks (title, description, reward_cents, active, one_time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description || null, rewardCents, active !== false, oneTime !== false]
    );

    const task = result.rows[0];
    task.reward = `$${(task.reward_cents / 100).toFixed(2)}`;

    // Log action
    await query(
      'INSERT INTO audit_logs (user_id, action, metadata) VALUES ($1, $2, $3)',
      [req.userId, 'task_created', JSON.stringify({ taskId: task.id, title })]
    );

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
    });
  }
});

// Update task
router.patch('/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, rewardAmount, active } = req.body;

    let updateQuery = 'UPDATE tasks SET';
    const params = [];
    let paramCount = 1;

    if (title !== undefined) {
      updateQuery += ` title = $${paramCount},`;
      params.push(title);
      paramCount++;
    }

    if (description !== undefined) {
      updateQuery += ` description = $${paramCount},`;
      params.push(description);
      paramCount++;
    }

    if (rewardAmount !== undefined) {
      const rewardCents = Math.round(parseFloat(rewardAmount) * 100);
      updateQuery += ` reward_cents = $${paramCount},`;
      params.push(rewardCents);
      paramCount++;
    }

    if (active !== undefined) {
      updateQuery += ` active = $${paramCount},`;
      params.push(active);
      paramCount++;
    }

    // Remove trailing comma
    updateQuery = updateQuery.slice(0, -1);
    updateQuery += ` WHERE id = $${paramCount} RETURNING *`;
    params.push(taskId);

    const result = await query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    const task = result.rows[0];
    task.reward = `$${(task.reward_cents / 100).toFixed(2)}`;

    // Log action
    await query(
      'INSERT INTO audit_logs (user_id, action, metadata) VALUES ($1, $2, $3)',
      [req.userId, 'task_updated', JSON.stringify({ taskId })]
    );

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
    });
  }
});

// ===== PAYOUTS =====

// Get all payouts
router.get('/payouts', async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await query(
      `SELECT p.*, u.email FROM payout_requests p
       JOIN users u ON p.user_id = u.id
       WHERE p.status = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    const payouts = result.rows.map(p => ({
      ...p,
      amount: `$${(p.amount_cents / 100).toFixed(2)}`,
    }));

    res.json({
      success: true,
      data: payouts,
    });
  } catch (error) {
    console.error('Get payouts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payouts',
    });
  }
});

// Approve payout
router.post('/payouts/:payoutId/approve', async (req, res) => {
  try {
    const { payoutId } = req.params;

    const result = await query(
      'UPDATE payout_requests SET status = $1 WHERE id = $2 RETURNING *',
      ['approved', payoutId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payout not found',
      });
    }

    const payout = result.rows[0];

    // Log action
    await query(
      'INSERT INTO audit_logs (user_id, action, metadata) VALUES ($1, $2, $3)',
      [req.userId, 'payout_approved', JSON.stringify({ payoutId })]
    );

    res.json({
      success: true,
      data: {
        ...payout,
        amount: `$${(payout.amount_cents / 100).toFixed(2)}`,
      },
    });
  } catch (error) {
    console.error('Approve payout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve payout',
    });
  }
});

// Reject payout
router.post('/payouts/:payoutId/reject', async (req, res) => {
  try {
    const { payoutId } = req.params;
    const { reason } = req.body;

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Get payout details
      const payoutResult = await client.query(
        'SELECT user_id, amount_cents FROM payout_requests WHERE id = $1',
        [payoutId]
      );

      if (payoutResult.rows.length === 0) {
        throw new Error('Payout not found');
      }

      const { user_id: userId, amount_cents: amountCents } = payoutResult.rows[0];

      // Return amount to balance
      await client.query(
        'UPDATE users SET balance_cents = balance_cents + $1 WHERE id = $2',
        [amountCents, userId]
      );

      // Create compensating ledger entry
      await client.query(
        'INSERT INTO ledger (user_id, type, amount_cents, source, status) VALUES ($1, $2, $3, $4, $5)',
        [userId, 'refund', amountCents, `payout:${payoutId}`, 'completed']
      );

      // Update payout status
      await client.query(
        'UPDATE payout_requests SET status = $1, failure_reason = $2 WHERE id = $3',
        ['rejected', reason || 'Rejected by admin', payoutId]
      );

      // Log action
      await client.query(
        'INSERT INTO audit_logs (user_id, action, metadata) VALUES ($1, $2, $3)',
        [req.userId, 'payout_rejected', JSON.stringify({ payoutId, reason })]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Payout rejected and amount refunded',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Reject payout error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reject payout',
    });
  }
});

// ===== OVERVIEW STATS =====

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Total users
    const usersResult = await query('SELECT COUNT(*) as total FROM users');
    const totalUsers = parseInt(usersResult.rows[0].total);

    // Active members
    const membersResult = await query('SELECT COUNT(*) as total FROM users WHERE membership_active = true');
    const activeMembers = parseInt(membersResult.rows[0].total);

    // Membership revenue
    const revenueResult = await query(
      'SELECT COALESCE(SUM(amount_cents), 0) as total FROM ledger WHERE type = $1 AND status = $2',
      ['membership', 'completed']
    );
    const membershipRevenue = revenueResult.rows[0].total;

    // Total rewards
    const rewardsResult = await query(
      'SELECT COALESCE(SUM(amount_cents), 0) as total FROM ledger WHERE type = $1 AND status = $2',
      ['reward', 'completed']
    );
    const totalRewards = rewardsResult.rows[0].total;

    // Pending payouts
    const pendingResult = await query(
      'SELECT COALESCE(SUM(amount_cents), 0) as total FROM payout_requests WHERE status IN ($1, $2)',
      ['pending', 'processing']
    );
    const pendingPayouts = pendingResult.rows[0].total;

    // Completed payouts
    const completedResult = await query(
      'SELECT COALESCE(SUM(amount_cents), 0) as total FROM payout_requests WHERE status = $1',
      ['completed']
    );
    const completedPayouts = completedResult.rows[0].total;

    res.json({
      success: true,
      data: {
        totalUsers,
        activeMembers,
        membershipRevenue: `$${(membershipRevenue / 100).toFixed(2)}`,
        totalRewards: `$${(totalRewards / 100).toFixed(2)}`,
        pendingPayouts: `$${(pendingPayouts / 100).toFixed(2)}`,
        completedPayouts: `$${(completedPayouts / 100).toFixed(2)}`,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
    });
  }
});

export default router;
