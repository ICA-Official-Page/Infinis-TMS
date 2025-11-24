import { useState, useEffect } from 'react';
import mockUsers from '../../data/mockUsers';
import mockTickets from '../../data/mockTickets';
import mockPasswordRequests from '../../data/mockPasswordRequests';
import mockDepartments from '../../data/mockDepartments';
import UserForm from '../../components/UserForm';
import axios from 'axios';
import URI from '../../utills';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { } from '@fortawesome/free-brands-svg-icons'
import { faBell, faBuilding, faChartBar, faComment, faCommentAlt, faCommentDots, faEdit, faEye, faMoon, faUser } from '@fortawesome/free-regular-svg-icons'
import { faBars, faChartLine, faGear, faLock, faSignOut, faTicketAlt, faTimes, faTrash, faUserCog, faUsers, faUsersCog } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TicketForm from '../../components/TicketForm';
import { useNavigate } from 'react-router-dom';
import SessionEndWarning from '../../components/SessionEndWarning';
import TicketStatusChart from '../../components/TicketStatusChart';
import OpenTicketCategorization from '../../components/OpenTicketCategorization';
import ReportBar from '../../components/ReportBar';
import TicketCard from '../../components/TicketCard';
import { setSessionWarning } from '../../Redux/userSlice';

function TeamLeaderPanel({ view = 'executives' }) {

  const { user } = useSelector(store => store.user);

  const [executives, setExecutives] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [passwordRequests, setPasswordRequests] = useState([]);
  const [department, setDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showCSVForm, setShowCSVForm] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [showTicketForm, setShowTicketForm] = useState(false);

  const { sessionWarning } = useSelector(store => store.user);
  const dispatch = useDispatch();

  const [allRequests, setAllRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userRequest, setUserRequest] = useState();
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [loading, setLoading] = useState();
  const [reAssignDiv, setReAssignDiv] = useState(false);
  const [showPriorityUpdate, setShowPriorityUpdate] = useState(false);
  const [newPriority, setNewPriority] = useState('');
  const [reAssignto, setReAssignto] = useState({
    name: '',
    description: '',
    users: []
  });

  const navigate = useNavigate();

  const handlePriorityUpdate = async () => {
    try {
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
  }

  const [stats, setStats] = useState({
    // totalBranches: 0,
    // totalDepartments: 0,
    totalUsers: 0,
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    pendingPasswordRequests: 0,
    forgetPassRequest: 0
  });

  useEffect(() => {
    const stats = {
      // totalBranches: branches?.length,
      // totalDepartments: departments.length,
      totalUsers: allUsers?.length,
      totalTickets: tickets?.length,
      openTickets: tickets.filter(t => t.status === 'open').length,
      resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
      pendingPasswordRequests: userRequest?.filter((req) => req.status === 'pending')?.length,

      forgetPassRequest: allRequests?.filter((req) => user?.department === req?.department &&
        req?.designation === 'Executive' &&
        req?.branch === user?.branch).length
    };
    setStats(stats);
  }, [allUsers, tickets, allRequests, userRequest]);

  // fetch password request 
  const getAllRequests = async () => {
    try {
      const res = await axios.get(`${URI}/superadmin/getalladminrequests`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        setAllRequests(res?.data?.allRequests);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data && err.response.data.message) {
          toast.error(err.response.data.message); // For 400, 401, etc.
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log("while geting all admin requests", error);
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
        setDepartment(res?.data?.departmentes?.filter((dept) => dept.branch === user?.branch));
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

  const fetchEditProfileRequest = async () => {
    try {
      const res = await axios.get(`${URI}/auth/getupdateprofilerequests`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(r => {
        setUserRequest(r?.data?.requests?.filter((req) => user?.branch === req.branch && req?.designation === 'Executive'));
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
    getAllRequests();
    fetchDepartment();
    fetchEditProfileRequest();
  }, []);

  //fetch users
  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${URI}/admin/executives`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        setAllUsers(res?.data?.allBranchesData?.filter((exec) => exec?.branch === user?.branch));
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
    fetchAllUsers();
  }, []);

  // fetch tickets
  const fetchAllTickets = async () => {
    try {
      const res = await axios.get(`${URI}/executive/getalltickets`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(res => {
        const filtered = res?.data?.data?.filter(ticket =>
          ticket?.branch === user?.branch &&
          (
            ticket?.issuedby === `${user?.username}${user?.department ? ` - ${user.department}` : ''} (${user?.designation})` ||
            ticket?.department?.find(dept => dept?.name === user?.department)
          )
        );
        setTickets(filtered);
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

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const [myDept, setMyDept] = useState({});

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setMyDept(ticket?.department?.find((dept) => dept?.name === user?.department || ticket?.issuedby === user?.username));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
    setIsCommentOpen(false);
    setReAssignDiv(false);
    setShowPriorityUpdate(false);
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

  const handleEditUser = (userId) => {
    const userToEdit = allUsers?.find(exec => exec?._id === userId);
    setSelectedUser(userToEdit);
    setShowUserForm(true);

  };


  const confirmDeleteUser = async (userId) => {
    try {
      const res = await axios.delete(`${URI}/admin/deleteuser/${userId}`, {
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

  const handleCancelForm = () => {
    setSelectedUser(null);
    setShowUserForm(false);
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

  // Filter executives based on search term
  const filteredExecutives = allUsers?.filter(exec =>
    exec?.department === user?.department &&
    (
      exec?.username?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      exec?.email?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      exec?.address?.toLowerCase().includes(searchTerm?.toLowerCase())
    )
  );


  // Filter tickets based on status and search term
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket?.status === filterStatus;
    const matchesSearch = ticket?.subject?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      ticket?.name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      ticket?.issuedby?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      ticket?.date?.toLowerCase().includes(searchTerm?.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filter password requests based on search term and status
  const filteredPasswordRequests = allRequests.filter(req => {
    const departmentRequest = (
      user?.department === req?.department &&
      req?.designation === 'Executive' &&
      req?.branch === user?.branch
    )
    const matchesSearch = user ? (
      req.username?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      req.designation?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      req.department?.toLowerCase().includes(searchTerm?.toLowerCase())
    ) : false;

    return matchesSearch && departmentRequest;
  });

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
    const data = `ReAssign the Ticket to ${reAssignto?.users > 0 ? reAssignto?.users + '-' : ''} ${reAssignto?.name}`;

    try {
      if (reAssignto.name !== '') {
        addCommentOnTicket(data, '');
        const res = await axios.post(`${URI}/executive/ticketreassign`, { ticketId: selectedTicket?._id, presentDept: user?.department, reAssignto: reAssignto }, { withCredentials: true })
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
  }

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
    if (view === 'overview') {
      setShowTicketForm(false);
      setShowUserForm(false);
    }
    else if (view === 'executives') {
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

  // Render different content based on the view
  const renderContent = () => {
    switch (view) {
      case 'overview':
        return renderOverviewView();
      case 'executives':
        return renderExecutivesView();
      case 'tickets':
        return renderTLTicketsView();
      case 'password-requests':
        return renderPasswordRequestsView();
      case 'user-requests':
        return renderUserRequestsView();
      default:
        return renderExecutivesView();
    }
  };

  const renderOverviewView = () => (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Team Leader Dashboard</h2>
        <p className="text-muted">Admin Overview of the Ticketing System</p>
      </div>

      <div className="dashboard-grid" >

        <div className="stat-card" onClick={() => navigate('/dashboard/executives')}>
          <div className="stat-card-header">
            <h3 className="stat-card-title">Total Users</h3>
            <div className="stat-card-icon green">
              <FontAwesomeIcon icon={faUser} />
              {/* <FaUsers /> */}
            </div>
          </div>
          <div className="stat-card-value">{stats?.totalUsers}</div>
        </div>

        <div className="stat-card-1" onClick={() => navigate('/dashboard/tickets')}>
          <div className="stat-card-header">
            <h3 className="stat-card-title">Total Tickets</h3>
            <div className="stat-card-icon orange">
              <FontAwesomeIcon icon={faTicketAlt} />
              {/* <FaTicketAlt /> */}
            </div>
          </div>
          <div className="stat-card-value">{stats?.totalTickets}</div>
        </div>

        <div className="stat-card-2" onClick={() => navigate('/dashboard/user-requests')}>
          <div className="stat-card-header">
            <h3 className="stat-card-title">Pending Requests</h3>
            <div className="stat-card-icon orange">
              <FontAwesomeIcon icon={faLock} />
              {/* <FaTicketAlt /> */}
            </div>
          </div>
          <div className="stat-card-value">{stats?.pendingPasswordRequests}</div>
        </div>

        <div className="stat-card-3" onClick={() => navigate('/dashboard/password-requests')}>
          <div className="stat-card-header">
            <h3 className="stat-card-title">Password Requests</h3>
            <div className="stat-card-icon red">
              <FontAwesomeIcon icon={faLock} />
            </div>
          </div>
          <div className="stat-card-value">{stats?.forgetPassRequest}</div>
        </div>

      </div>

      <div className="grid grid-2 gap-4 mt-4">
        <TicketStatusChart ticket={tickets} />
        <OpenTicketCategorization openTickets={tickets?.filter(t => t?.status === 'open')} />

        <div className="card">
          <div className="card-header">
            <h3>Tickets Over the T.A.T.</h3>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>T.A.T.</th>
                  </tr>
                </thead>
                <tbody onClick={() => navigate('/dashboard/tickets')}>
                  {tickets?.map(dept => {
                    // const deptTeamLeaders = teamLeaders?.filter(tl => tl?.department === dept?.name);
                    const overTat = tickets?.filter(ticket => ticket?.department?.find(d => d.name === dept.name) && ticket?.status !== 'resolved' && ticket?.tat && formatTat(ticket?.tat, ticket?.createdAt) === 'TAT Over');
                    const deptTotalTickets = tickets?.filter(t =>
                      t.department?.some(d => d.name === dept?.name)
                    );
                    const deptOpenTickets = tickets?.filter(t =>
                      t.department?.some(d => d.name === dept?.name) && t?.status === 'open'
                    );

                    return (
                      tatBG(dept?.tat, dept?.createdAt) === 'red' && dept?.status !== 'resolved' &&
                      <tr key={dept?._id}>
                        <td>{dept?.name}</td>
                        <td>{dept?.category}</td>
                        <td>{dept?.status}</td>
                        <td style={{ color: 'red', fontWeight: 'bold' }} >{dept?.tat && formatTat(dept?.tat, dept?.createdAt)}</td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


    </>
  );

  

  // 1. Download CSV Template
  const [csvData, setCsvData] = useState([]);

  const downloadCSVTemplate = () => {
    const csvHeader = [
      "username,email,name,mobile,password,designation,postdesignation,branch,branches,department,address"
    ];
    const blob = new Blob([csvHeader.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 2. Trigger hidden file input
  const triggerFileInput = () => {
    document.getElementById('csvFileInput').click();
  };

  // 3. Handle CSV Upload and Parse
  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.trim().split('\n');
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());

        const parsedData = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim());
          const obj = {};
          headers.forEach((header, i) => {
            obj[header] = values[i] || '';
          });

          // Handle pipe-separated branches
          if (obj.branches) {
            obj.branches = obj.branches.split('|');
          }

          return obj;
        });

        setCsvData(parsedData);
      };
      reader.readAsText(file);
    }
  };

  // 4. Handle Create Users (e.g. Submit to backend)
  const handleCreateUsers = async () => {
    if (csvData.length === 0) {
      toast.error("Please upload a CSV file first.");
      return;
    }

    for (let user of csvData) {
      try {
        await makeUser(user);
      } catch (error) {
        console.error("Error creating user:", user.username, error.message);
      }
    }

    toast.success(`✅ Total ${csvData.length} users processed.`);
  };

  const makeUser = async (csvuser) => {
    try {
      setLoading(true);

      const formdata = new FormData();
      formdata.append('username', csvuser?.username || '');
      formdata.append('email', csvuser?.email || '');
      formdata.append('name', csvuser?.name || '');
      formdata.append('password', csvuser?.password || '');
      formdata.append('mobile', csvuser?.mobile || '');
      formdata.append('address', csvuser?.address || '');
      formdata.append('designation', csvuser?.designation || '');
      formdata.append('postdesignation', csvuser?.postdesignation || '');

      if (csvuser.designation === 'Executive') {
        formdata.append('department', csvuser?.department || '');
      }

      // if (csvuser.designation === 'admin') {
      //   (csvuser?.branches || []).forEach(branch => {
      //     formdata.append('branches', branch);
      //   });

      //   await axios.post(`${URI}/superadmin/makeadmin`, formdata, {
      //     headers: { 'Content-Type': 'multipart/form-data' },
      //     withCredentials: true
      //   });

      // } else 
      if (
        // csvuser.designation === 'Manager' ||
        csvuser.designation === 'Executive' 
      ) {
        formdata.append('branch', csvuser?.branch || '');

        const res = await axios.post(`${URI}/admin/adduser`, formdata, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });

        if (res.data.success) {
          toast.success(res.data.message);
        }

        // Notification for Executive/Team Leader
        if (csvuser.designation === 'Executive' || csvuser.designation === 'Team Leader') {
          await axios.post(`${URI}/notification/pushnotification`, {
            user: user?._id || '',
            branch: user?.branch || '',
            section: 'users',
            designation: user?.designation,
            department: user?.department || '',
          }, {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // toast.success(`${user.username} created`);
      fetchAllUsers();
      // fetchAllManagers();
      // fetchAllTeamLeaders();
    } catch (error) {
      console.error("while make user:", error);
      toast.error(error?.response?.data?.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };


  const renderExecutivesView = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Department Executives</h2>
          <p className="text-muted">Manage executives in your department</p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => setShowUserForm(true)}
          >
            Add New Executive
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setShowCSVForm(!showCSVForm);
              setShowUserForm(false);
            }}
          >
            Add with CSV
          </button>
        </div>
      </div>

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
            />
          </div>
        </div>
      ) :
        showCSVForm ? (
          <>
            <div className="card">
              <div className="card-body btn-group">
                <button className="btn btn-primary" onClick={downloadCSVTemplate}>Import CSV</button>

                <input
                  type="file"
                  id="csvFileInput"
                  accept=".csv"
                  onChange={handleImportCSV}
                  style={{ display: 'none' }}
                />

                <button className="btn btn-secondary" onClick={triggerFileInput}>Upload CSV</button>

                <button className="btn btn-primary" onClick={handleCreateUsers}>Create Users</button>
              </div>
            </div>

          </>
        )
          :
          (
            <>
              <div className="card mb-4">
                <div className="card-body">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search executives by name or email"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body p-0">
                  {filteredExecutives?.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>UserName</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Address</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredExecutives?.map(exec => {
                            // const execTickets = tickets.filter(t => t.createdBy === exec?.id);
                            return (
                              <>
                                {
                                  exec?.department === user?.department &&
                                  <tr key={exec?.id}>
                                    <td>
                                      <div className="flex items-center gap-2">
                                        {/* <div className="user-avatar">{exec?.avatar}</div> */}
                                        <img src={exec?.profile ? exec?.profile : '/img/admin.png'} className='user-avatar' alt="PF" />
                                        <span>{exec?.username}</span>
                                      </div>
                                    </td>
                                    <td>{exec?.email}</td>
                                    {/* <td>{formatDate(exec?.createdAt)}</td> */}
                                    <td>{exec?.mobile}</td>
                                    {/* <td>{execTickets.length}</td> */}
                                    <td>{exec?.address}</td>
                                    <td>
                                      <div className="flex gap-2">
                                        <button
                                          className="btn btn-sm btn-outline"
                                          onClick={() => handleEditUser(exec?._id)}
                                        >
                                          Edit
                                        </button>
                                        {/* <button
                                      className="btn btn-sm btn-error"
                                      onClick={() => confirmDeleteUser(exec?._id)}
                                    >
                                      Delete
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
                      <p className="text-muted">No executives found. Add a new executive to get started!</p>
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
                  // onClick={handleDeleteUser}
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

  const renderTLTicketsView = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Department Tickets</h2>
          <p className="text-muted">Manage and resolve tickets in your department</p>
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
          // await fetchAllTeamLeaders();
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
                placeholder="Search by title or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {showTicketForm ? (
        <div className="card mb-4 animate-slide-up">
          <div className="card-header">
            <h3>Create New Ticket</h3>
          </div>
          <div className="card-body">
            <TicketForm
              // onSubmit={handleCreateTicket}
              onCancel={() => setShowTicketForm(false)}
              fetchAllTickets={fetchAllTickets}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-body p-0">
              {filteredTickets.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Ticket Id</th>
                        <th>Name</th>
                        <th>IssuedBy</th>

                        <th>Subject</th>

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
                          <tr key={index + 1}>
                            {/* <td>#{index + 1}</td> */}
                            <td style={{ textAlign: 'center' }}>{ticket?.ticketId}</td>
                            <td>{ticket?.name}</td>
                            <td>{ticket?.issuedby}</td>
                            <td>{ticket?.subject}</td>
                            <td>
                              <span className={`badge ${ticket.status === 'open' ? 'badge-warning' :
                                ticket.status === 'in-progress' ? 'badge-primary' :
                                  'badge-success'
                                }`}>
                                {ticket.status === 'in-progress' ? 'In Progress' :
                                  ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1)}
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
                            <td>
                              <div className="flex gap-2" style={{ justifyContent: 'center' }}>
                                {
                                  loading?.id === ticket?._id && loading?.status ? <button className={`btn btn-${ticket?.status === 'open' ? 'primary' : 'success'}`}>
                                    <img src="/img/loader.png" className='Loader' alt="loader" />
                                  </button>
                                    :
                                    <>
                                      {ticket?.status !== 'resolved' && (
                                        <>
                                          {ticket?.status === 'open' && (
                                            <button
                                              className="btn btn-sm btn-primary"
                                              onClick={() => handleUpdateTicketStatus(ticket?._id, 'in-progress')}
                                            >
                                              Start
                                            </button>
                                          )}
                                          {ticket?.status === 'in-progress' && (
                                            <button
                                              className="btn btn-sm btn-success"
                                              onClick={() => handleUpdateTicketStatus(ticket?._id, 'resolved')}
                                            >
                                              Resolve
                                            </button>
                                          )}
                                        </>
                                      )}
                                    </>
                                }
                                <button className="btn btn-sm btn-outline" onClick={() => handleViewTicket(ticket)} >View</button>
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
                          <tr key={index + 1}>
                            <td style={{ textAlign: 'center' }}>{ticket?.ticketId}</td>
                            <td>{ticket?.name}</td>
                            <td>{ticket?.issuedby}</td>
                            <td>{ticket?.subject}</td>
                            <td>
                              <span className={`badge ${ticket.status === 'open' ? 'badge-warning' :
                                ticket.status === 'in-progress' ? 'badge-primary' :
                                  'badge-success'
                                }`}>
                                {ticket.status === 'in-progress' ? 'In Progress' :
                                  ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1)}
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
                            <td>
                              <div className="flex gap-2" style={{ justifyContent: 'center' }}>
                                {
                                  loading?.id === ticket?._id && loading?.status ? <button className={`btn btn-${ticket?.status === 'open' ? 'primary' : 'success'}`}>
                                    <img src="/img/loader.png" className='Loader' alt="loader" />
                                  </button>
                                    :
                                    <>
                                      {ticket?.status !== 'resolved' && (
                                        <>
                                          {ticket?.status === 'open' && (
                                            <button
                                              className="btn btn-sm btn-primary"
                                              onClick={() => handleUpdateTicketStatus(ticket?._id, 'in-progress')}
                                            >
                                              Start
                                            </button>
                                          )}
                                          {ticket?.status === 'in-progress' && (
                                            <button
                                              className="btn btn-sm btn-success"
                                              onClick={() => handleUpdateTicketStatus(ticket?._id, 'resolved')}
                                            >
                                              Resolve
                                            </button>
                                          )}
                                        </>
                                      )}
                                    </>
                                }
                                <button className="btn btn-sm btn-outline" onClick={() => handleViewTicket(ticket)} >View</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredTickets?.map((ticket, index) => {
                        return (
                          ticket?.status === 'resolved' &&
                          <tr key={index + 1}>
                            <td style={{ textAlign: 'center' }}>{ticket?.ticketId}</td>
                            <td>{ticket?.name}</td>
                            <td>{ticket?.issuedby}</td>
                            <td>{ticket?.subject}</td>
                            <td>
                              <span className={`badge ${ticket.status === 'open' ? 'badge-warning' :
                                ticket.status === 'in-progress' ? 'badge-primary' :
                                  'badge-success'
                                }`}>
                                {ticket.status === 'in-progress' ? 'In Progress' :
                                  ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1)}
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
                                }`} >
                                {ticket?.tat && formatTat(ticket?.tat, ticket?.createdAt)}
                              </span>
                            </td>
                            <td>
                              <div className="flex gap-2" style={{ justifyContent: 'center' }}>
                                {ticket.status !== 'resolved' && (
                                  <>
                                    {ticket.status === 'open' && (
                                      <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => handleUpdateTicketStatus(ticket._id, 'in-progress')}
                                      >
                                        Start
                                      </button>
                                    )}
                                    {ticket.status === 'in-progress' && (
                                      <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleUpdateTicketStatus(ticket._id, 'resolved')}
                                      >
                                        Resolve
                                      </button>
                                    )}
                                  </>
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
          </div> <br />
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
      )
      }
    </>
  );

  const renderPasswordRequestsView = () => (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Password Update Requests</h2>
        <p className="text-muted">Manage password change requests from executives</p>
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPasswordRequests?.map((request, index) => {
                      return (
                        <>
                          {
                            <tr key={request?.id}  >
                              <td>#{index + 1}</td>
                              <td>

                                <div className="flex items-center gap-2">
                                  <img src={request?.profile ? request?.profile : '/img/admin.png'} className='user-avatar' alt="PF" />
                                  <span>{request?.username}</span>
                                </div>

                              </td>
                              <td>
                                {request?.designation}
                              </td>
                              <td>{request?.department}</td>

                              <td>
                                {/* {request?.status === 'pending' ? ( */}
                                <div className="flex gap-2" style={{ justifyContent: 'center' }}>
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleEditUser(request?._id)}
                                  >
                                    {/* Approve */}
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  {/* <button
                                    className="btn btn-sm btn-error"
                                    onClick={() => deleteUpdateRequest(request?._id)}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                    
                                  </button> */}
                                  {/* <button className="btn btn-sm btn-outline"><FontAwesomeIcon icon={faEye} /></button> */}
                                </div>

                              </td>
                            </tr>
                          }</>
                      );
                    })}
                  </tbody >
                </table>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-muted">No password requests found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  const renderUserRequestsView = () => (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-bold">User Requests</h2>
        <p className="text-muted">Manage requests from executives</p>
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
                          request?.status === 'pending' && request?.designation === 'Executive' &&
                          <tr key={request?._id} >

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

                            <td >

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
            department={department}
            allUsers={allUsers}
            myDept={myDept}
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
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={handlePriorityUpdate}
                            disabled={!newPriority}
                          >
                            Update
                          </button>
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
                    
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <span className="font-bold">
                        {myDept?.name}{myDept?.description && ':'}</span>
                      {
                        myDept?.users && myDept?.users?.length > 0 ?
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
                            {myDept?.users?.map(curElem => (
                              <span>{curElem}</span>
                            ))}
                          </div> :
                          <span>No Specific Member Involved.</span>
                      }
                    </div>
                    <p className="text-sm" style={{ wordBreak: 'break-word' }} >{myDept?.description}</p>
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
                          {department?.map((curElem, index) => (
                            !selectedTicket?.department?.some(dept => dept.name === curElem?.name) && (
                              <option key={index} value={curElem?.name}>{curElem?.name}</option>
                            )
                          ))}
                        </select>
                        <div className='deptcheckbox' style={{ background: 'none' }}>
                          {
                            allUsers?.map(exe => (
                              exe?.department === reAssignto.name &&
                              <span >{exe?.username} <input value={exe?.username} onChange={handleCheckboxChange} type="checkbox" /> </span>
                            ))
                          }

                        </div>
                        <textarea className='form-control'
                          placeholder='Description'
                          onChange={(e) => setReAssignto({ ...reAssignto, description: e.target.value })}
                          name="" id=""></textarea>
                        <button className="btn btn-primary" onClick={reAssignTicket}>ReAssign</button>
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

export default TeamLeaderPanel;