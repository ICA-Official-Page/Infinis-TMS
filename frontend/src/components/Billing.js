import { useState, useEffect } from 'react';
// import { FiCreditCard, FiDollarSign, FiUsers, FiTrendingUp, FiCalendar, FiDownload } from 'react-icons/fi';
// import { usePayment } from '../data/PaymentContext';
// import { useAuth } from '../data/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { } from '@fortawesome/free-brands-svg-icons'
import { faBuilding, faCalendar, faCommentDots, faCreditCard, faUser } from '@fortawesome/free-regular-svg-icons'
import { faChartLine, faDollarSign, faDownload, faLock, faTicketAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '../assets/css/billing.css';
import PlanForm from './PlanForm';
import axios from 'axios';
import URI from '../utills';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import SessionEndWarning from './SessionEndWarning';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Billing = () => {
  // const { getPlans, getTransactions } = usePayment();
  // const { getUsers } = useAuth();
  const [plans, setPlans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [revenueData, setRevenueData] = useState(null);

  const { user, sessionWarning } = useSelector(store => store.user);
  const dispatch = useDispatch();

  useEffect(() => {
    loadBillingData();
    fetchAllPlans();
  }, []);

  const fetchAllPlans = async () => {
    try {
      const res = await axios.get(`${URI}/payment/allplans`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        setPlans(res?.data?.allPlans);
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


  // Plan distribution data
  const planDistribution = {
    labels: plans?.map(plan => plan?.name),
    datasets: [{
      data: plans?.map(plan => {
        // For demo purposes, generate some sample data
        return Math?.floor(Math?.random() * 20) + 5;
      }),
      backgroundColor: [
        'var(--color-primary-500)',
        'var(--color-success-500)',
        'var(--color-warning-500)',
        'var(--color-accent-500)'
      ]
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return '$' + value;
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  const initialPlans = [
    {
      id: 'basic',
      // name: 'Basic Plan',
      price: 29.99,
      currency: 'USD',
      duration: '1 month',
      // features: [
      //   'Up to 100 tickets per month',
      //   '1 Branch',
      //   '5 Users',
      //   'Basic Support',
      //   'Email Notifications'
      // ],
      // maxTickets: 100,
      // maxBranches: 1,
      // maxUsers: 5,
      isPopular: false
    },
    {
      id: 'professional',
      // name: 'Professional Plan',
      price: 79.99,
      currency: 'USD',
      duration: '3 month',
      // features: [
      //   'Up to 500 tickets per month',
      //   '5 Branches',
      //   '25 Users',
      //   'Priority Support',
      //   'Advanced Analytics',
      //   'Custom Categories',
      //   'API Access'
      // ],
      // maxTickets: 500,
      // maxBranches: 5,
      // maxUsers: 25,
      isPopular: true
    },
    {
      id: 'enterprise',
      // name: 'Enterprise Plan',
      price: 199.99,
      currency: 'USD',
      duration: '6 month',
      // features: [
      //   'Unlimited tickets',
      //   'Unlimited Branches',
      //   'Unlimited Users',
      //   '24/7 Premium Support',
      //   'Advanced Analytics & Reports',
      //   'Custom Integrations',
      //   'White-label Solution',
      //   'Dedicated Account Manager'
      // ],
      // maxTickets: -1, // unlimited
      // maxBranches: -1,
      // maxUsers: -1,
      isPopular: false
    }
  ];

  const initialTransactions = [
    {
      id: '1',
      userId: '2',
      subscriptionId: '1',
      amount: 79.99,
      currency: 'USD',
      status: 'succeeded',
      description: 'Professional Plan - Monthly',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)?.toISOString(),
      paymentMethodId: '1'
    }
  ];

  const initialUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'superadmin@example.com',
      password: 'password123',
      role: 'superadmin',
      avatar: null,
      createdAt: new Date()?.toISOString(),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      branchIds: ['1', '2'],
      avatar: null,
      createdAt: new Date()?.toISOString(),
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'manager@example.com',
      password: 'password123',
      role: 'manager',
      branchId: '1',
      departmentIds: ['1', '2'],
      avatar: null,
      createdAt: new Date()?.toISOString(),
    },
    {
      id: '4',
      name: 'Sarah Williams',
      email: 'teamleader@example.com',
      password: 'password123',
      role: 'teamleader',
      branchId: '1',
      departmentId: '1',
      avatar: null,
      createdAt: new Date()?.toISOString(),
    },
    {
      id: '5',
      name: 'David Brown',
      email: 'executive@example.com',
      password: 'password123',
      role: 'executive',
      branchId: '1',
      departmentId: '1',
      avatar: null,
      createdAt: new Date()?.toISOString(),
    },
  ];


  const loadBillingData = () => {
    const allPlans = initialPlans;
    const allTransactions = initialTransactions;
    const allUsers = initialUsers;

    // setPlans(allPlans);
    setTransactions(allTransactions);
    setUsers(allUsers);

    // Calculate revenue data
    calculateRevenueData(allTransactions);
  };

  const calculateRevenueData = (transactions) => {
    const last6Months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now?.getFullYear(), now?.getMonth() - i, 1);
      const monthName = date?.toLocaleDateString('en-US', { month: 'short' });
      const monthRevenue = transactions
        .filter(t => {
          const transactionDate = new Date(t?.createdAt);
          return transactionDate?.getMonth() === date?.getMonth() &&
            transactionDate?.getFullYear() === date?.getFullYear() &&
            t?.status === 'succeeded';
        })
        .reduce((sum, t) => sum + t?.amount, 0);

      last6Months?.push({
        month: monthName,
        revenue: monthRevenue
      });
    }

    setRevenueData({
      labels: last6Months?.map(m => m?.month),
      datasets: [{
        label: 'Revenue ($)',
        data: last6Months?.map(m => m?.revenue),
        backgroundColor: 'var(--color-primary-500)',
        borderColor: 'var(--color-primary-600)',
        borderWidth: 1
      }]
    });
  };

  // Calculate statistics
  const totalRevenue = transactions
    .filter(t => t?.status === 'succeeded')
    .reduce((sum, t) => sum + t?.amount, 0);

  const monthlyRevenue = transactions
    .filter(t => {
      const transactionDate = new Date(t?.createdAt);
      const now = new Date();
      return transactionDate?.getMonth() === now?.getMonth() &&
        transactionDate?.getFullYear() === now?.getFullYear() &&
        t?.status === 'succeeded';
    })
    .reduce((sum, t) => sum + t?.amount, 0);

  const activeSubscriptions = users?.filter(user => user.role === 'admin')?.length;

  const [activeOverview, setActiveOverview] = useState(true);
  const [activePlans, setActivePlans] = useState(false);
  const [activeRecents, setActiveRecents] = useState(false);
  const [isFormActive, setIsFormActive] = useState(false);

  const changeDiv = (setState) => {
    setActiveOverview(false);
    setActivePlans(false);
    setIsFormActive(false);
    setActiveRecents(false);
    setState(true);
  }

  return (
    <div className="page-container">
      {sessionWarning && <SessionEndWarning />}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Billing & Revenue</h1>
          <p className="page-description">
            Monitor subscription revenue and billing analytics
          </p>
        </div>

        <div className="header-right">
          <ul className="billing-nav">
            <li className={activeOverview && 'active'} onClick={() => changeDiv(setActiveOverview)} >Overview</li>
            <li className={activePlans && 'active'} onClick={() => changeDiv(setActivePlans)} >Plans</li>
            <li className={activeRecents && 'active'} onClick={() => changeDiv(setActiveRecents)} >Recents</li>
          </ul>
          <button className="btn btn-primary">
            <FontAwesomeIcon icon={faDownload} className="btn-icon" />
            Export Report
          </button>
        </div>
      </div>

      {
        activeOverview &&
        <div>
          {/* Revenue Stats */}
          <div className="stats-cards">
            <div className="stats-card">
              <div className="stats-card-icon stats-card-icon-success">
                {/* <FiDollarSign /> */}
                <FontAwesomeIcon icon={faDollarSign} />
              </div>
              <div className="stats-card-content">
                <h3 className="stats-card-title">Total Revenue</h3>
                <div className="stats-card-value">${totalRevenue?.toFixed(2)}</div>
              </div>
            </div>

            <div className="stats-card">
              <div className="stats-card-icon stats-card-icon-primary">
                {/* <FiTrendingUp /> */}
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <div className="stats-card-content">
                <h3 className="stats-card-title">Monthly Revenue</h3>
                <div className="stats-card-value">${monthlyRevenue?.toFixed(2)}</div>
              </div>
            </div>

            <div className="stats-card">
              <div className="stats-card-icon stats-card-icon-warning">
                {/* <FiUsers /> */}
                <FontAwesomeIcon icon={faUser} />
              </div>
              <div className="stats-card-content">
                <h3 className="stats-card-title">Active Subscriptions</h3>
                <div className="stats-card-value">{activeSubscriptions}</div>
              </div>
            </div>

            <div className="stats-card">
              <div className="stats-card-icon stats-card-icon-info">
                {/* <FiCreditCard /> */}
                <FontAwesomeIcon icon={faCreditCard} />
              </div>
              <div className="stats-card-content">
                <h3 className="stats-card-title">Successful Payments</h3>
                <div className="stats-card-value">
                  {transactions?.filter(t => t?.status === 'succeeded')?.length}
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="dashboard-charts">
            <div className="dashboard-chart-container">
              <div className="dashboard-chart-header">
                <h2 className="dashboard-chart-title">Revenue Trend (Last 6 Months)</h2>
              </div>
              <div className="dashboard-chart">
                {revenueData && <Bar data={revenueData} options={chartOptions} />}
              </div>
            </div>

            <div className="dashboard-chart-container">
              <div className="dashboard-chart-header">
                <h2 className="dashboard-chart-title">Plan Distribution</h2>
              </div>
              <div className="dashboard-chart">
                <Doughnut data={planDistribution} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>
      }

      {/* Subscription Plans Overview */}
      {
        activePlans &&
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Subscription Plans</h2>
            <button className="btn btn-primary" onClick={() => setIsFormActive(!isFormActive)} >Create Plan</button>
          </div>
          {
            isFormActive ?
              <div className='card-body'>
                <PlanForm
                  setIsFormActive={setIsFormActive}
                  fetchBranches={fetchAllPlans}
                />
              </div>
              :
              <div className="billing-plans-grid">
                {plans?.map(plan => (
                  <div key={plan?._id} className="billing-plan-card">
                    <div className="billing-plan-header">
                      {/* <h3 className="billing-plan-name">{plan?.name}</h3> */}
                      <div className="billing-plan-price">
                        <span className="billing-plan-currency">₹</span>
                        <span className="billing-plan-amount">{plan?.price}</span>
                        <span className="billing-plan-interval">/{plan?.duration}</span>
                      </div>
                    </div>
                    <div className="billing-plan-stats">
                      <div className="billing-plan-stat">
                        <span className="billing-plan-stat-label">Active Subscriptions</span>
                        <span className="billing-plan-stat-value">
                          {plan?.Active}
                        </span>
                      </div>
                      <div className="billing-plan-stat">
                        <span className="billing-plan-stat-label">Monthly Revenue</span>
                        <span className="billing-plan-stat-value">
                          ${(plan?.price * (Math?.floor(Math?.random() * 20) + 5))?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          }

        </div>
      }
      {/* Recent Transactions */}
      {
        activeRecents &&

        <div className="dashboard-section">
          <h2 className="dashboard-section-title">Recent Transactions</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.slice(0, 10)?.map(transaction => (
                  <tr key={transaction?.id}>
                    <td>#{transaction?.id?.slice(0, 8)}</td>
                    <td>{transaction?.description}</td>
                    <td>${transaction?.amount?.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${transaction?.status === 'succeeded'
                        ? 'badge-success'
                        : transaction?.status === 'failed'
                          ? 'badge-danger'
                          : 'badge-warning'
                        }`}>
                        {transaction?.status?.charAt(0)?.toUpperCase() + transaction?.status?.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="date-cell">
                        {/* <FiCalendar className="date-icon" /> */}
                        <FontAwesomeIcon icon={faCalendar} className="date-icon" />
                        {new Date(transaction?.createdAt)?.toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      }

    </div>
  );
};

export default Billing;