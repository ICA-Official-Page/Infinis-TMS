import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { useSelector } from 'react-redux';

// Create payment context
const PaymentContext = createContext();

// Sample subscription plans
const initialPlans = [
    {
        id: 'basic',
        name: 'Basic Plan',
        price: 29.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
            'Up to 100 tickets per month',
            '1 Branch',
            '5 Users',
            'Basic Support',
            'Email Notifications'
        ],
        maxTickets: 100,
        maxBranches: 1,
        maxUsers: 5,
        isPopular: false
    },
    {
        id: 'professional',
        name: 'Professional Plan',
        price: 79.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
            'Up to 500 tickets per month',
            '5 Branches',
            '25 Users',
            'Priority Support',
            'Advanced Analytics',
            'Custom Categories',
            'API Access'
        ],
        maxTickets: 500,
        maxBranches: 5,
        maxUsers: 25,
        isPopular: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise Plan',
        price: 199.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
            'Unlimited tickets',
            'Unlimited Branches',
            'Unlimited Users',
            '24/7 Premium Support',
            'Advanced Analytics & Reports',
            'Custom Integrations',
            'White-label Solution',
            'Dedicated Account Manager'
        ],
        maxTickets: -1, // unlimited
        maxBranches: -1,
        maxUsers: -1,
        isPopular: false
    }
];

// Sample payment methods
const initialPaymentMethods = [
    {
        id: '1',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
        userId: '2' // admin
    }
];

// Sample subscriptions
const initialSubscriptions = [
    {
        id: '1',
        userId: '2', // admin
        planId: 'professional',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
];

// Sample transactions
const initialTransactions = [
    {
        id: '1',
        userId: '2',
        subscriptionId: '1',
        amount: 79.99,
        currency: 'USD',
        status: 'succeeded',
        description: 'Professional Plan - Monthly',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethodId: '1'
    }
];

export const PaymentProvider = ({ children }) => {
    const { user, theme, notificationCount, sessionWarning } = useSelector(store => store.user);
    const currentUser = user;

    const [plans, setPlans] = useState(() => {
        const savedPlans = localStorage.getItem('subscriptionPlans');
        return savedPlans ? JSON.parse(savedPlans) : initialPlans;
    });

    const [paymentMethods, setPaymentMethods] = useState(() => {
        const savedMethods = localStorage.getItem('paymentMethods');
        return savedMethods ? JSON.parse(savedMethods) : initialPaymentMethods;
    });

    const [subscriptions, setSubscriptions] = useState(() => {
        const savedSubscriptions = localStorage.getItem('subscriptions');
        return savedSubscriptions ? JSON.parse(savedSubscriptions) : initialSubscriptions;
    });

    const [transactions, setTransactions] = useState(() => {
        const savedTransactions = localStorage.getItem('transactions');
        return savedTransactions ? JSON.parse(savedTransactions) : initialTransactions;
    });

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('subscriptionPlans', JSON.stringify(plans));
    }, [plans]);

    useEffect(() => {
        localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
    }, [paymentMethods]);

    useEffect(() => {
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    }, [subscriptions]);

    useEffect(() => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }, [transactions]);

    // Get subscription plans
    const getPlans = () => {
        return plans;
    };

    // Get user's current subscription
    const getCurrentSubscription = (userId = currentUser?._id) => {
        if (!userId) return null;
        return subscriptions.find(sub => sub.userId === userId && sub.status === 'active');
    };

    // Get user's payment methods
    const getPaymentMethods = (userId = currentUser?._id) => {
        if (!userId) return [];
        return paymentMethods.filter(method => method?.userId === userId);
    };

    // Get user's transactions
    const getTransactions = (userId = currentUser?._id) => {
        if (!userId) return [];
        return transactions
            .filter(transaction => transaction.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    // Add payment method
    const addPaymentMethod = (paymentMethodData) => {
        if (!currentUser) {
            return { success: false, error: 'User not authenticated' };
        }

        const newPaymentMethod = {
            id: uuidv4(),
            ...paymentMethodData,
            userId: currentUser?._id,
            createdAt: new Date().toISOString()
        };

        // If this is set as default, remove default from others
        if (newPaymentMethod.isDefault) {
            setPaymentMethods(prev =>
                prev.map(method =>
                    method.userId === currentUser?._id
                        ? { ...method, isDefault: false }
                        : method
                )
            );
        }

        setPaymentMethods(prev => [...prev, newPaymentMethod]);
        return { success: true, paymentMethod: newPaymentMethod };
    };

    // Remove payment method
    const removePaymentMethod = (paymentMethodId) => {
        if (!currentUser) {
            return { success: false, error: 'User not authenticated' };
        }

        setPaymentMethods(prev =>
            prev.filter(method => method.id !== paymentMethodId)
        );
        return { success: true };
    };

    // Subscribe to plan
    const subscribeToPlan = (planId, paymentMethodId) => {
        if (!currentUser) {
            return { success: false, error: 'User not authenticated' };
        }

        const plan = plans.find(p => p.id === planId);
        if (!plan) {
            return { success: false, error: 'Plan not found' };
        }

        const paymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId);
        if (!paymentMethod) {
            return { success: false, error: 'Payment method not found' };
        }

        // Cancel existing subscription
        setSubscriptions(prev =>
            prev.map(sub =>
                sub.userId === currentUser?._id && sub.status === 'active'
                    ? { ...sub, status: 'canceled', canceledAt: new Date().toISOString() }
                    : sub
            )
        );

        // Create new subscription
        const newSubscription = {
            id: uuidv4(),
            userId: currentUser?._id,
            planId: planId,
            status: 'active',
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false,
            createdAt: new Date().toISOString()
        };

        // Create transaction
        const newTransaction = {
            id: uuidv4(),
            userId: currentUser?._id,
            subscriptionId: newSubscription.id,
            amount: plan.price,
            currency: plan.currency,
            status: 'succeeded',
            description: `${plan.name} - Monthly`,
            createdAt: new Date().toISOString(),
            paymentMethodId: paymentMethodId
        };

        setSubscriptions(prev => [...prev, newSubscription]);
        setTransactions(prev => [...prev, newTransaction]);

        return { success: true, subscription: newSubscription };
    };

    // Cancel subscription
    const cancelSubscription = (subscriptionId) => {
        if (!currentUser) {
            return { success: false, error: 'User not authenticated' };
        }

        setSubscriptions(prev =>
            prev.map(sub =>
                sub.id === subscriptionId
                    ? { ...sub, cancelAtPeriodEnd: true }
                    : sub
            )
        );

        return { success: true };
    };

    // Process payment (dummy implementation)
    const processPayment = (amount, currency, paymentMethodId, description) => {
        if (!currentUser) {
            return { success: false, error: 'User not authenticated' };
        }

        // Simulate payment processing
        const transaction = {
            id: uuidv4(),
            userId: currentUser?._id,
            amount: amount,
            currency: currency,
            status: Math.random() > 0.1 ? 'succeeded' : 'failed', // 90% success rate
            description: description,
            createdAt: new Date().toISOString(),
            paymentMethodId: paymentMethodId
        };

        setTransactions(prev => [...prev, transaction]);

        return {
            success: transaction.status === 'succeeded',
            transaction: transaction,
            error: transaction.status === 'failed' ? 'Payment failed. Please try again.' : null
        };
    };

    // Get plan by ID
    const getPlan = (planId) => {
        return plans.find(plan => plan.id === planId);
    };

    // Check if user has access to feature based on plan
    const hasFeatureAccess = (feature) => {
        if (!currentUser) return false;

        const subscription = getCurrentSubscription();
        if (!subscription) return false;

        const plan = getPlan(subscription.planId);
        if (!plan) return false;

        // Check specific limits
        switch (feature) {
            case 'unlimited_tickets':
                return plan.maxTickets === -1;
            case 'unlimited_branches':
                return plan.maxBranches === -1;
            case 'unlimited_users':
                return plan.maxUsers === -1;
            case 'api_access':
                return plan.features.includes('API Access');
            case 'advanced_analytics':
                return plan.features.includes('Advanced Analytics');
            default:
                return true;
        }
    };

    const value = {
        plans,
        getPlans,
        getCurrentSubscription,
        getPaymentMethods,
        getTransactions,
        addPaymentMethod,
        removePaymentMethod,
        subscribeToPlan,
        cancelSubscription,
        processPayment,
        getPlan,
        hasFeatureAccess
    };

    return (
        <PaymentContext.Provider value={value}>
            {children}
        </PaymentContext.Provider>
    );
};

export const usePayment = () => {
    const context = useContext(PaymentContext);
    if (!context) {
        throw new Error('usePayment must be used within a PaymentProvider');
    }
    return context;
};

export default PaymentContext;