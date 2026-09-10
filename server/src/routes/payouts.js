import express from 'express';
import { query, getClient } from '../db.js';
import { createPayoutRequest, getPayoutRequests, rollbackPayout } from '../services/wallet.js';
import * as paypalService from '../services/paypal.js';

const router = express.Router();
const PAYOUTS_MODE = process.env.PAYOUTS_MODE || 'demo';

// Request payout
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { paypalEmail, amount } = req.body;

    if (!paypalEmail || !amount) {
      return res.status(400).json({
        success: false,
        error: 'PayPal email and amount required',
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paypalEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid PayPal email',
      });
    }

    // Convert to cents
    const amountCents = Math.round(parseFloat(amount) * 100);

    if (amountCents < 500) {
      return res.status(400).json({
        success: false,
        error: 'Minimum payout is $5.00',
      });
    }

    // Create payout request
    const payout = await createPayoutRequest(userId, paypalEmail, amountCents);

    // Update user's PayPal email for future reference
    await query(
      'UPDATE users SET paypal_email = $1 WHERE id = $2',
      [paypalEmail, userId]
    );

    // Process payout based on mode
    if (PAYOUTS_MODE === 'demo') {
      // In demo mode, mark as completed immediately
      await query(
        'UPDATE payout_requests SET status = $1 WHERE id = $2',
        ['completed', payout.payoutId]
      );
    } else {
      // In live mode, send to PayPal
      try {
        const recipients = [
          {
            recipient_type: 'EMAIL',
            amount: {
              value: (amountCents / 100).toFixed(2),
              currency: 'USD',
            },
            receiver: paypalEmail,
            note: 'Earnly Rewards Payout',
          },
        ];

        const batchId = `BATCH-${Date.now()}`;
        const payoutResult = await paypalService.createPayout(recipients, batchId);

        // Update payout with reference
        await query(
          'UPDATE payout_requests SET provider_reference = $1, status = $2 WHERE id = $3',
          [payoutResult.batchId, 'processing', payout.payoutId]
        );
      } catch (paypalError) {
        console.error('PayPal payout error:', paypalError);
        // Rollback the payout
        await rollbackPayout(payout.payoutId);

        return res.status(500).json({
          success: false,
          error: 'Payout processing failed. Amount returned to wallet.',
        });
      }
    }

    res.json({
      success: true,
      message: payout.message,
      data: {
        payoutId: payout.payoutId,
        status: PAYOUTS_MODE === 'demo' ? 'completed' : 'pending',
      },
    });
  } catch (error) {
    console.error('Payout request error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create payout request',
    });
  }
});

// Get payout history
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const payouts = await getPayoutRequests(userId, limit);

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

export default router;
