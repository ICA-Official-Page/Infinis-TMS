import { useState, useEffect } from 'react';
// import { FiCreditCard, FiCheck, FiX, FiPlus, FiTrash2, FiStar } from 'react-icons/fi';
// import { usePayment } from '../data/PaymentContext';
// import { useAuth } from '../data/AuthContext';
import { } from '@fortawesome/free-brands-svg-icons'
import { faBell, faBuilding, faChartBar, faCommentDots, faCreditCard, faEdit, faEye, faMoon, faStar, faUser } from '@fortawesome/free-regular-svg-icons'
import { faBars, faChartLine, faCheck, faGear, faLock, faPlus, faSearch, faSignOut, faTicketAlt, faTimes, faTrash, faUserCog, faUsers, faUsersCog } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../assets/css/payment.css';
import RazorpayButton from './RazorPayButton';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import URI from '../utills';
import toast from 'react-hot-toast';
import SessionEndWarning from './SessionEndWarning';

const Subscription = () => {
    // const {
    //     getPlans,
    //     getCurrentSubscription,
    //     getPaymentMethods,
    //     getTransactions,
    //     subscribeToPlan,
    //     cancelSubscription,
    //     addPaymentMethod,
    //     removePaymentMethod,
    //     getPlan
    // } = usePayment();

    const { user, sessionWarning } = useSelector(store => store.user);
    const dispatch = useDispatch();
    const currentUser = user;

    const [plans, setPlans] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [newPaymentMethod, setNewPaymentMethod] = useState({
        type: 'card',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        holderName: '',
        isDefault: false
    });

    const fetchYourPlans = async () => {
        try {
            const res = await axios.get(`${URI}/payment/yourplans/${'branch'}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => {
                setPlans(res?.data?.singleBranch);
            }).catch(err => {
                // Handle error and show toast
                if (err.response && err.response.data && err.response.data.message) {
                    toast.error(err.response.data.message); // For 400, 401, etc.
                } else {
                    toast.error("Something went wrong");
                }
            });
        } catch (error) {
            console.log("while fetching all Users data", error);
        }
    }

    useEffect(() => {
        // loadSubscriptionData();
        fetchYourPlans();
    }, []);

    // const loadSubscriptionData = () => {
    //     setPlans(getPlans());
    //     setCurrentSubscription(getCurrentSubscription());
    //     setPaymentMethods(getPaymentMethods());
    //     setTransactions(getTransactions());
    // };

    // Subscribe to plan
    const subscribeToPlan = (planId) => {
        if (!currentUser) {
            return { success: false, error: 'User not authenticated' };
        }

        const plan = initialPlans.find(p => p?.id === planId);
        if (!plan) {
            return { success: false, error: 'Plan not found' };
        }

        // const paymentMethod = initialPaymentMethods.find(pm => pm?.id === paymentMethodId);
        // if (!paymentMethod) {
        //     return { success: false, error: 'Payment method not found' };
        // }

        // Cancel existing subscription
        initialSubscriptions(prev =>
            prev.map(sub =>
                sub?.userId === currentUser?._id && sub?.status === 'active'
                    ? { ...sub, status: 'canceled', canceledAt: new Date()?.toISOString() }
                    : sub
            )
        );

        // Create new subscription
        const newSubscription = {
            id: '123',
            userId: currentUser?._id,
            planId: planId,
            status: 'active',
            currentPeriodStart: new Date()?.toISOString(),
            currentPeriodEnd: new Date(Date?.now() + 30 * 24 * 60 * 60 * 1000)?.toISOString(),
            cancelAtPeriodEnd: false,
            createdAt: new Date()?.toISOString()
        };

        // Create transaction
        const newTransaction = {
            id: 'T123',
            userId: currentUser?._id,
            subscriptionId: newSubscription?.id,
            amount: plan?.price,
            currency: plan?.currency,
            status: 'succeeded',
            description: `₹{plan?.name} - Monthly`,
            createdAt: new Date()?.toISOString(),
            // paymentMethodId: paymentMethodId
        };

        initialSubscriptions(prev => [...prev, newSubscription]);
        // setTransactions(prev => [...prev, newTransaction]);

        return { success: true, subscription: newSubscription };
    };

    const handleSubscribe = async (planId) => {
        // if (paymentMethods?.length === 0) {
        //     alert('Please add a payment method first');
        //     return;
        // }

        setIsLoading(true);
        // const defaultPaymentMethod = paymentMethods?.find(pm => pm.isDefault) || paymentMethods[0];

        const result = subscribeToPlan(planId);

        if (result?.success) {
            // loadSubscriptionData();
            alert('Successfully subscribed to plan!');
        } else {
            alert(result?.error);
        }

        setIsLoading(false);
    };

    // const handleCancelSubscription = async () => {
    //     if (!currentSubscription) return;

    //     if (alert('Are you sure you want to cancel your subscription?')) {
    //         const result = cancelSubscription(currentSubscription?.id);

    //         if (result.success) {
    //             loadSubscriptionData();
    //             alert('Subscription will be canceled at the end of the billing period');
    //         } else {
    //             alert(result.error);
    //         }
    //     }
    // };

    // const handleAddPaymentMethod = async (e) => {
    //     e.preventDefault();

    //     // Basic validation
    //     if (!newPaymentMethod?.cardNumber || !newPaymentMethod?.expiryMonth ||
    //         !newPaymentMethod?.expiryYear || !newPaymentMethod?.cvc) {
    //         alert('Please fill in all required fields');
    //         return;
    //     }

    //     const paymentMethodData = {
    //         type: 'card',
    //         brand: newPaymentMethod?.cardNumber.startsWith('4') ? 'visa' : 'mastercard',
    //         last4: newPaymentMethod?.cardNumber.slice(-4),
    //         expiryMonth: parseInt(newPaymentMethod?.expiryMonth),
    //         expiryYear: parseInt(newPaymentMethod?.expiryYear),
    //         holderName: newPaymentMethod?.holderName,
    //         isDefault: paymentMethods?.length === 0 || newPaymentMethod?.isDefault
    //     };

    //     const result = addPaymentMethod(paymentMethodData);

    //     if (result.success) {
    //         loadSubscriptionData();
    //         setIsAddingPaymentMethod(false);
    //         setNewPaymentMethod({
    //             type: 'card',
    //             cardNumber: '',
    //             expiryMonth: '',
    //             expiryYear: '',
    //             cvc: '',
    //             holderName: '',
    //             isDefault: false
    //         });
    //         alert('Payment method added successfully!');
    //     } else {
    //         alert(result.error);
    //     }
    // };

    // const handleRemovePaymentMethod = (paymentMethodId) => {
    //     if (alert('Are you sure you want to remove this payment method?')) {
    //         const result = removePaymentMethod(paymentMethodId);

    //         if (result.success) {
    //             loadSubscriptionData();
    //             alert('Payment method removed successfully!');
    //         } else {
    //             alert(result.error);
    //         }
    //     }
    // };


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
    const initialSubscriptions =
    {
        id: '1',
        userId: '2', // admin
        planId: 'professional',
        status: 'active',
        currentPeriodStart: new Date()?.toISOString(),
        currentPeriodEnd: new Date(Date?.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(Date?.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
        ;

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
            createdAt: new Date(Date?.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            paymentMethodId: '1'
        }
    ];

    const currentPlan = initialSubscriptions ? initialPlans?.find((plan) => initialSubscriptions?.planId === plan?.id) : null;

    return (
        <div className="page-container">
            {sessionWarning && <SessionEndWarning />}
            <div className="page-header">
                <h1 className="page-title">Subscription & Billing</h1>
                <p className="page-description">
                    Manage your subscription plan and payment methods
                </p>
            </div>

            {/* Current Subscription */}
            {/* {currentSubscription && 
            currentPlan &&
             ( */}
            <div className="subscription-current">
                <div className="subscription-current-header">
                    <h2>Current Plan</h2>
                    {initialSubscriptions?.cancelAtPeriodEnd && (
                        <span className="badge badge-warning">Canceling at period end</span>
                    )}
                </div>
                <div className="subscription-current-content">
                    <div className="subscription-current-plan">
                        <h3>{currentPlan?.name}</h3>
                        <div className="subscription-current-price">
                            ₹{currentPlan?.price}/{currentPlan?.interval}
                            {/* ₹74/monthly */}
                        </div>
                        <p>Next billing: {new Date(initialSubscriptions?.currentPeriodEnd)?.toLocaleDateString()}</p>
                    </div>
                    <div className="subscription-current-actions">
                        {/* {!currentSubscription?.cancelAtPeriodEnd && (
                                <button
                                    className="btn btn-danger"
                                    onClick={handleCancelSubscription}
                                >
                                    Cancel Subscription
                                </button>
                            )} */}
                    </div>
                </div>
            </div>
            {/* )} */}

            {/* Available Plans */}
            <div className="subscription-plans">
                <h2>Available Plans</h2>
                <div className="plans-grid">
                    {Array.isArray(plans) && plans?.map(plan => (
                        <div
                            key={plan?.id}
                            className={`plan-card ${plan?.isPopular ? 'plan-card-popular' : ''} ${currentPlan?.id === plan?.id ? 'plan-card-current' : ''
                                }`}
                        >
                            {plan?.isPopular && (
                                <div className="plan-card-badge">
                                    {/* <FiStar /> */}
                                    <FontAwesomeIcon icon={faStar} /> Most Popular
                                </div>
                            )}

                            <div className="plan-card-header">
                                <h3 className="plan-card-name">{plan?.duration}</h3>
                                <div className="plan-card-price">
                                    <span className="plan-card-currency">₹</span>
                                    <span className="plan-card-amount">{plan?.price}</span>
                                    <span className="plan-card-interval">/{plan?.duration}</span>
                                </div>
                            </div>

                            <div className="plan-card-features">
                                {/* {plan?.features?.map((feature, index) => ( */}
                                <div className="plan-card-feature">
                                    {/* <FiCheck className="plan-card-feature-icon" /> */}
                                    <FontAwesomeIcon icon={faCheck} className="plan-card-feature-icon" />
                                    <span>{plan?.description}</span>
                                </div>
                                <div className="plan-card-feature">
                                    {/* <FiCheck className="plan-card-feature-icon" /> */}
                                    <FontAwesomeIcon icon={faCheck} className="plan-card-feature-icon" />
                                    <span>{plan?.benifits}</span>
                                </div>
                                {/* ))} */}
                            </div>

                            <div className="plan-card-footer">
                                {currentPlan?.id === plan?.id ? (
                                    <button className="btn btn-outline" disabled>
                                        Current Plan
                                    </button>
                                ) : (
                                    <button
                                        className={`btn ${plan?.isPopular ? 'btn-primary' : 'btn-outline'}`}
                                        // onClick={() => handleSubscribe(plan?.id)}
                                        disabled={isLoading}
                                    >
                                        <RazorpayButton amount={plan?.pricex} />
                                        {/* {isLoading ? 'Processing...' : 'Subscribe'} */}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Methods */}
            {/* <div className="payment-methods">
                <div className="payment-methods-header">
                    <h2>Payment Methods</h2>
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsAddingPaymentMethod(true)}
                    >
                        <FontAwesomeIcon icon={faPlus} className="btn-icon" />
                        Add Payment Method
                    </button>
                </div>

                <div className="payment-methods-list">
                        <div 
                         className="payment-method-card">
                            <div className="payment-method-info">
                                <div className="payment-method-brand">
                                    <FontAwesomeIcon icon={faCreditCard} />
                                    <span>VISA
                                        </span>
                                </div>
                                <div className="payment-method-details">
                                    <span>**** **** **** 4242
                                        </span>
                                    <span>Expires 2/2025
                                        
                                        </span>
                                </div>
                                    <span className="badge badge-primary">Default</span>
                            </div>
                            <button
                                className="btn btn-sm btn-danger"
                            >
                                <FontAwesomeIcon icon={faTrash} />

                            </button>
                        </div>
                </div>
            </div> */}

            {/* Add Payment Method Modal */}
            {isAddingPaymentMethod && (
                <div className="modal-backdrop active">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Add Payment Method</h2>
                            <button
                                className="modal-close"
                                onClick={() => setIsAddingPaymentMethod(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form
                            // onSubmit={handleAddPaymentMethod}
                            className="modal-body">
                            <div className="form-group">
                                <label htmlFor="cardNumber">Card Number</label>
                                <input
                                    type="text"
                                    id="cardNumber"
                                    placeholder="1234 5678 9012 3456"
                                    value={newPaymentMethod?.cardNumber}
                                    onChange={(e) => setNewPaymentMethod({
                                        ...newPaymentMethod,
                                        cardNumber: e.target.value
                                    })}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="expiryMonth">Expiry Month</label>
                                    <select
                                        id="expiryMonth"
                                        value={newPaymentMethod?.expiryMonth}
                                        onChange={(e) => setNewPaymentMethod({
                                            ...newPaymentMethod,
                                            expiryMonth: e.target.value
                                        })}
                                        required
                                    >
                                        <option value="">Month</option>
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {String(i + 1)?.padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="expiryYear">Expiry Year</label>
                                    <select
                                        id="expiryYear"
                                        value={newPaymentMethod?.expiryYear}
                                        onChange={(e) => setNewPaymentMethod({
                                            ...newPaymentMethod,
                                            expiryYear: e.target.value
                                        })}
                                        required
                                    >
                                        <option value="">Year</option>
                                        {Array.from({ length: 10 }, (_, i) => {
                                            const year = new Date()?.getFullYear() + i;
                                            return (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="cvc">CVC</label>
                                    <input
                                        type="text"
                                        id="cvc"
                                        placeholder="123"
                                        maxLength="4"
                                        value={newPaymentMethod?.cvc}
                                        onChange={(e) => setNewPaymentMethod({
                                            ...newPaymentMethod,
                                            cvc: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="holderName">Cardholder Name</label>
                                <input
                                    type="text"
                                    id="holderName"
                                    placeholder="John Doe"
                                    value={newPaymentMethod?.holderName}
                                    onChange={(e) => setNewPaymentMethod({
                                        ...newPaymentMethod,
                                        holderName: e.target.value
                                    })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={newPaymentMethod?.isDefault}
                                        onChange={(e) => setNewPaymentMethod({
                                            ...newPaymentMethod,
                                            isDefault: e.target.checked
                                        })}
                                    />
                                    Set as default payment method
                                </label>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsAddingPaymentMethod(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Payment Method
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Recent Transactions */}
            <div className="recent-transactions">
                <h2>Recent Transactions</h2>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialTransactions?.slice(0, 5)?.map(transaction => (
                                <tr
                                // key={transaction.id}
                                >
                                    <td>
                                        {/* 6/20/2025 */}
                                        {new Date(transaction?.createdAt)?.toLocaleDateString()}
                                    </td>
                                    <td>
                                        {/* Professional Plan - Monthly */}
                                        {transaction?.description}
                                    </td>
                                    <td>
                                        {/* ₹79.99 */}
                                        {transaction?.amount?.toFixed(2)}
                                    </td>
                                    <td>
                                        <span
                                            className={`badge ${transaction?.status === 'succeeded'
                                                ? 'badge-success'
                                                : transaction?.status === 'failed'
                                                    ? 'badge-danger'
                                                    : 'badge-warning'
                                                }`}
                                        // className='succeeded'
                                        >
                                            {/* Succeeded */}
                                            {transaction?.status?.charAt(0)?.toUpperCase() + transaction?.status?.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Subscription;