import { useState, useEffect } from 'react';
import { } from '@fortawesome/free-brands-svg-icons'
import { faBuilding, faCommentDots, faUser } from '@fortawesome/free-regular-svg-icons'
import { faChartLine, faLock, faTicketAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { FaBuilding, FaUsers, FaTicketAlt, FaLock, FaChartBar } from 'react-icons/fa';
import mockUsers from '../../data/mockUsers';
import mockTickets from '../../data/mockTickets';
import mockPasswordRequests from '../../data/mockPasswordRequests';
import mockDepartments from '../../data/mockDepartments';
import mockBranches from '../../data/mockBranches';
import BranchForm from '../../components/BranchForm';
import UserForm from '../../components/UserForm';
import axios from 'axios';
import URI from '../../utills';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import SessionEndWarning from '../../components/SessionEndWarning';
import TicketStatusChart from '../../components/TicketStatusChart';
import OpenTicketCategorization from '../../components/OpenTicketCategorization';
import ReportBar from '../../components/ReportBar';
import TicketCard from '../../components/TicketCard';
import { setSessionWarning } from '../../Redux/userSlice';
import { useDispatch, useSelector } from 'react-redux';

function SuperAdminPanel({ user, view = 'overview' }) {

  //states
  const [branches, setBranches] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [passwordRequests, setPasswordRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { sessionWarning } = useSelector(store => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Statistics
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalDepartments: 0,
    totalUsers: 0,
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    pendingPasswordRequests: 0
  });

  useEffect(() => {
    const stats = {
      totalBranches: branches?.length,
      totalDepartments: departments.length,
      totalUsers: allUsers?.length,
      totalTickets: tickets?.length,
      openTickets: tickets.filter(t => t.status === 'open').length,
      resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
      pendingPasswordRequests: passwordRequests?.length
    };
    setStats(stats);
  }, [allUsers, tickets, passwordRequests, departments, branches]);

  //fetching APIs
  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${URI}/superadmin/getadmins`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        setAllUsers(res?.data?.allBranchesData);
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
  const [ticketSettings, setTicketSettings] = useState({});

  const fetchTicketSettings = async () => {
    try {
      const branch = user?.branches[0];
      const res = await axios.get(`${URI}/admin/getticketsettings/${branch}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(r => {
        setTicketSettings(r?.data?.ticketSettings);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data && err.response.data.message) {
          toast.error(err.response.data.message); // For 400, 401, etc.
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log('while fetching Ticket Settings', error);
    }
  }

  useEffect(() => {
    fetchTicketSettings();
  }, [])

  const fetchAllTickets = async () => {
    try {
      const res = await axios.get(`${URI}/executive/getalltickets`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(res => {
        setTickets(res?.data?.data);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true))
          } else {
            toast.error(err.response.data.message || "Something went wrong");
          }
        } else {
          toast.error("Something went wrong");
        }
      });

    } catch (error) {
      console.log('while feting tickets', error);
    }
  }

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${URI}/superadmin/branches`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        setBranches(res?.data?.branches);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data && err.response.data.message) {
          toast.error(err.response.data.message); // For 400, 401, etc.
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log('while geting branches for super admin', error);
    }
  }

  //fetch department
  const fetchDepartment = async () => {
    try {
      const res = await axios.get(`${URI}/admin/department`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        const matchedExecutives = res?.data?.departmentes;
        setDepartments(matchedExecutives);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data && err.response.data.message) {
          toast.error(err.response.data.message); // For 400, 401, etc.
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log('while geting branches for super admin', error);
    }
  }

  useEffect(() => {
    fetchAllTickets();
    fetchAllUsers();
    fetchBranches();
    fetchDepartment();
    // Load all data
    // setBranches(mockBranches);

    // Get admins
    const adminUsers = allUsers?.filter(u => u.designation === 'admin');
    setAdmins(adminUsers);

    // Get all tickets
    // setTickets(mockTickets);

    // Get password requests from admins
    const adminIds = adminUsers.map(admin => admin.id);


  }, []);

  //normall actions
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
    setIsCommentOpen(false);
  };

  const [myDept, setMyDept] = useState({});

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setMyDept(ticket?.department?.find((dept) => dept?.name === user?.department || ticket?.issuedby === user?.username));
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const formatTime = (timeString) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTat = (tat, createdAt) => {
    const now = Date.now(); // current time in ms
    const [valueStr, unitRaw] = tat?.toLowerCase()?.split(" ");
    const value = parseInt(valueStr);
    const unit = unitRaw.trim();

    let tatInMs = 0;

    if (unit?.startsWith("day")) {
      tatInMs = value * 24 * 60 * 60 * 1000; // days to ms
    } else if (unit?.startsWith("week")) {
      tatInMs = value * 7 * 24 * 60 * 60 * 1000; // weeks to ms
    } else if (unit?.startsWith("hour")) {
      tatInMs = value * 60 * 60 * 1000; // hours to ms
    } else if (unit?.startsWith("minute")) {
      tatInMs = value * 60 * 1000; // minutes to ms
    } else {
      return "Invalid TAT format";
    }

    const elapsed = now - new Date(createdAt).getTime(); // ms since created

    if (elapsed > tatInMs) {
      return "TAT_Over";
    } else {
      const remaining = tatInMs - elapsed;
      const mins = Math.floor((remaining / 1000 / 60) % 60);
      const hrs = Math.floor((remaining / (1000 * 60 * 60)) % 24);
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const sec = Math.floor((remaining / 1000) % 60);
      return `Remaining: ${days > 0 ? `${days}d ` : ''
        }${hrs > 0 ? `${hrs}h ` : ''
        }${!hrs > 0 && mins > 0 ? `${mins}m` : ''
        }${!mins > 0 ? `${sec}s` : ''}`.trim();
    }
  };

  const tatBG = (tat, createdAt) => {
    const now = Date.now(); // current time in ms
    const [valueStr, unitRaw] = tat?.toLowerCase()?.split(" ");
    const value = parseInt(valueStr);
    const unit = unitRaw.trim();

    let tatInMs = 0;

    if (unit?.startsWith("day")) {
      tatInMs = value * 24 * 60 * 60 * 1000; // days to ms
    } else if (unit?.startsWith("week")) {
      tatInMs = value * 7 * 24 * 60 * 60 * 1000; // weeks to ms
    } else if (unit?.startsWith("hour")) {
      tatInMs = value * 60 * 60 * 1000; // hours to ms
    } else if (unit?.startsWith("minute")) {
      tatInMs = value * 60 * 1000; // minutes to ms
    } else {
      return "Invalid TAT format";
    }

    const elapsed = now - new Date(createdAt).getTime();
    const percentElapsed = (elapsed / tatInMs) * 100;

    if (percentElapsed >= 100) return "red";
    if (percentElapsed >= 90) return "orange";
    if (percentElapsed >= 50) return "#aec81d";
    return "green";

  }

  const handleEditBranch = (branchId) => {
    const branchToEdit = branches.find(branch => branch._id === branchId);
    setSelectedBranch(branchToEdit);
    setShowBranchForm(true);
  };

  const confirmDeleteBranch = (branchId) => {
    const branchToDelete = branches.find(branch => branch._id === branchId);
    setItemToDelete(branchToDelete);
    setDeleteType('branch');
    setIsDeleteModalOpen(true);
  };

  const handleEditAdmin = (adminId) => {
    const adminToEdit = allUsers.find(admin => admin._id === adminId);
    setSelectedUser(adminToEdit);
    setShowUserForm(true);
  };

  //filters
  // Filter branches based on search term
  const filteredBranches = branches.filter(branch =>
    branch.name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    branch.location?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  // Filter admins based on search term
  const filteredAdmins = allUsers?.filter(admin =>
    admin.username?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  // Filter tickets based on search term and status
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket?.branch?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      ticket?.subject?.toLowerCase().includes(searchTerm?.toLowerCase())

    const matchesStatus = filterStatus === 'all' || ticket?.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  //not worked
  const handleDeleteAdmin = () => {
    const updatedAdmins = admins.filter(admin => admin.id !== itemToDelete.id);
    // setAdmins(updatedAdmins);
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    alert('Admin deleted successfully!');
  };

  const handleUpdateTicketStatus = async (ticketId, status) => {
    try {
      setLoading({
        status: true,
        id: ticketId
      });
      const res = await axios.post(`${URI}/executive/updateticketstatus`, { ticketId, status }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(res => {
        fetchAllTickets();
        toast.success(res?.data?.message);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true))
          } else {
            toast.error(err.response.data.message || "Something went wrong");
          }
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log('error while ticket updation', error);
    }
    finally {
      setLoading({
        status: false,
        id: ticketId
      });
    }
  };

  //action APIs
  //add comment on ticket
  const addCommentOnTicket = async () => {
    try {
      const ticketId = selectedTicket?._id;
      const commenter = `${user?.username}(${user?.department && user?.department ? ' - ' : ''}  ${user?.designation})`;
      if (comment) {
        const res = await axios.post(`${URI}/executive/addcommentonticket`, { ticketId, comment, commenter }, {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }).then(res => {
          fetchAllTickets();
          handleCloseModal();
          setComment('');
          toast.success(res?.data?.message);
        }).catch(err => {
          // Handle error and show toast
          if (err.response && err.response.data) {
            if (err.response.data.notAuthorized) {
              dispatch(setSessionWarning(true))
            } else {
              toast.error(err.response.data.message || "Something went wrong");
            }
          } else {
            toast.error("Something went wrong");
          }
        });
      }
      else {
        toast.error('Please fill the Comment Box!');
      }
    } catch (error) {
      console.log('error while adding comment', error);
    }
  }

  const handleDeleteBranch = async () => {
    try {
      const res = await axios.delete(`${URI}/superadmin/deletebranch/${itemToDelete?._id}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(res => {
        fetchBranches();
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        toast.success(res?.data?.message);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true))
          } else {
            toast.error(err.response.data.message || "Something went wrong");
          }
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log("while delete user", error);
    }
  };

  const confirmDeleteAdmin = async (adminId) => {
    try {
      const res = await axios.delete(`${URI}/superadmin/deleteadmin/${adminId}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(res => {
        fetchAllUsers();
        toast.success(res?.data?.message);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true))
          } else {
            toast.error(err.response.data.message || "Something went wrong");
          }
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log("while delete user", error);
    }
  };

  const deleteTicket = async (id) => {
    try {
      const res = await axios.delete(`${URI}/superadmin/deleteticket/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(res => {
        fetchAllTickets();
        toast.success(res?.data?.message);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true))
          } else {
            toast.error(err.response.data.message || "Something went wrong");
          }
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log('while delete ticket', error);
    }
  }

  useEffect(() => {
    if (view === 'overview') {
      setShowBranchForm(false);
      setShowUserForm(false);
    }
    else if (view === 'branches') {
      setShowUserForm(false);
    }
    else if (view === 'admins') {
      setShowBranchForm(false);
    }
    else if (view === 'tickets') {
      setShowBranchForm(false);
      setShowUserForm(false);
    }
    else {
      setShowBranchForm(false);
      setShowUserForm(false);
    }
  }, [view])

  //components for render
  // Render different content based on the view
  const renderContent = () => {
    switch (view) {
      case 'overview':
        return renderOverviewView();
      case 'branches':
        return renderBranchesView();
      case 'admins':
        return renderAdminsView();
      // case 'password-requests':
      //   return renderPasswordRequestsView();
      case 'tickets':
        return renderTicketsView();
      default:
        return renderOverviewView();
    }
  };

  const renderOverviewView = () => (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Super Admin Dashboard</h2>
        <p className="text-muted">Complete overview of the ticketing system</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card-1" onClick={() => navigate('/dashboard/branches')}>
          <div className="stat-card-header">
            <h3 className="stat-card-title">Branches</h3>
            <div className="stat-card-icon blue">
              <FontAwesomeIcon icon={faBuilding} />
              {/* <FaBuilding /> */}
            </div>
          </div>
          <div className="stat-card-value">{stats?.totalBranches}</div>
        </div>

        <div className="stat-card-2" onClick={() => navigate('/dashboard/admins')}>
          <div className="stat-card-header">
            <h3 className="stat-card-title-1">Total Users</h3>
            <div className="stat-card-icon blue">
              <FontAwesomeIcon icon={faUser} />
              {/* <FaUsers /> */}
            </div>
          </div>
          <div className="stat-card-value">{stats?.totalUsers}</div>
        </div>

        <div className="stat-card-3" onClick={() => navigate('/dashboard/tickets')}>
          <div className="stat-card-header">
            <h3 className="stat-card-title-1">Total Tickets</h3>
            <div className="stat-card-icon orange">
              <FontAwesomeIcon icon={faTicketAlt} />
              {/* <FaTicketAlt /> */}
            </div>
          </div>
          <div className="stat-card-value">{stats?.totalTickets}</div>
        </div>
      </div>

      <div className="grid grid-2 gap-4 mt-4">
        {/* <div className="card">
          <h2 className="status-title">Support Ticket Status</h2>

          <div className="status-row">
            <div className="status-info">
              <span className="status-dot yellow"></span>
              <div>
                <p className="status-label">Open Tickets</p>
                <p className="ticket-count">0 tickets</p>
              </div>
            </div>
            <p className="status-percentage">0%</p>
          </div>

          <div className="status-row">
            <div className="status-info">
              <span className="status-dot blue"></span>
              <div>
                <p className="status-label">In Progress</p>
                <p className="ticket-count">0 tickets</p>
              </div>
            </div>
            <p className="status-percentage">0%</p>
          </div>

          <div className="status-row">
            <div className="status-info">
              <span className="status-dot green"></span>
              <div>
                <p className="status-label">Resolved</p>
                <p className="ticket-count">0 tickets</p>
              </div>
            </div>
            <p className="status-percentage">0%</p>
          </div>
        </div> */}

        <TicketStatusChart ticket={tickets} />
        <OpenTicketCategorization openTickets={tickets?.filter(t => t?.status === 'open')} />

        <div className="card" onClick={() => navigate('/dashboard/branches')}>
          <div className="card-header">
            <h3>Branch Summary</h3>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Location</th>
                    <th>Admin</th>
                    {/* <th>Departments</th>
                  <th>Tickets</th> */}
                  </tr>
                </thead>
                <tbody>
                  {branches?.slice(0, 3).map(branch => {
                    const branchAdmin = allUsers?.find(a => a?.username === branch?.admin);
                    const branchDepartments = mockDepartments.filter(d => d.branchId === branch.id);
                    const branchTickets = tickets.filter(t =>
                      branchDepartments.some(d => d.name === t.department)
                    );

                    return (
                      <tr key={branch.id}>
                        <td className="font-medium">{branch.name}</td>
                        <td>{branch.location}</td>
                        <td>
                          {branchAdmin ? (
                            <div className="flex items-center gap-2" style={{ display: 'flex', justifyContent: 'center' }}>
                              <img className="user-avatar" src={branchAdmin?.profile ? branchAdmin?.profile : '/img/admin.png'} alt="" />
                              <span>{branchAdmin.name}</span>
                            </div>
                          ) : <span className="text-muted">Not assigned</span>}
                        </td>
                        {/* <td>{branch?.departments ? branch?.departments : 0}</td>
                      <td>{branch?.tickets ? branch?.tickets : 0}</td> */}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* <div className="card mt-4">
        <div className="card-header">
          <h3>Branch Summary</h3>
        </div>
        
      </div> */}
    </>
  );

  const renderBranchesView = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Branches</h2>
          <p className="text-muted">Manage organization branches</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowBranchForm(true)}
        >
          Add New Branch
        </button>
      </div>

      {showBranchForm ? (
        <div className="card mb-4 animate-slide-up">
          <div className="card-header">
            <h3>{selectedBranch ? 'Edit Branch' : 'Create New Branch'}</h3>
          </div>
          <div className="card-body">
            <BranchForm
              initialData={selectedBranch}
              admins={admins}
              fetchBranches={fetchBranches}
              // onSubmit={selectedBranch ? handleUpdateBranch : handleCreateBranch}
              onCancel={() => {
                setSelectedBranch(null);
                setShowBranchForm(false);
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="card mb-4">
            <div className="card-body">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search branches by name or location"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-0">
              {filteredBranches.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Admin</th>
                        <th>Departments</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBranches.map(branch => {
                        const branchAdmin = allUsers?.find(a => a?.username === branch?.admin);
                        const branchDepartments = departments.filter(d => d?.branch === branch?.name);

                        return (
                          <tr key={branch._id}>
                            <td className="font-medium">{branch?.name}</td>
                            <td>{branch.location}</td>
                            <td>
                              {branchAdmin ? (
                                <div className="flex items-center gap-2" style={{ paddingLeft: '10%' }}>
                                  <img className="user-avatar" src={branchAdmin?.profile ? branchAdmin?.profile : '/img/admin.png'} alt="PF" />
                                  <span>{branchAdmin.name}</span>
                                </div>
                              ) : <span className="text-muted">Not assigned</span>}
                            </td>
                            <td>{branchDepartments?.length}</td>
                            <td>{formatDate(branch?.createdAt)}</td>
                            <td>
                              <div className="flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline"
                                  onClick={() => handleEditBranch(branch._id)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-error"
                                  onClick={() => confirmDeleteBranch(branch._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-muted">No branches found. Add a new branch to get started!</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderAdminsView = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Admins</h2>
          <p className="text-muted">Manage organization admins</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowUserForm(true)}
        >
          Add New Admin
        </button>
      </div>

      {showUserForm ? (
        <div className="card mb-4 animate-slide-up">
          <div className="card-header">
            <h3>{selectedUser ? 'Edit Admin' : 'Create New Admin'}</h3>
          </div>
          <div className="card-body">
            <UserForm
              initialData={selectedUser}
              admins={admins}
              fetchAllUsers={fetchAllUsers}
              designation='admin'
              // onSubmit={selectedUser ? handleUpdateAdmin : handleCreateAdmin}
              onCancel={() => {
                setSelectedUser(null);
                setShowUserForm(false);
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="card mb-4">
            <div className="card-body">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search admins by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-0">
              {filteredAdmins.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        {/* <th>Branch</th> */}
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdmins?.map(admin => {
                        return (
                          <>
                            {
                              admin?.designation === 'admin' &&
                              <tr key={admin.id}>
                                <td>
                                  <div className="flex items-center gap-2">
                                    <img src={admin?.profile ? admin?.profile : '/img/admin.png'} className="user-avatar" alt="PF" />
                                    <span>{admin?.name}</span>
                                  </div>
                                </td>
                                <td>{admin.email}</td>
                                {/* <td>{admin?.branches}</td> */}
                                {/* <td>{adminBranch ? adminBranch.name : 'Not assigned'}</td> */}
                                <td>{formatDate(admin.createdAt)}</td>
                                <td>
                                  <div className="flex gap-2" style={{ justifyContent: 'center' }}>
                                    <button
                                      className="btn btn-sm btn-outline"
                                      onClick={() => handleEditAdmin(admin._id)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="btn btn-sm btn-error"
                                      onClick={() => confirmDeleteAdmin(admin._id)}
                                    >
                                      Delete
                                    </button>
                                    {/* <button
                                      className="btn btn-sm btn-error"
                                    >
                                      View
                                    </button> */}
                                  </div>
                                </td>
                              </tr>
                            }
                          </>

                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-muted">No admins found. Add a new admin to get started!</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
  const statusColor = {
    open: '#faad14',
    'in-progress': '#1890ff',
    resolved: '#52c41a',
  };

  const statusBG = {
    open: '#fff7e6',
    'in-progress': '#e6f7ff',
    resolved: '#f6ffed',
  };

  const priorityColor = {
    high: '#dc3545',
    medium: '#ffc107',
    low: '#007bff',
  };

  const priorityBG = {
    high: '#f8d7da',
    medium: '#fff3cd',
    low: '#cce5ff',
  };
  const renderTicketsView = () => (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-bold">All System Tickets</h2>
        <p className="text-muted">View and manage tickets across all branches</p>
      </div>

      <ReportBar
        reportData={tickets}
        fetchData={async () => {
          await fetchBranches();
          await fetchAllTickets();
          await fetchAllUsers();
          await fetchDepartment();
          // await fetchEditProfileRequest();
          await fetchTicketSettings();
          // await getAllRequests();

        }}
        setSearchTerm={() => {
          setSearchTerm('');
          setFilterStatus('all');
        }}
      />

      <div className="card mb-4">
        <div className="card-body">
          <div className="grid grid-2 gap-3">
            <div className="form-group">
              <label htmlFor="status-filter" className="form-label">Filter by Status</label>
              <select
                id="status-filter"
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="search" className="form-label">Search Tickets</label>
              <input
                type="text"
                id="search"
                className="form-control"
                placeholder="Search by title, description or department"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          {filteredTickets?.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>S.No.</th>
                    <th>Ticket ID</th>
                    <th>Title</th>
                    <th>Branch</th>
                    {/* <th>Created On</th> */}
                    {/* <th>Assigned To</th> */}
                    <th>Status</th>
                    <th>Priority</th>
                    <th>T.A.T.</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets?.map((ticket, index) => (
                    <tr key={ticket?._id}>
                      <td style={{ textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ textAlign: 'center' }}>{ticket?.ticketId}</td>
                      <td style={{ textAlign: 'center' }}>{ticket?.subject}</td>
                      <td style={{ textAlign: 'center' }}>{ticket?.branch}</td>
                      {/* <td style={{ textAlign: 'center' }}>{formatDate(ticket?.createdAt)}</td> */}
                      {/* <td style={{ textAlign: 'center' }}>{ticket?.assignedTo}</td> */}
                      <td>
                        <span className={`badge ${ticket?.status === 'open' ? 'badge-warning' :
                          ticket?.status === 'in-progress' ? 'badge-primary' :
                            'badge-success'
                          }`}>
                          {ticket?.status === 'in-progress' ? 'In Progress' :
                            ticket?.status?.charAt(0).toUpperCase() + ticket?.status?.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${ticket.priority === 'high' ? 'badge-error' :
                          ticket.priority === 'medium' ? 'badge-warning' :
                            'badge-primary'
                          }`}
                          style={{
                            background: ticketSettings?.priorities?.find(p => p?.name === ticket?.priority)?.color,
                            color: parseInt(ticketSettings?.priorities?.find(p => p?.name === ticket?.priority)?.color?.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff',
                          }}
                        >
                          {ticket.priority?.charAt(0).toUpperCase() + ticket.priority?.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${ticket?.status === 'open' ? 'badge-warning' :
                          ticket?.status === 'in-progress' ? 'badge-primary' :
                            'badge-success'
                          }`} style={{ background: ticket?.tat && tatBG(ticket?.tat, ticket?.createdAt) }}>
                          {ticket?.tat && formatTat(ticket?.tat, ticket?.createdAt)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="flex gap-2" style={{ justifyContent: 'center' }}>
                          {ticket?.status === 'open' && (
                            <button className="btn btn-sm btn-primary" onClick={() => handleUpdateTicketStatus(ticket?._id, 'in-progress')} >Start</button>
                          )}
                          {ticket?.status === 'in-progress' && (
                            <button className="btn btn-sm btn-success" onClick={() => handleUpdateTicketStatus(ticket?._id, 'resolved')}>Resolve</button>
                          )}
                          <button className="btn btn-sm btn-outline" onClick={() => handleViewTicket(ticket)}>View</button>
                          <button className="btn btn-sm btn-error" onClick={() => deleteTicket(ticket?._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                  }


                </tbody>
              </table>
            </div>




          ) : (
            <div className="p-4 text-center">
              <p className="text-muted">No tickets found with the current filters.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="animate-fade">
      {sessionWarning && <SessionEndWarning />}

      {renderContent()}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title">Confirm Delete</h3>
                  <button
                    className="modal-close"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete {
                      deleteType === 'branch' ? itemToDelete.name : itemToDelete.name
                    }?
                  </p>
                  <p className="text-error mt-2">This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-outline"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-error"
                    onClick={deleteType === 'branch' ? handleDeleteBranch : handleDeleteAdmin}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {isModalOpen && selectedTicket && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <TicketCard selectedTicket={selectedTicket}
            user={user}
            formatDate={formatDate}
            formatTime={formatTime}
            formatTat={formatTat}
            tatBG={tatBG}
            ticketSettings={ticketSettings}
            // department={department}
            allUsers={allUsers}
            myDept={myDept}
            addCommentOnTicket={addCommentOnTicket}
            // handlePriorityUpdate={handlePriorityUpdate}
            // reAssignTicket={reAssignTicket}

            // showPriorityUpdate={showPriorityUpdate}
            // setShowPriorityUpdate={setShowPriorityUpdate}
            // newPriority={newPriority}
            // setNewPriority={setNewPriority}
            isCommentOpen={isCommentOpen}
            setIsCommentOpen={setIsCommentOpen}
            // reAssignDiv={reAssignDiv}
            // setReAssignDiv={setReAssignDiv}
            // reAssignto={reAssignto}
            // setReAssignto={setReAssignto}
            comment={comment}
            setComment={setComment}
          />

          {/* <div className="modal">
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">

                Header
                <div className="modal-header">
                  <h3 className="modal-title">Ticket #{selectedTicket?.ticketId}</h3>
                  <button className="modal-close" onClick={handleCloseModal}>×</button>
                </div>

                <div className="modal-body space-y-6">

                  Section 1: Ticket Info
                  <section className="space-y-2 border-b pb-4">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <span style={{ float: 'left', display: 'flex', gap: '5px' }}>issuedby: <span style={{ fontWeight: 'bold' }} >{selectedTicket?.issuedby === user?.username ? 'You' : selectedTicket?.issuedby}</span > </span>
                      <h4 style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }} className="text-lg font-bold">{selectedTicket?.category} -  <h5> {selectedTicket?.subject}</h5> </h4>
                    </div>
                    <div className="flex gap-3 flex-wrap" style={{ justifyContent: 'space-between' }}>
                      <div className="flex gap-3 flex-wrap">
                        <span className={`badge ${selectedTicket?.status === 'open' ? 'badge-warning' :
                          selectedTicket?.status === 'in-progress' ? 'badge-primary' : 'badge-success'}`}>
                          {selectedTicket?.status === 'in-progress' ? 'In Progress' :
                            selectedTicket?.status?.charAt(0).toUpperCase() + selectedTicket?.status?.slice(1)}
                        </span>
                        <span className={`badge ${selectedTicket?.priority === 'high' ? 'badge-error' :
                          selectedTicket?.priority === 'medium' ? 'badge-warning' : 'badge-primary'}`}>
                          {selectedTicket?.priority?.charAt(0).toUpperCase() + selectedTicket?.priority?.slice(1)}
                        </span>
                        <span className={`badge ${selectedTicket?.priority === 'high' ? 'badge-error' :
                          selectedTicket?.priority === 'medium' ? 'badge-warning' : 'badge-primary'}`} style={{ background: selectedTicket?.tat && tatBG(selectedTicket?.tat, selectedTicket?.createdAt) }}>
                          {selectedTicket?.tat && formatTat(selectedTicket?.tat, selectedTicket?.createdAt)}
                        </span>
                      </div>
                      <span className="text-sm text-muted">
                        {formatDate(selectedTicket?.createdAt)} , {formatTime(selectedTicket?.createdAt)}
                      </span>
                    </div>
                  </section> <br />
                  <hr />
                  Section 2: User Info
                  <section className="space-y-2 border-b pb-4">
                    <h5 className="font-semibold">User Information</h5>
                    <div className="flex gap-4 flex-wrap text-sm" style={{ justifyContent: 'center' }}>
                      <span><strong>Name:</strong> {selectedTicket?.name}</span>
                      <span><strong>Mobile:</strong> {selectedTicket?.mobile}</span>
                      
                    </div>
                  </section><br />
                  <hr />

                  Section 3: Department Info
                  <section className="space-y-4 border-b pb-4">
                    <h5 className="font-semibold">Departments</h5>
                    {selectedTicket?.department?.map((curElem, index) => (
                      <>
                        <div key={index} style={{ display: 'flex', gap: '5px' }}>
                          <span className="font-bold">{curElem?.name}{curElem?.description && ':'}</span>
                          {
                            curElem?.users && curElem?.users?.length > 0 ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
                              {curElem?.users?.map(curElem => (
                                <span>{curElem}</span>
                              ))}
                            </div> :
                              <span>No Specific Member Involved.</span>
                          }
                        </div>
                        <p className="text-sm" style={{ wordBreak: 'break-word' }} >{curElem?.description}</p>
                      </>
                    ))}
                  </section>
                  <hr />
                  Section 4: Comments
                  {
                    selectedTicket?.comments?.length > 0 &&
                    <button
                      className="notification-btn"
                      aria-label="Notifications"
                      style={{ float: 'right' }} onClick={() => setIsCommentOpen(!isCommentOpen)}
                    >
                      <FontAwesomeIcon icon={faCommentDots} />
                      {selectedTicket?.comments?.length > 0 && (
                        <span className="notification-badge">{selectedTicket?.comments?.length}</span>
                      )}
                    </button>
                  }

                  {
                    isCommentOpen &&
                    <>
                      <section className="space-y-3 border-b pb-4">
                        <h5 className="font-semibold">Comments ({selectedTicket?.comments?.length})</h5>
                        {selectedTicket?.comments?.length > 0 ? (
                          <div className="space-y-2">
                            {selectedTicket?.comments?.map((comment) => (
                              <div key={comment?.id} className="p-2 bg-gray-100 rounded">
                                <p className="text-sm" style={{ wordBreak: 'break-word' }} >{comment?.content}</p>
                                <p className="text-xs text-muted">{comment?.commenter} - {formatDate(comment?.createdAt)}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted">No comments yet.</p>
                        )}
                      </section> <hr />
                    </>
                  }

                  

                  Section 6: Add Comment

                  <section className="space-y-2">
                    <label htmlFor="comment" className="form-label font-semibold">Add Comment</label>
                    <textarea
                      id="comment"
                      className="form-control"
                      rows="3"
                      placeholder="Add your comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                  </section>

                </div>

                Footer
                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={handleCloseModal}>Close</button>
                  <button className="btn btn-primary" onClick={addCommentOnTicket}>Add Comment</button>
                </div>

              </div>
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
}

export default SuperAdminPanel;