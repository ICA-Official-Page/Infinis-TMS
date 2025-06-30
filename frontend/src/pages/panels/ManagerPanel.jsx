import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import mockUsers from '../../data/mockUsers';
import mockTickets from '../../data/mockTickets';
import mockPasswordRequests from '../../data/mockPasswordRequests';
import mockDepartments from '../../data/mockDepartments';
import mockBranches from '../../data/mockBranches';
import { } from '@fortawesome/free-brands-svg-icons'
import { faBell, faBuilding, faChartBar, faCommentDots, faEdit, faEye, faMoon, faUser } from '@fortawesome/free-regular-svg-icons'
import { faBars, faChartLine, faGear, faLock, faSignOut, faTicketAlt, faTimes, faTrash, faUserCog, faUsers, faUsersCog } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UserForm from '../../components/UserForm';
import TicketForm from '../../components/TicketForm';
import axios from 'axios';
import URI from '../../utills';
import toast from 'react-hot-toast';
import SessionEndWarning from '../../components/SessionEndWarning';
import { useDispatch, useSelector } from 'react-redux';
import { setNotificationCount, setSessionWarning } from '../../Redux/userSlice';
import TicketStatusChart from '../../components/TicketStatusChart';
import OpenTicketCategorization from '../../components/OpenTicketCategorization';
import ReportBar from '../../components/ReportBar';
import TicketCard from '../../components/TicketCard';

function ManagerPanel({ user, view = 'branch' }) {
  const [branch, setBranch] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [passwordRequests, setPasswordRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userRequest, setUserRequest] = useState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [department, setDepartment] = useState(null);
  const [comment, setComment] = useState('');
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [loading, setLoading] = useState();

  const { sessionWarning } = useSelector(store => store.user);
  const location = useLocation();
  const navigate = useNavigate();

  const [reAssignDiv, setReAssignDiv] = useState(false);
  const [showPriorityUpdate, setShowPriorityUpdate] = useState(false);
  const [newPriority, setNewPriority] = useState('');
  const [reAssignto, setReAssignto] = useState({
    name: '',
    description: '',
    users: []
  });
  const [loadingP, setLoadingP] = useState(false);
  const [loadingR, setLoadingR] = useState(false);

  const handlePriorityUpdate = async () => {

    try {
      setLoadingP(true);
      const data = `Priority changed from ${selectedTicket?.priority} to ${newPriority}`;
      addCommentOnTicket(data, '');
      const tat = ticketSettings?.priorities?.find(p => p.name === newPriority).tat;
      const res = await axios.post(`${URI}/executive/updatepriority`, { id: selectedTicket?._id, priority: newPriority, tat }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(r => {
        fetchAllTickets();
        toast.success(r?.data?.message);
        setShowPriorityUpdate(false);
        setIsModalOpen(false);
        setNewPriority('');

      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data && err.response.data.message) {
          toast.error(err.response.data.message); // For 400, 401, etc.
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log('while updating priority', error);
    }
    finally {
      setLoadingP(false);
    }
  }

  //fetching APIs
  //fetch team leaders
  const fetchAllTeamLeaders = async () => {
    try {
      const res = await axios.get(`${URI}/admin/teamleaders`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        setTeamLeaders(res?.data?.allBranchesData?.filter((tl) => tl?.branch === user?.branch));
      }).catch(err => {
        // Handle error and show toast
        if (err?.response && err?.response?.data && err?.response?.data?.message) {
          toast.error(err?.response?.data?.message); // For 400, 401, etc.
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
      const branch = user?.branch;
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

  //fetch users
  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${URI}/admin/executives`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        setExecutives(res?.data?.allBranchesData?.filter((tl) => tl?.branch === user?.branch));
      }).catch(err => {
        // Handle error and show toast
        if (err?.response && err?.response?.data && err?.response?.data?.message) {
          toast.error(err?.response?.data?.message); // For 400, 401, etc.
        } else {
          toast.error("Something went wrong");
        }
      });

    } catch (error) {
      console.log("while fetching all Users data", error);
    }
  }

  const fetchAllTickets = async () => {
    try {
      const res = await axios.get(`${URI}/executive/getalltickets`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(res => {
        setTickets(res?.data?.data?.filter((tickt) => tickt?.branch === user?.branch));
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

  //fetch department
  const fetchDepartment = async () => {
    try {
      const res = await axios.get(`${URI}/admin/department`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(res => {
        setDepartments(res?.data?.departmentes?.filter((dept) => dept?.branch === user?.branch));
      }).catch(err => {
        // Handle error and show toast
        if (err?.response && err?.response?.data && err?.response?.data?.message) {
          toast.error(err?.response?.data?.message); // For 400, 401, etc.
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log('while geting branches for super admin', error);
    }
  }

  // fetch password requests
  const getAllRequests = async () => {
    try {
      const res = await axios.get(`${URI}/superadmin/getalladminrequests`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        setPasswordRequests(res?.data?.allRequests?.filter((req) => req?.branch === user?.branch));
      }).catch(err => {
        // Handle error and show toast
        if (err?.response && err?.response?.data && err?.response?.data.message) {
          toast.error(err?.response?.data.message); // For 400, 401, etc.
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log("while geting all admin requests", error);
    }
  }

  const fetchEditProfileRequest = async () => {
    try {
      const res = await axios.get(`${URI}/auth/getupdateprofilerequests`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(r => {
        setUserRequest(r?.data?.requests?.filter((req) => user?.branch === req.branch && (req?.designation === 'Team Leader' || req?.designation === 'Executive')));
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data && err.response.data.message) {
          toast.error(err.response.data.message); // For 400, 401, etc.
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log('while fetching edit profile request', error);
    }
  }

  useEffect(() => {
    fetchAllTeamLeaders();
    fetchAllUsers();
    fetchAllTickets();
    fetchDepartment();
    getAllRequests();
    fetchEditProfileRequest();
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', {
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
    console.log(tat, createdAt);
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
      return "TAT Over";
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

  // Statistics for branch overview
  const getBranchStats = () => {
    return {
      totalDepartments: departments?.length,
      totalTeamLeaders: teamLeaders?.length,
      totalExecutives: executives?.length,
      totalTickets: tickets?.length,
      openTickets: tickets.filter(t => t.status === 'open')?.length,
      resolvedTickets: tickets.filter(t => t.status === 'resolved')?.length,
      // pendingRequests: passwordRequests.filter(r => r.status === 'pending')?.length
      pendingRequests: userRequest?.length
    };
  };

  const handleDeleteUser = () => {
    if (userRole === 'teamleader') {
      setTeamLeaders(teamLeaders.filter(tl => tl.id !== userToDelete.id));
    } else {
      setExecutives(executives.filter(exec => exec.id !== userToDelete.id));
    }

    setIsDeleteModalOpen(false);
    setUserToDelete(null);
    setUserRole('');
    alert('User deleted successfully!');
  };

  // delete password update request
  const deleteUpdateRequest = async (id) => {
    try {
      const res = await axios.delete(`${URI}/admin/deleteupdaterequest/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(res => {
        getAllRequests();
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
      console.log("while delete update request");
    }
  }

  const handleCancelForm = () => {
    setSelectedUser(null);
    setShowUserForm(false);
  };

  const handleCreateTicket = (ticketData) => {
    const newTicket = {
      id: tickets.length + 1,
      title: ticketData.title,
      description: ticketData.description,
      status: 'open',
      priority: ticketData.priority,
      department: ticketData.department,
      createdBy: user.id,
      assignedTo: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    };

    setTickets([newTicket, ...tickets]);
    setShowTicketForm(false);
    alert('Ticket created successfully!');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
    setIsCommentOpen(false);
    setReAssignDiv(false);
    setShowPriorityUpdate(false);
  };

  //add comment on ticket
  const addCommentOnTicket = async (data, ticketIdd) => {

    try {
      const ticketId = ticketIdd || selectedTicket?._id;
      const commentData = data || comment;
      const commenter = `${user?.username}(${user?.department ? user?.department + ' - ' : ''}  ${user?.designation})`;
      if (commentData) {
        // console.log('comment', commentData)
        const res = await axios.post(`${URI}/executive/addcommentonticket`, { ticketId, comment: commentData, commenter }, {
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
        toast.error('Plese fill the Comment Box!');
      }
    } catch (error) {
      console.log('error while adding comment', error);
    }
  }

  const [myDept, setMyDept] = useState({});

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setMyDept(ticket?.department?.find((dept) => dept?.name === user?.department || ticket?.issuedby === user?.username));
    setIsModalOpen(true);
  };

  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      setReAssignto({
        ...reAssignto,
        users: [...(reAssignto?.users || []), value]
      });
    } else {
      setReAssignto({
        ...reAssignto,
        users: (reAssignto.users || []).filter(us => us !== value)
      });
    }
  };

  const reAssignTicket = async () => {
    setLoadingR(true);
    const data = `ReAssign the Ticket to ${reAssignto?.users > 0 ? reAssignto?.users + '-' : ''} ${reAssignto?.name}`;
    try {
      if (reAssignto.name !== '') {
        addCommentOnTicket(data, '');
        const res = await axios.post(`${URI}/executive/ticketreassign`, { ticketId: selectedTicket?._id, presentDept: selectedTicket?.department, reAssignto: reAssignto }, { withCredentials: true })
          .then(res => {
            handleUpdateTicketStatus(selectedTicket?._id, 'open');
            fetchAllTickets();
            handleCloseModal();
            toast.success(res?.data?.message);
            setReAssignto({
              name: '',
              description: '',
              users: []
            })
          }).catch(err => {
            // Handle error and show toast
            if (err.response && err.response.data && err.response.data.message) {
              toast.error(err.response.data.message); // For 400, 401, etc.
            } else {
              toast.error("Something went wrong");
            }
          });

      }
      else {
        toast.error('Please Selcet a Department!')
      }
    } catch (error) {
      console.log("while Re-Assigning the Ticket", error);
      toast.error('Error While Re-Assigning the Ticket', error);
    }
    finally {
      setLoadingR(false);
    }
  }

  //update ticket status
  const handleUpdateTicketStatus = async (ticketId, status) => {

    const data = `Ticket Status is ${status} Now`;

    addCommentOnTicket(data, ticketId);
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
  }

  const dispatch = useDispatch();
  // const [notificationCount, setNotificationCount]

  const resolveNotification = async (text) => {
    try {
      const payload = {
        user: user?._id,
        section: 'department'
      }

      const res = await axios.post(`${URI}/notification/resolvenotification`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        const obj = res?.data?.notificationObject;
        const updatedNotificaton =
          (obj?.department || 0) +
          (obj?.users || 0) +
          (obj?.tickets || 0) +
          (obj?.passreq || 0) +
          (obj?.userreq || 0) +
          (obj?.profile || 0);
        dispatch(setNotificationCount(updatedNotificaton));
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data && err.response.data.message) {
          toast.error(err.response.data.message); // For 400, 401, etc.
        } else {
          toast.error("Something went wrong");
        }
      });



    } catch (error) {
      console.log('While resolve notification', error);
    }
  }

  const handleApprovePasswordRequest = (requestId) => {
    const updatedRequests = passwordRequests.map(req =>
      req.id === requestId ?
        {
          ...req,
          status: 'approved',
          resolvedBy: user.id,
          resolvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } : req
    );

    setPasswordRequests(updatedRequests);
    alert('Password request approved!');
  };

  const handleRejectPasswordRequest = (requestId) => {
    const updatedRequests = passwordRequests.map(req =>
      req.id === requestId ?
        {
          ...req,
          status: 'rejected',
          resolvedBy: user.id,
          resolvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } : req
    );

    setPasswordRequests(updatedRequests);
    alert('Password request rejected!');
  };

  // Filter users based on search term
  const filteredTeamLeaders = teamLeaders?.filter(tl =>
    tl?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    tl?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    tl?.department?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    tl?.createdAt?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const filteredExecutives = executives?.filter(exec =>
    exec?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    exec?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    exec?.department?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    exec?.createdAt?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  // Filter tickets based on status and search term
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = ticket.subject?.toLowerCase().includes(searchTerm?.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filter password requests
  const filteredPasswordRequests = passwordRequests.filter(req => {
    // const user = mockUsers.find(u => u.id === req.userId);
    return (
      req?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      req?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      req?.department?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      req?.reason?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    );
  });

  const statusUpdateforUserRequest = async (requestId, status, email) => {
    try {
      setLoading({
        status: true,
        id: requestId
      });
      const res = await axios.post(`${URI}/auth/statusupdateforuserrequest`, { requestId, status }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(async r => {

        const notificationRes = await axios.post(`${URI}/notification/pushnotification`, { user: email, section: 'profile' },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        fetchEditProfileRequest();
        toast.success(r?.data?.message);
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
      console.log('while status update for user request');
    }
    finally {
      setLoading({
        status: false,
        id: requestId
      });
    }
  }

  useEffect(() => {
    if (view === 'branch') {
      setShowTicketForm(false);
      setShowUserForm(false);
    }
    else if (view === 'team') {
      setShowTicketForm(false);
      setShowUserForm(false);
    }
    else if (view === 'tickets') {
      // setShowTicketForm(false);
      setShowUserForm(false);
    }
    else if (view === 'password-requests') {
      setShowTicketForm(false);
    }
    else if (view === 'user-requests') {
      setShowTicketForm(false);
      setShowUserForm(false);
    }

    else {
      setShowTicketForm(false);
      setShowUserForm(false);
    }
  }, [view])

  const renderContent = () => {
    switch (view) {
      case 'branch':
        return renderBranchOverview();
      case 'team':
        return renderTeamView();
      case 'tickets':
        return renderTicketsView();
      case 'password-requests':
        return renderPasswordRequestsView();
      case 'user-requests':
        return renderUserRequestsView();
      default:
        return renderBranchOverview();
    }
  };

  const renderBranchOverview = () => {
    const stats = getBranchStats();
    resolveNotification();
    return (
      <>
        <div className="mb-4">
          <h2 className="text-xl font-bold">Branch Manager Dashboard</h2>
        </div>
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <h3 className="stat-card-title">Departments</h3>
              <div className="stat-card-icon blue">
                <FontAwesomeIcon icon={faUser} />
              </div>
            </div>
            <div className="stat-card-value">{stats?.totalDepartments}</div>
          </div>

          <div className="stat-card-1" onClick={() => navigate('/dashboard/executives')}>
            <div className="stat-card-header">
              <h3 className="stat-card-title">Team Size</h3>
              <div className="stat-card-icon green">
                <FontAwesomeIcon icon={faUser} />
              </div>
            </div>
            <div className="stat-card-value">
              {stats?.totalTeamLeaders + stats?.totalExecutives}
            </div>
            <div className="stat-card-change">
              {stats.totalTeamLeaders} Leaders, {stats.totalExecutives} Executives
            </div>
          </div>

          <div className="stat-card-2" onClick={() => navigate('/dashboard/tickets')}>
            <div className="stat-card-header">
              <h3 className="stat-card-title">Tickets</h3>
              <div className="stat-card-icon orange">
                <FontAwesomeIcon icon={faTicketAlt} />
              </div>
            </div>
            <div className="stat-card-value">{stats?.totalTickets}</div>
            <div className="stat-card-change">
              {stats?.openTickets} open, {stats?.resolvedTickets} resolved
            </div>
          </div>

          <div className="stat-card-3" onClick={() => navigate('/dashboard/user-requests')}>
            <div className="stat-card-header">
              <h3 className="stat-card-title">Pending Requests</h3>
              <div className="stat-card-icon red">
                <FontAwesomeIcon icon={faLock} />
              </div>
            </div>
            <div className="stat-card-value">{stats.pendingRequests}</div>
          </div>
        </div>

        <div className="grid grid-2 gap-4 mt-4">

          <TicketStatusChart ticket={tickets} />
          <OpenTicketCategorization openTickets={tickets?.filter(t => t?.status === 'open')} />


        </div> <br />
        <div className="card">
          <div className="card-header">
            <h3>Department Overview</h3>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Team Leader</th>
                    <th>Total Tickets</th>
                    <th>Open Tickets</th>
                    <th>Over Tat</th>
                  </tr>
                </thead>
                <tbody onClick={() => navigate('/dashboard/tickets')}>
                  {departments?.map(dept => {
                    // const deptTeamLeaders = teamLeaders?.filter(tl => tl?.department === dept?.name);
                    const overTat = tickets?.filter(ticket => ticket?.department?.find(d => d.name === dept.name) && ticket?.status !== 'resolved' && ticket?.tat && formatTat(ticket?.tat, ticket?.createdAt) === 'TAT Over');
                    const deptTotalTickets = tickets?.filter(t =>
                      t.department?.some(d => d.name === dept?.name)
                    );
                    const deptOpenTickets = tickets?.filter(t =>
                      t.department?.some(d => d.name === dept?.name) && t?.status === 'open'
                    );

                    return (
                      <tr key={dept?._id}>
                        <td>{dept?.name}</td>
                        <td>{dept?.teamleader ? dept?.teamleader : <span className='text-muted'>Not Assigned</span>}</td>
                        <td>{deptTotalTickets?.length}</td>
                        <td>{deptOpenTickets?.length}</td>
                        <td style={{ color: 'red', fontWeight: 'bold' }}>{overTat?.length}</td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderTeamView = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Branch Team</h2>
          <p className="text-muted">Manage team leaders and executives</p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => {
              setUserRole('Team Leader');
              setShowUserForm(true);
            }}
          >
            Add Team Leader
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setUserRole('Executive');
              setShowUserForm(true);
            }}
          >
            Add Executive
          </button>
        </div>
      </div>

      {showUserForm ? (
        <div className="card mb-4 animate-slide-up">
          <div className="card-header">
            <h3>
              {selectedUser
                ? `Edit ${userRole === 'Team Leader' ? 'Team Leader' : 'Executive'}`
                : `Create New ${userRole === 'Team Leader' ? 'Team Leader' : 'Executive'}`}
            </h3>
          </div>
          <div className="card-body">
            <UserForm
              initialData={selectedUser}
              fetchAllUsers={userRole === 'Executive' ? fetchAllUsers : fetchAllTeamLeaders}
              designation={userRole}
              onCancel={() => {
                setSelectedUser(null);
                setUserRole('');
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
                  placeholder="Search by name, email or department"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header">
              <h3>Team Leaders</h3>
            </div>
            <div className="card-body p-0">
              {filteredTeamLeaders?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeamLeaders.map(tl => (
                        <tr key={tl?.id}>
                          <td>
                            <div className="flex items-center gap-2">
                              <img className="user-avatar" src={tl?.profile ? tl?.profile : '/img/admin.png'} alt="PF" />
                              <span>{tl?.name}</span>
                            </div>
                          </td>
                          <td>{tl?.email}</td>
                          <td>{tl?.department ? tl?.department : 'Not Assigned'}</td>
                          <td>{formatDate(tl?.createdAt)}</td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() => {
                                  setSelectedUser(tl);
                                  setUserRole('Team Leader');
                                  setShowUserForm(true);
                                }}
                              >
                                Edit
                              </button>
                              {/* <button
                                className="btn btn-sm btn-error"
                                onClick={() => {
                                  setUserToDelete(tl);
                                  setUserRole('Team Leader');
                                  setIsDeleteModalOpen(true);
                                }}
                              >
                                Delete
                              </button> */}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-muted">No team leaders found.</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Executives</h3>
            </div>
            <div className="card-body p-0">
              {filteredExecutives.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExecutives.map(exec => (
                        <tr key={exec.id}>
                          <td>
                            <div className="flex items-center gap-2">
                              <img className="user-avatar" src={exec?.profile ? exec?.profile : '/img/admin.png'} alt="PF" />
                              <span>{exec.name}</span>
                            </div>
                          </td>
                          <td>{exec.email}</td>
                          <td>{exec?.department ? exec?.department : 'Not Assigned'}</td>
                          <td>{formatDate(exec.createdAt)}</td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() => {
                                  setSelectedUser(exec);
                                  setUserRole('Executive');
                                  setShowUserForm(true);
                                }}
                              >
                                Edit
                              </button>
                              {/* <button
                                className="btn btn-sm btn-error"
                                onClick={() => {
                                  setUserToDelete(exec);
                                  setUserRole('Executive');
                                  setIsDeleteModalOpen(true);
                                }}
                              >
                                Delete
                              </button> */}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-muted">No executives found.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
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
                  <p>Are you sure you want to delete {userToDelete.name}?</p>
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
                    onClick={handleDeleteUser}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Branch Tickets</h2>
          <p className="text-muted">Manage tickets across all departments</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowTicketForm(true)}
        >
          Create Ticket
        </button>
      </div>

      <ReportBar
        reportData={tickets}
        fetchData={async () => {
          await fetchAllTeamLeaders();
          await fetchAllTickets();
          await fetchAllUsers();
          await fetchDepartment();
          await fetchEditProfileRequest();
          await fetchTicketSettings();
          await getAllRequests();
        }}
        setSearchTerm={() => {
          setSearchTerm('');
          setFilterStatus('all');
        }}
      />

      {showTicketForm ? (
        <div className="card mb-4 animate-slide-up">
          <div className="card-header">
            <h3>Create New Ticket</h3>
          </div>
          <div className="card-body">
            <TicketForm
              onSubmit={handleCreateTicket}
              onCancel={() => setShowTicketForm(false)}
              fetchAllTickets={fetchAllTickets}
            />
          </div>
        </div>
      ) : (
        <>
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
                        <th>Ticket Id</th>
                        <th>Title</th>
                        {/* <th>Department</th> */}
                        <th>Status</th>
                        <th>Priority</th>
                        <th>T.A.T.</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets?.map((ticket, index) => {
                        return (
                          // tickets?.filter(ticket => ticket?.department?.find(d => d.name === dept.name) &&
                          ticket?.status !== 'resolved'
                          && ticket?.tat
                          && tatBG(ticket?.tat, ticket?.createdAt) === 'red' &&
                          // ticket?.status === 'in-progress' &&
                          <tr key={ticket?._id}>
                            <td style={{ textAlign: 'center' }}>{ticket?.ticketId}</td>
                            <td style={{ textAlign: 'center' }}>{ticket?.subject}</td>
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
                              <span
                                className={`badge ${ticket?.status === 'open' ? 'badge-warning' :
                                  ticket?.status === 'in-progress' ? 'badge-primary' :
                                    'badge-success'
                                  }`}
                                style={{ background: ticket?.tat && tatBG(ticket?.tat, ticket?.createdAt) }}>
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
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredTickets?.map((ticket, index) => {
                        return (
                          // ticket?.status === 'open' &&
                          ticket?.status !== 'resolved'
                          && ticket?.tat
                          && tatBG(ticket?.tat, ticket?.createdAt) !== 'red' &&
                          <tr key={ticket?._id}>
                            <td style={{ textAlign: 'center' }}>{ticket?.ticketId}</td>
                            <td style={{ textAlign: 'center' }}>{ticket?.subject}</td>
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
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredTickets?.map((ticket, index) => {
                        return (
                          ticket?.status === 'resolved' &&
                          <tr key={ticket?._id}>
                            <td style={{ textAlign: 'center' }}>{ticket?.ticketId}</td>
                            <td style={{ textAlign: 'center' }}>{ticket?.subject}</td>
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
                  <p className="text-muted">No tickets found with the current filters.</p>
                </div>
              )}
            </div>
          </div><br />
          <div className="card">
            <h2 className="text-xl font-bold">Raised By You</h2>
            <div className="card-body p-0">
              {filteredTickets?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Ticket Id</th>
                        <th>Name</th>
                        <th>Subject</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets?.map((ticket, index) => (
                        ticket?.issuedby === `${user?.username}${user?.department ? ` - ${user.department}` : ''} (${user?.designation})` &&
                        <tr key={ticket?.id}>
                          <td style={{ textAlign: 'center' }}>{ticket?.ticketId}</td>
                          <td>{ticket?.name}</td>
                          {/* <span className={`badge ${ticket?.status === 'open' ? 'badge-warning' :
                            ticket?.status === 'in-progress' ? 'badge-primary' :
                              'badge-success'
                            }`}>
                            {ticket?.status === 'in-progress' ? 'In Progress' :
                              ticket?.status?.charAt(0).toUpperCase() + ticket?.status?.slice(1)}
                          </span> */}

                          <td>
                            {ticket?.subject}
                            {/* <span className={`badge ${ticket?.priority === 'high' ? 'badge-error' :
                            ticket?.priority === 'medium' ? 'badge-warning' :
                              'badge-primary'
                            }`}>
                            {ticket?.priority?.charAt(0).toUpperCase() + ticket?.priority?.slice(1)}
                          </span> */}
                          </td>
                          {/* <td>{formatDate(ticket?.createdAt)}</td> */}
                          <td>
                            <div className="flex gap-2" style={{ justifyContent: 'center' }}>
                              {ticket?.status === 'resolved' && (
                                <button className="btn btn-sm btn-success" style={{ background: 'green' }} onClick={() => handleUpdateTicketStatus(ticket?._id, 'closed')}>Close</button>
                              )}
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() => handleViewTicket(ticket)}
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-muted">No tickets found. Create a new ticket to get started!</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderPasswordRequestsView = () => (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Password Update Requests</h2>
        <p className="text-muted">Manage password change requests from team leaders and executives</p>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search password requests"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        {showUserForm ? (
          <div className="card mb-4 animate-slide-up">
            <div className="card-header">
              <h3>{selectedUser ? 'Edit Executive' : 'Create New Executive'}</h3>
            </div>
            <div className="card-body">
              <UserForm
                initialData={selectedUser}
                fetchAllUsers={fetchAllUsers}
                // onSubmit={selectedUser ? handleUpdateUser : handleCreateUser} 
                onCancel={handleCancelForm}
                designation='Executive'
                passReq={true}
                deleteUpdateRequest={deleteUpdateRequest}
              />
            </div>
          </div>
        ) : (
          <div className="card-body p-0">
            {filteredPasswordRequests?.length > 0 ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPasswordRequests?.map((request, index) => {
                      // const requestUser = mockUsers.find(u => u.id === request.userId);
                      return (
                        <tr key={index + 1}>
                          <td>#{index + 1}</td>
                          <td>
                            {request ? (
                              <div className="flex items-center gap-2" >
                                <img className="user-avatar" src={request?.profile ? request?.profile : '/img/admin.png'} alt="" />
                                <span>{request.name}</span>
                              </div>
                            ) : 'Unknown User'}
                          </td>
                          <td>
                            {request ? request.designation?.charAt(0).toUpperCase() + request.designation?.slice(1) : ''}
                          </td>
                          <td>{request ? request.department : ''}</td>
                          {/* <td>
                          <span className={`badge ${request.status === 'pending' ? 'badge-warning' :
                            request.status === 'approved' ? 'badge-success' :
                              'badge-error'
                            }`}>
                            {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                          </span>
                        </td> */}
                          <td>{formatDate(request.createdAt)}</td>
                          <td>
                            {/* {request.status === 'pending' ? ( */}
                            <div className="flex gap-2" style={{ justifyContent: 'center' }}>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => {
                                  setSelectedUser(request);
                                  setUserRole('Team Leader');
                                  setShowUserForm(true);
                                }}
                              >

                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              {/* <button
                                className="btn btn-sm btn-error"
                                onClick={() => deleteUpdateRequest(request?._id)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button> */}
                            </div>
                            {/* ) : ( */}
                            {/* <button className="btn btn-sm btn-outline">View</button> */}
                            {/* )} */}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-muted">No password requests found.</p>
              </div>
            )}
          </div>
        )
        }
      </div>
    </>
  );

  const renderUserRequestsView = () => (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-bold">User Requests</h2>
        <p className="text-muted">Manage requests from team leaders and executives</p>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search password requests"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">

        <div className="card-body p-0">
          {userRequest?.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Req. to</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userRequest?.map((request, index) => {
                    return (
                      <>
                        {
                          request.status === 'pending' && request?.designation === 'Team Leader' &&
                          <tr key={request?.id} >

                            <td>

                              <div className="flex items-center gap-2" style={{ justifyContent: 'center' }}>
                                <img src={request?.profile ? request?.profile : '/img/admin.png'} className='user-avatar' alt="/img/admin.png" />
                                <span>{request?.username}</span>
                              </div>

                            </td>
                            <td>
                              {request?.designation}
                            </td>
                            <td> {
                              request?.designation === 'Manager' ? '----' : request?.department ? request?.department : 'N/A'
                            }
                            </td>
                            <td>{request?.reqto}</td>
                            <td style={{ display: 'flex', justifyContent: 'center' }}>
                              {/* {request?.status === 'pending' ? ( */}
                              <div className="flex gap-2">
                                {
                                  loading?.id === request?._id && loading?.status ? <button className={`btn btn-${request?.status === 'open' ? 'primary' : 'success'}`}>
                                    <img src="/img/loader.png" className='Loader' alt="loader" />
                                  </button>
                                    :
                                    <>
                                      {
                                        request?.status === 'pending' ?
                                          <>
                                            <button
                                              className="btn btn-sm btn-success"
                                              onClick={() => statusUpdateforUserRequest(request?._id, 'allow', request?.email)}
                                            >Accept
                                            </button>
                                            {/* <button
                                              className="btn btn-sm btn-error"
                                              onClick={() => deleteUpdateRequest(request?._id)}
                                            >
                                              Delete
                                            </button> */}
                                          </> :
                                          'Accepted'
                                        // <button
                                        //   className="btn btn-sm btn-error"
                                        // // onClick={() => deleteUpdateRequest(request?._id)}
                                        // >
                                        //   View
                                        // </button>
                                      }
                                    </>
                                }
                              </div>

                            </td>
                          </tr>
                        }

                      </>
                    );
                  })}
                  {userRequest?.map((request, index) => {
                    return (
                      <>
                        {
                          request.status === 'pending' && request?.designation === 'Executive' &&
                          <tr key={request?.id} >

                            <td>

                              <div className="flex items-center gap-2" style={{ justifyContent: 'center' }}>
                                <img src={request?.profile ? request?.profile : '/img/admin.png'} className='user-avatar' alt="/img/admin.png" />
                                <span>{request?.username}</span>
                              </div>

                            </td>
                            <td>
                              {request?.designation}
                            </td>
                            <td>{request?.department}</td>
                            <td>{request?.reqto}</td>
                            <td style={{ display: 'flex', justifyContent: 'center' }}>
                              {/* {request?.status === 'pending' ? ( */}
                              <div className="flex gap-2">
                                {
                                  loading?.id === request?._id && loading?.status ? <button className={`btn btn-${request?.status === 'open' ? 'primary' : 'success'}`}>
                                    <img src="/img/loader.png" className='Loader' alt="loader" />
                                  </button>
                                    :
                                    <>
                                      {
                                        request?.status === 'pending' ?
                                          <>
                                            <button
                                              className="btn btn-sm btn-success"
                                              onClick={() => statusUpdateforUserRequest(request?._id, 'allow', request?.email)}
                                            >Accept
                                            </button>
                                            {/* <button
                                              className="btn btn-sm btn-error"
                                              onClick={() => deleteUpdateRequest(request?._id)}
                                            >
                                              Delete
                                            </button> */}
                                          </> :
                                          'Accepted'
                                        // <button
                                        //   className="btn btn-sm btn-error"
                                        // // onClick={() => deleteUpdateRequest(request?._id)}
                                        // >
                                        //   View
                                        // </button>
                                      }
                                    </>
                                }
                              </div>

                            </td>
                          </tr>
                        }

                      </>
                    );
                  })}
                  {userRequest?.map((request, index) => {
                    return (
                      <>
                        {
                          request.status !== 'pending' &&
                          <tr key={request?.id} >

                            <td style={{ display: 'flex', justifyContent: 'center' }}>

                              <div className="flex items-center gap-2">
                                <img src={request?.profile ? request?.profile : '/img/admin.png'} className='user-avatar' alt="/img/admin.png" />
                                <span>{request?.username}</span>
                              </div>

                            </td>
                            <td>
                              {request?.designation}
                            </td>
                            <td>{request?.department}</td>
                            <td>{request?.reqto}</td>
                            <td style={{ display: 'flex', justifyContent: 'center' }}>
                              {/* {request?.status === 'pending' ? ( */}
                              <div className="flex gap-2">
                                {
                                  loading?.id === request?._id && loading?.status ? <button className={`btn btn-${request?.status === 'open' ? 'primary' : 'success'}`}>
                                    <img src="/img/loader.png" className='Loader' alt="loader" />
                                  </button>
                                    :
                                    <>
                                      {
                                        request?.status === 'pending' ?
                                          <>
                                            <button
                                              className="btn btn-sm btn-success"
                                              onClick={() => statusUpdateforUserRequest(request?._id, 'allow', request?.email)}
                                            >Accept
                                            </button>
                                            {/* <button
                                              className="btn btn-sm btn-error"
                                              onClick={() => deleteUpdateRequest(request?._id)}
                                            >
                                              Delete
                                            </button> */}
                                          </> :
                                          'Accepted'
                                        // <button
                                        //   className="btn btn-sm btn-error"
                                        // // onClick={() => deleteUpdateRequest(request?._id)}
                                        // >
                                        //   View
                                        // </button>
                                      }
                                    </>
                                }
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
              <p className="text-muted">No password requests found.</p>
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
            department={departments}
            allUsers={executives}
            // myDept={myDept}
            addCommentOnTicket={addCommentOnTicket}
            handlePriorityUpdate={handlePriorityUpdate}
            reAssignTicket={reAssignTicket}

            showPriorityUpdate={showPriorityUpdate}
            setShowPriorityUpdate={setShowPriorityUpdate}
            newPriority={newPriority}
            setNewPriority={setNewPriority}
            isCommentOpen={isCommentOpen}
            setIsCommentOpen={setIsCommentOpen}
            reAssignDiv={reAssignDiv}
            setReAssignDiv={setReAssignDiv}
            reAssignto={reAssignto}
            setReAssignto={setReAssignto}
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
                          selectedTicket?.priority === 'medium' ? 'badge-warning' : 'badge-primary'}`}
                          style={{ background: ticketSettings?.priorities?.find(p => p?.name === selectedTicket?.priority)?.color }}
                          onClick={() => setShowPriorityUpdate(!showPriorityUpdate)}
                        >
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
                    {showPriorityUpdate && (
                      <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md p-2 z-50">
                        <select
                          className="form-select"
                          value={newPriority}
                          onChange={(e) => setNewPriority(e.target.value)}
                        >
                          <option value="">Select Priority</option>
                          {
                            ticketSettings?.priorities?.map(curElem => (
                              <option value={curElem?.name}>{curElem?.name}</option>
                            ))
                          }

                        </select>
                        <div className="flex gap-2 mt-2">
                          {
                            loadingP ? <button className="btn btn-sm btn-primary">
                              <img src="/img/loader.png" className='Loader' alt="loader" />
                            </button>
                              :
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={handlePriorityUpdate}
                                disabled={!newPriority}
                              >
                                Update
                              </button>
                          }
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => {
                              setShowPriorityUpdate(false);
                              setNewPriority('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
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

                  Section 5: Reassign Ticket
                  <section className="space-y-2">
                    <h5 className="btn btn-primary" onClick={() => setReAssignDiv(!reAssignDiv)} >ReAssign Ticket</h5>
                    {
                      reAssignDiv &&
                      <div className="flex gap-2 flex-wrap items-left" style={{ flexDirection: 'column' }}>
                        <select className="form-select" onChange={(e) => setReAssignto({ ...reAssignto, name: e.target.value })} defaultValue="">
                          <option value="" disabled>ReAssign the Ticket</option>
                          {departments?.map((curElem, index) => (
                            !selectedTicket?.department?.some(dept => dept.name === curElem?.name) && (
                              <option key={index} value={curElem?.name}>{curElem?.name}</option>
                            )
                          ))}
                        </select>
                        <div className='deptcheckbox' style={{ background: 'none' }}>
                          {
                            executives?.map(exe => (
                              exe?.department === reAssignto.name &&
                              <span >{exe?.username} <input value={exe?.username} onChange={handleCheckboxChange} type="checkbox" /> </span>
                            ))
                          }

                        </div>
                        <textarea className='form-control'
                          placeholder='Description'
                          onChange={(e) => setReAssignto({ ...reAssignto, description: e.target.value })}
                          name="" id=""></textarea>
                        {
                          loadingR ? <button className="btn btn-primary">
                            <img src="/img/loader.png" className='Loader' alt="loader" />
                          </button>
                            :
                            <button className="btn btn-primary" onClick={reAssignTicket}>ReAssign</button>
                        }
                      </div>
                    }

                  </section>

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
                  <button className="btn btn-primary" onClick={() => addCommentOnTicket('', '')}>Add Comment</button>
                </div>

              </div>
            </div>
          </div> */}
        </div>

      )}
    </div>
  );
}

export default ManagerPanel;