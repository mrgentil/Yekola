import mongoose from "mongoose";

const paymentRequestSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        paymentMethod: { 
            type: String, 
            enum: ['mpesa', 'orange_money', 'airtel_money'],
            required: true 
        },
        phoneNumber: { type: String, required: true },
        transactionRef: { type: String, required: true }, // Reference entered by user
        status: { 
            type: String, 
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        adminNote: { type: String },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        approvedAt: { type: Date }
    },
    { timestamps: true }
);

const PaymentRequest = mongoose.model('PaymentRequest', paymentRequestSchema);

export default PaymentRequest;
