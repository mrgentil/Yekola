import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const PaymentManagement = () => {
    const { backendUrl, getAccessToken } = useContext(AppContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        try {
            const token = getAccessToken();
            const { data } = await axios.get(
                `${backendUrl}/api/user/admin/pending-payments`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                setRequests(data.requests);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        if (!window.confirm("Confirmer l'approbation de ce paiement ?")) return;
        
        setProcessing(requestId);
        try {
            const token = getAccessToken();
            const { data } = await axios.post(
                `${backendUrl}/api/user/admin/approve-payment/${requestId}`,
                { adminNote: "Paiement vérifié" },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success(data.message);
                fetchPendingRequests();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (requestId) => {
        const reason = window.prompt("Raison du rejet (optionnel):");
        if (reason === null) return;
        
        setProcessing(requestId);
        try {
            const token = getAccessToken();
            const { data } = await axios.post(
                `${backendUrl}/api/user/admin/reject-payment/${requestId}`,
                { adminNote: reason || "Paiement non vérifié" },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success(data.message);
                fetchPendingRequests();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setProcessing(null);
        }
    };

    const getMethodLabel = (method) => {
        const labels = {
            'mpesa': 'M-Pesa',
            'orange_money': 'Orange Money',
            'airtel_money': 'Airtel Money'
        };
        return labels[method] || method;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Gestion des Paiements Mobile Money
            </h1>

            {requests.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500 text-lg">Aucune demande de paiement en attente</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Étudiant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cours
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Montant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Méthode
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Téléphone
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Réf. Transaction
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.map((request) => (
                                <tr key={request._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {request.userId?.firstName} {request.userId?.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {request.userId?.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {request.courseId?.courseTitle}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-green-600">
                                            {request.currency} {request.amount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                            {getMethodLabel(request.paymentMethod)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {request.phoneNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                            {request.transactionRef}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(request._id)}
                                                disabled={processing === request._id}
                                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {processing === request._id ? '...' : 'Approuver'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(request._id)}
                                                disabled={processing === request._id}
                                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                                            >
                                                Rejeter
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Instructions de vérification</h3>
                <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                    <li>Vérifiez la référence de transaction dans votre historique Mobile Money</li>
                    <li>Confirmez que le montant correspond au prix du cours</li>
                    <li>Vérifiez que le numéro de téléphone correspond à l'expéditeur</li>
                    <li>En cas de doute, contactez l'étudiant avant d'approuver</li>
                </ul>
            </div>
        </div>
    );
};

export default PaymentManagement;
