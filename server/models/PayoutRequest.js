import mongoose from "mongoose";

const payoutRequestSchema = new mongoose.Schema(
    {
        educatorId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        amount: { 
            type: Number, 
            required: true,
            min: 0
        },
        paymentMethod: { 
            type: String, 
            enum: ['mobile_money', 'bank_transfer', 'paypal'],
            required: true 
        },
        // Mobile Money details
        mobileMoneyProvider: {
            type: String,
            enum: ['mpesa', 'orange_money', 'airtel_money', 'mtn_money']
        },
        phoneNumber: { type: String },
        // Bank Transfer details
        bankName: { type: String },
        accountNumber: { type: String },
        accountName: { type: String },
        // PayPal details
        paypalEmail: { type: String },
        // Status
        status: { 
            type: String, 
            enum: ['pending', 'processing', 'completed', 'rejected'],
            default: 'pending'
        },
        // Admin handling
        adminNote: { type: String },
        processedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
        processedAt: { type: Date },
        transactionReference: { type: String }
    },
    { timestamps: true }
);

const PayoutRequest = mongoose.model('PayoutRequest', payoutRequestSchema);

export default PayoutRequest;
