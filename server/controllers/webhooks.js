// Webhooks file - Stripe removed, using Mobile Money manual payments
// This file is kept for compatibility but webhooks are no longer used

export const stripeWebhooks = async (request, response) => {
    // Stripe webhooks disabled - using Mobile Money manual payments
    response.json({ received: true, message: 'Webhooks disabled - using Mobile Money' });
};




