import { query, getClient } from '../db.js';

export async function completeTask(userId, taskId) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Verify user exists and is active
    const userResult = await client.query(
      'SELECT id, membership_active, account_status FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];

    if (!user.membership_active) {
      throw new Error('Membership required');
    }

    if (user.account_status === 'suspended') {
      throw new Error('Account is suspended');
    }

    // Verify task exists and is active
    const taskResult = await client.query(
      'SELECT id, reward_cents, active, one_time FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      throw new Error('Task not found');
    }

    const task = taskResult.rows[0];

    if (!task.active) {
      throw new Error('Task is not available');
    }

    // Check if already completed (for one-time tasks)
    if (task.one_time) {
      const completedResult = await client.query(
        'SELECT id FROM task_completions WHERE user_id = $1 AND task_id = $2',
        [userId, taskId]
      );

      if (completedResult.rows.length > 0) {
        throw new Error('Task already completed');
      }
    }

    // Create task completion record
    const completionResult = await client.query(
      `INSERT INTO task_completions (user_id, task_id, reward_cents, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, reward_cents`,
      [userId, taskId, task.reward_cents, 'completed']
    );

    const completion = completionResult.rows[0];

    // Create ledger entry
    await client.query(
      `INSERT INTO ledger (user_id, type, amount_cents, source, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, 'reward', task.reward_cents, `task:${taskId}`, 'completed']
    );

    // Update user balance
    await client.query(
      `UPDATE users SET balance_cents = balance_cents + $1 WHERE id = $2`,
      [task.reward_cents, userId]
    );

    // Log action
    await client.query(
      `INSERT INTO audit_logs (user_id, action, metadata)
       VALUES ($1, $2, $3)`,
      [userId, 'task_completed', JSON.stringify({ taskId, reward: task.reward_cents })]
    );

    await client.query('COMMIT');

    return {
      completionId: completion.id,
      rewardAmount: task.reward_cents,
      message: `Task completed! Earned $${(task.reward_cents / 100).toFixed(2)}`,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getAvailableTasks(userId) {
  const tasksResult = await query(
    'SELECT id, title, description, reward_cents, active FROM tasks WHERE active = true',
    []
  );

  const tasks = tasksResult.rows;

  // Get completed tasks for this user
  const completedResult = await query(
    'SELECT task_id FROM task_completions WHERE user_id = $1',
    [userId]
  );

  const completedTaskIds = new Set(completedResult.rows.map(r => r.task_id));

  // Mark tasks as completed
  return tasks.map(task => ({
    ...task,
    rewardCents: task.reward_cents,
    completed: completedTaskIds.has(task.id),
    displayReward: `$${(task.reward_cents / 100).toFixed(2)}`,
  }));
}

export async function getUserTasks(userId) {
  const result = await query(
    `SELECT tc.*, t.title, t.description 
     FROM task_completions tc
     JOIN tasks t ON tc.task_id = t.id
     WHERE tc.user_id = $1
     ORDER BY tc.completed_at DESC`,
    [userId]
  );

  return result.rows.map(row => ({
    completionId: row.id,
    taskId: row.task_id,
    title: row.title,
    description: row.description,
    rewardCents: row.reward_cents,
    status: row.status,
    completedAt: row.completed_at,
  }));
}
