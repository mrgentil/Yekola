import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import Footer from "../../components/student/Footer";

const Payment = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { backendUrl, getAccessToken, userData } = useContext(AppContext);

    const [paymentInfo, setPaymentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [transactionRef, setTransactionRef] = useState('');

    useEffect(() => {
        fetchPaymentInfo();
    }, [courseId]);

    const fetchPaymentInfo = async () => {
        try {
            const token = getAccessToken();
            const { data } = await axios.get(
                `${backendUrl}/api/user/payment-info/${courseId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                setPaymentInfo(data.paymentInfo);
            } else {
                toast.error(data.message);
                navigate('/');
            }
        } catch (error) {
            toast.error(error.message);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedMethod) {
            return toast.warn("Veuillez sélectionner un mode de paiement");
        }
        if (!phoneNumber) {
            return toast.warn("Veuillez entrer votre numéro de téléphone");
        }
        if (!transactionRef) {
            return toast.warn("Veuillez entrer la référence de transaction");
        }

        setSubmitting(true);

        try {
            const token = getAccessToken();
            const { data } = await axios.post(
                `${backendUrl}/api/user/submit-payment`,
                {
                    courseId,
                    paymentMethod: selectedMethod,
                    phoneNumber,
                    transactionRef
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success(data.message);
                navigate('/my-enrollments');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!paymentInfo) {
        return null;
    }

    const selectedMethodInfo = paymentInfo.paymentMethods.find(m => m.id === selectedMethod);

    return (
        <>
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Paiement Mobile Money</h1>
                        <p className="mt-2 text-gray-600">Payez en toute sécurité via Mobile Money</p>
                    </div>

                    {/* Course Info */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            {paymentInfo.course.title}
                        </h2>
                        <div className="flex items-center gap-4 text-gray-600">
                            <span className="line-through">{paymentInfo.currency} {paymentInfo.course.price}</span>
                            <span className="text-2xl font-bold text-blue-600">
                                {paymentInfo.currency} {paymentInfo.course.finalAmount}
                            </span>
                            {paymentInfo.course.discount > 0 && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                    -{paymentInfo.course.discount}%
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            1. Choisissez votre mode de paiement
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {paymentInfo.paymentMethods.map((method) => (
                                <button
                                    key={method.id}
                                    type="button"
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                                        selectedMethod === method.id
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="font-semibold text-gray-800">{method.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Payment Instructions */}
                    {selectedMethodInfo && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                2. Effectuez le paiement
                            </h3>
                            <div className="space-y-3">
                                <p className="text-gray-700">
                                    <strong>Montant à envoyer:</strong>{' '}
                                    <span className="text-xl font-bold text-blue-600">
                                        {paymentInfo.currency} {paymentInfo.course.finalAmount}
                                    </span>
                                </p>
                                <p className="text-gray-700">
                                    <strong>Numéro {selectedMethodInfo.name}:</strong>{' '}
                                    <span className="text-xl font-mono bg-white px-3 py-1 rounded">
                                        {selectedMethodInfo.phone}
                                    </span>
                                </p>
                                <p className="text-gray-600 text-sm">
                                    {selectedMethodInfo.instructions}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Confirmation Form */}
                    {selectedMethod && (
                        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                3. Confirmez votre paiement
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Votre numéro de téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="+243 XXX XXX XXX"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Référence de transaction (ID de confirmation)
                                    </label>
                                    <input
                                        type="text"
                                        value={transactionRef}
                                        onChange={(e) => setTransactionRef(e.target.value)}
                                        placeholder="Ex: MP240117XXXXX"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Entrez l'ID de transaction reçu par SMS après votre paiement
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Envoi en cours...' : 'Confirmer le paiement'}
                                </button>
                            </div>

                            <p className="text-sm text-gray-500 mt-4 text-center">
                                Votre inscription sera activée après vérification du paiement (généralement sous 24h)
                            </p>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            ← Retour au cours
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Payment;
