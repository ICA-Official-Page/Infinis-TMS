import { useState, useEffect } from 'react';
import mockUsers from '../../data/mockUsers';
import mockTickets from '../../data/mockTickets';
import mockPasswordRequests from '../../data/mockPasswordRequests';
import mockDepartments from '../../data/mockDepartments';
import mockBranches from '../../data/mockBranches';
import UserForm from '../../components/UserForm';
import DepartmentForm from '../../components/DepartmentForm';
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';
import URI from '../../utills';
import toast from 'react-hot-toast';
import { } from '@fortawesome/free-brands-svg-icons'
import { faBell, faBuilding, faChartBar, faCommentDots, faEdit, faEye, faMoon, faUser } from '@fortawesome/free-regular-svg-icons'
import { faBars, faChartLine, faGear, faLock, faSearch, faSignOut, faTicketAlt, faTimes, faTrash, faUserCog, faUsers, faUsersCog } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { data, useNavigate } from 'react-router-dom';
import SessionEndWarning from '../../components/SessionEndWarning';
import TicketStatusChart from '../../components/TicketStatusChart';
import OpenTicketCategorization from '../../components/OpenTicketCategorization';
import ReportBar from '../../components/ReportBar';
import TicketCard from '../../components/TicketCard';
import { setSessionWarning } from '../../Redux/userSlice';

function AdminPanel({ view = 'departments' }) {

  const { sessionWarning, user } = useSelector(store => store.user);
  const dispatch = useDispatch();

  const [departments, setDepartments] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [managers, setManagers] = useState([]);
  const [executive, setExecutive] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [passwordRequests, setPasswordRequests] = useState([]);
  const [branch, setBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [selectedUser, setselectedUser] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');

  const [allUsers, setAllUsers] = useState([]);
  const [allRequests, setAllRequests] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [userRequest, setUserRequest] = useState();
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [loading, setLoading] = useState();
  const [loadingC, setLoadingC] = useState();
  const [loadingP, setLoadingP] = useState();
  const [loadingTI, setLoadingTI] = useState();
  const [loadingCS, setLoadingCS] = useState();
  const [loadingPS, setLoadingPS] = useState();
  const [loadingTIS, setLoadingTIS] = useState();

  const [stats, setStats] = useState({
    // totalBranches: 0,
    totalDepartments: 0,
    totalUsers: 0,
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    pendingPasswordRequests: 0,
    forgetPasswordRequests: 0
  });

  useEffect(() => {
    const stats = {
      // totalBranches: branches?.length,
      totalDepartments: departments.length,
      totalUsers: allUsers?.length + managers?.length + teamLeaders?.length,
      totalTickets: tickets?.length,
      openTickets: tickets.filter(t => t.status === 'open').length,
      resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
      pendingPasswordRequests: userRequest?.filter((req) => req.status === 'pending')?.length,
      forgetPasswordRequests: allRequests?.length
    };
    setStats(stats);
  }, [allUsers, tickets, userRequest, allRequests, departments, managers, teamLeaders]);

  const navigate = useNavigate();

  //fetching APIs
  // fetch password requests
  const getAllRequests = async () => {
    try {
      const res = await axios.get(`${URI}/superadmin/getalladminrequests`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        const matchedExecutives = res?.data?.allRequests?.filter((executive) =>
          user?.branches.includes(executive.branch)
        );
        setAllRequests(matchedExecutives);
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

  //fetch users
  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${URI}/admin/executives`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        const matchedExecutives = res?.data?.allBranchesData?.filter((executive) =>
          user?.branches.includes(executive.branch)
        );
        setAllUsers(matchedExecutives);
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

  //fetch team leaders
  const fetchAllTeamLeaders = async () => {
    try {
      const res = await axios.get(`${URI}/admin/teamleaders`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        const matchedExecutives = res?.data?.allBranchesData?.filter((executive) =>
          user?.branches.includes(executive.branch)
        );
        setTeamLeaders(matchedExecutives);
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

  //fetch managers
  const fetchAllManagers = async () => {
    try {
      const res = await axios.get(`${URI}/admin/managers`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        const matchedExecutives = res?.data?.allBranchesData?.filter((executive) =>
          user?.branches.includes(executive.branch)
        );
        setManagers(matchedExecutives);
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

  //fetch department
  const fetchDepartment = async () => {
    try {
      const res = await axios.get(`${URI}/admin/department`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        const matchedExecutives = res?.data?.departmentes?.filter((executive) =>
          user?.branches.includes(executive?.branch)
        );
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

  // fetch tickets
  const fetchAllTickets = async () => {
    try {
      const res = await axios.get(`${URI}/executive/getalltickets`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(res => {
        const matchedExecutives = res?.data?.data?.filter((ticket) =>
          user?.branches.includes(ticket?.branch)
        );
        setTickets(matchedExecutives);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true));
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

  const fetchEditProfileRequest = async () => {
    try {
      const res = await axios.get(`${URI}/auth/getupdateprofilerequests`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(r => {
        setUserRequest(r?.data?.requests?.filter((req) => user?.branches?.includes(req.branch)));
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
    fetchAllUsers();
    fetchAllManagers();
    fetchAllTeamLeaders();
    fetchAllTickets();
    fetchDepartment();
    fetchEditProfileRequest();
  }, []);


  //normal actions
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

  const handleEditUser = (userId, role) => {
    let userToEdit;
    if (role === 'Team Leader') {
      userToEdit = teamLeaders?.find(tl => tl._id === userId);
    } else if (role === 'Manager') {
      userToEdit = managers?.find(m => m._id === userId);
    }
    else if (role === 'Executive') {
      userToEdit = allUsers?.find(e => e._id === userId);
    }

    setselectedUser(userToEdit);
    setUserRole(role);
    setShowUserForm(true);
  };

  const handleEditDepartment = (departmentId) => {
    const departmentToEdit = departments.find(dept => dept._id === departmentId);
    setSelectedDepartment(departmentToEdit);
    setShowDepartmentForm(true);
  };

  const confirmDeleteDepartment = (departmentId) => {
    const departmentToDelete = departments.find(dept => dept._id === departmentId);
    setItemToDelete(departmentToDelete);
    setDeleteType('department');
    setIsDeleteModalOpen(true);
  };

  //filters
  // Filter departments based on search term
  const filteredDepartments = departments?.filter(dept =>
    dept?.branch === user?.branch &&
    dept.name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  // Filter team leaders and managers based on search term
  const filteredTeamLeaders = teamLeaders?.filter(tl =>
    tl.branch?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    tl.username?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    tl.email?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    tl.department?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const filteredManagers = managers?.filter(m =>
    m.branch?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    m.username?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    m.department?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const filteredExecutives = allUsers?.filter(m =>
    m.branch?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    m.username?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    m.department?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  // Filter tickets based on status and search term
  const filteredTickets = tickets?.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = ticket.subject?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      ticket?.branch?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      ticket?.date?.includes(searchTerm?.toLocaleLowerCase())
    return matchesStatus && matchesSearch;
  });

  // Filter password requests based on search term
  const filteredPasswordRequests = allRequests?.filter(req => {
    const matchesSearch =
      req?.username?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      req?.email?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      req?.department?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      req?.designation?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      req?.branch?.toLowerCase().includes(searchTerm?.toLowerCase());

    return matchesSearch;
  });

  //not worked
  const handleUpdateUser = (userData) => {
    if (userRole === 'Team Leader') {
      const updatedTeamLeaders = teamLeaders.map(tl =>
        tl.id === selectedUser?.id ? { ...tl, ...userData } : tl
      );
      setTeamLeaders(updatedTeamLeaders);
    } else if (userRole === 'Manager') {
      const updatedManagers = managers.map(m =>
        m.id === selectedUser?.id ? { ...m, ...userData } : m
      );
      setManagers(updatedManagers);
    }

    setselectedUser(null);
    setUserRole('');
    setShowUserForm(false);
    alert('User updated successfully!');
  };

  const handleDeleteUser = () => {
    if (userRole === 'Team Leader') {
      const updatedTeamLeaders = teamLeaders?.filter(tl => tl.id !== itemToDelete.id);
      setTeamLeaders(updatedTeamLeaders);
    } else if (userRole === 'Manager') {
      const updatedManagers = managers?.filter(m => m.id !== itemToDelete.id);
      setManagers(updatedManagers);
    }

    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    setUserRole('');
    alert('User deleted successfully!');
  };

  const handleCreateDepartment = (departmentData) => {
    // In a real app, this would be an API call
    const newDepartment = {
      id: mockDepartments.length + 1,
      name: departmentData.name,
      description: departmentData.description,
      branchId: branch.id,
      managerId: departmentData.managerId || null,
      createdAt: new Date().toISOString()
    };

    // setDepartments([...departments, newDepartment]);
    setShowDepartmentForm(false);
    alert('Department created successfully!');
  };

  const handleUpdateDepartment = (departmentData) => {
    const updatedDepartments = departments.map(dept =>
      dept.id === selectedDepartment.id ? { ...dept, ...departmentData } : dept
    );

    // setDepartments(updatedDepartments);
    setSelectedDepartment(null);
    setShowDepartmentForm(false);
    alert('Department updated successfully!');
  };

  const handleUpdateTicketStatus = (ticketId, newStatus) => {
    const updatedTickets = tickets.map(ticket =>
      ticket.id === ticketId ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() } : ticket
    );

    // setTickets(updatedTickets);
    alert('Ticket status updated successfully!');
  };

  const handleApprovePasswordRequest = (requestId) => {
    const updatedRequests = passwordRequests.map(req =>
      req.id === requestId ?
        {
          ...req,
          status: 'approved',
          resolvedBy: user?.id,
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
          resolvedBy: user?.id,
          resolvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } : req
    );

    setPasswordRequests(updatedRequests);
    alert('Password request rejected!');
  };

  useEffect(() => {
    // Get branch info
    const userBranch = mockBranches.find(b => b.adminId === user?.id);
    setBranch(userBranch);

    // Get departments in the branch
    const branchDepartments = mockDepartments?.filter(dept =>
      dept.branchId === userBranch?.id
    );
    // setDepartments(branchDepartments);

    // Get team leaders in the branch
    const branchTeamLeaders = mockUsers?.filter(u =>
      u?.designation === 'Team Leader' && branchDepartments.some(dept => dept.name === u.department)
    );
    setTeamLeaders(branchTeamLeaders);

    // Get managers in the branch
    const branchManagers = mockUsers?.filter(u =>
      u?.designation === 'Manager' && branchDepartments.some(dept => dept.name === u.department)
    );
    setManagers(branchManagers);

    // Get all tickets in the branch
    const branchTickets = mockTickets?.filter(ticket =>
      branchDepartments.some(dept => dept.name === ticket.department)
    );
    // setTickets(branchTickets);

    // Get password requests from team leaders and managers
    const teamLeaderIds = branchTeamLeaders.map(tl => tl.id);
    const managerIds = branchManagers.map(m => m.id);
    const branchPasswordRequests = mockPasswordRequests?.filter(req =>
      teamLeaderIds.includes(req.userId) || managerIds.includes(req.userId)
    );
    setPasswordRequests(branchPasswordRequests);
  }, [user?.id]);


  //action APIs
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
            dispatch(setSessionWarning(true));
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

  const deleteUserEditRequest = async (id) => {
    try {
      const res = await axios.delete(`${URI}/admin/deleteusereditrequest/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(res => {
        fetchEditProfileRequest();
        toast.success(res?.data?.message);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true));
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
              dispatch(setSessionWarning(true));
            } else {
              toast.error(err.response.data.message || "Something went wrong");
            }
          } else {
            toast.error("Something went wrong");
          }
        });
      }
      else {
        toast.error('Please Write Something in Comment Box!');
      }
    } catch (error) {
      console.log('error while adding comment', error);
    }
  }

  const confirmDeleteUser = async (userId) => {
    try {
      const res = await axios.delete(`${URI}/admin/deleteuser/${userId}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(res => {
        fetchAllUsers();
        fetchAllManagers();
        fetchAllTeamLeaders();
        fetchDepartment();
        toast.success(res?.data?.message);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true));
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

  const handleDeleteDepartment = async () => {
    try {
      const res = await axios.delete(`${URI}/admin/deletedepartment/${itemToDelete?._id}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(res => {
        fetchDepartment();
        fetchAllTeamLeaders();
        setItemToDelete('');
        setDeleteType('');
        setIsDeleteModalOpen(false);
        toast.success(res?.data?.message);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true));
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
            dispatch(setSessionWarning(true));
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
      setShowDepartmentForm(false);
      setShowUserForm(false);
    }
    else if (view === 'departments') {
      setShowUserForm(false);
    }
    else if (view === 'leadership') {
      setShowDepartmentForm(false);
    }
    else if (view === 'tickets') {
      setShowDepartmentForm(false);
      setShowUserForm(false);
    }
    else if (view === 'password-requests') {
      setShowDepartmentForm(false);
    }
    else if (view === 'user-requests') {
      setShowDepartmentForm(false);
      setShowUserForm(false);
    }
    else if (view === 'ticket-settings') {
      setShowDepartmentForm(false);
      setShowUserForm(false);
    }
    else {
      setShowDepartmentForm(false);
      setShowUserForm(false);
    }
  }, [view])

  // Render different content based on the view
  const renderContent = () => {
    switch (view) {
      case 'overview':
        return renderOverviewView();
      case 'departments':
        return renderDepartmentsView();
      case 'leadership':
        return renderLeadershipView();
      case 'tickets':
        return renderTicketsView();
      case 'password-requests':
        return renderPasswordRequestsView();
      case 'user-requests':
        return renderUserRequestsView();
      case 'ticket-settings':
        return renderTicketSetting();
      default:
        return renderDepartmentsView();
    }
  };


  // Ticket Settings State
  const [categories, setCategories] = useState([]);
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
        console.log('ticket settings', r?.data?.ticketSettings);
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

  const [priorities, setPriorities] = useState([
    { id: 1, name: 'Low', color: '#10B981' },
    { id: 2, name: 'Medium', color: '#F59E0B' },
    { id: 3, name: 'High', color: '#EF4444' },
    { id: 4, name: 'Critical', color: '#7C3AED' }
  ]);

  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newPriority, setNewPriority] = useState({ name: '', color: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingPriority, setEditingPriority] = useState(null);
  const [ticketId, setTicketId] = useState('');
  const [editTicketId, setEditTicketId] = useState('');
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [tat, setTat] = useState({
    day: '',
    hour: '',
    mint: ''
  })
  const [editingTat, setEditingTat] = useState({
    day: '',
    hour: '',
    mint: ''
  })
  const [activeTab, setActiveTab] = useState('categories');

  useEffect(() => {
    // Get branch info
    const userBranch = mockBranches.find(b => b.adminId === user?.id);
    setBranch(userBranch);

    // Get departments in the branch
    const branchDepartments = mockDepartments.filter(dept =>
      dept.branchId === userBranch?.id
    );
    setDepartments(branchDepartments);

    // Get team leaders in the branch
    const branchTeamLeaders = mockUsers.filter(u =>
      u.role === 'teamleader' && branchDepartments.some(dept => dept.name === u.department)
    );
    setTeamLeaders(branchTeamLeaders);

    // Get managers in the branch
    const branchManagers = mockUsers.filter(u =>
      u.role === 'manager' && branchDepartments.some(dept => dept.name === u.department)
    );
    setManagers(branchManagers);

    // Get all tickets in the branch
    const branchTickets = mockTickets.filter(ticket =>
      branchDepartments.some(dept => dept.name === ticket.department)
    );
    setTickets(branchTickets);

    // Get password requests from team leaders and managers
    const teamLeaderIds = branchTeamLeaders.map(tl => tl?.id);
    const managerIds = branchManagers.map(m => m?.id);
    const branchPasswordRequests = mockPasswordRequests.filter(req =>
      teamLeaderIds.includes(req.userId) || managerIds.includes(req.userId)
    );
    setPasswordRequests(branchPasswordRequests);
  }, [user?.id]);

  const handleAddCategory = async () => {
    if (!newCategory.name.trim() || !newCategory.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoadingC(true);
      const res = await axios.post(`${URI}/admin/addticketsettings`, { categories: newCategory, adminId: user?._id, branches: user?.branches },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      ).then(r => {
        fetchTicketSettings();
        setNewCategory({ name: '', description: '' });
        toast.success(r?.data?.message);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true));
          } else {
            toast.error(err.response.data.message || "Something went wrong");
          }
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log('while add categories', error);
    }
    finally {
      setLoadingC(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim() || !editingCategory.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoadingCS(true);
      const res = await axios.post(`${URI}/admin/updateticketsettings`, { adminId: user?._id, categories: editingCategory, branches: user?.branches }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(r => {
        fetchTicketSettings();
        setEditingCategory(null);
        toast.success(r.data.message);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true));
          } else {
            toast.error(err.response.data.message || "Something went wrong");
          }
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log('while update category', error);
    }
    finally {
      setLoadingCS(false);
    }
  };

  const handleDeleteCategory = async (categories) => {
    try {
      const res = await axios.post(`${URI}/admin/deleteticketsettings`, { adminId: ticketSettings?.adminId, categories }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(r => {
        fetchTicketSettings();
        toast.success(r.data.message);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true));
          } else {
            toast.error(err.response.data.message || "Something went wrong");
          }
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log('while delete category', error);
    }
  };

  const handleAddPriority = async () => {
    if (!newPriority.name.trim() || !newPriority.color.trim() || (!tat.day && !tat.hour && !tat.mint)) {
      toast.error('Please fill in all fields');
      return;
    }
    const savePriority = {
      ...newPriority,
      tat: tat?.day || tat?.hour || tat.mint
    }

    try {
      setLoadingP(true);
      const res = await axios.post(`${URI}/admin/addticketsettings`, { priorities: savePriority, adminId: user?._id, branches: user?.branches, },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      ).then(r => {
        fetchTicketSettings();
        setNewPriority({ name: '', color: '' });
        setTat({
          day: '',
          hour: '',
          mint: ''
        })
        toast.success(r?.data?.message);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true));
          } else {
            toast.error(err.response.data.message || "Something went wrong");
          }
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log('while add categories', error);
    }
    finally {
      setLoadingP(false);
    }
  };

  const handleUpdatePriority = async () => {
    if (!editingPriority || !editingPriority.name.trim() || !editingPriority.color.trim() || (!editingTat.day && !editingTat.hour && !editingTat.mint)) {
      toast.error('Please fill in all fields');
      return;
    }

    const savePriority = {
      ...editingPriority,
      tat: editingTat?.day || editingTat?.hour || editingTat.mint
    }
    try {
      setLoadingPS(true);
      const res = await axios.post(`${URI}/admin/updateticketsettings`, { adminId: user?._id, priorities: savePriority, branches: user?.branches }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(r => {
        fetchTicketSettings();
        setEditingPriority(null);
        toast.success(r.data.message);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true));
          } else {
            toast.error(err.response.data.message || "Something went wrong");
          }
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log('while update category', error);
    }
    finally {
      setLoadingPS(false);
    }
  };

  const handleDeletePriority = async (priorities) => {
    try {
      const res = await axios.post(`${URI}/admin/deleteticketsettings`, { adminId: ticketSettings?.adminId, priorities }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(r => {
        fetchTicketSettings();
        toast.success(r.data.message);
      }
      ).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true));
          } else {
            toast.error(err.response.data.message || "Something went wrong");
          }
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log('while delete category', error);
    }
  };

  const defineTicketId = async () => {
    try {
      setLoadingTI(true);
      const res = await axios.post(`${URI}/admin/addticketsettings`, { ticketId: ticketId, adminId: user?._id, branches: user?.branches, },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      ).then(r => {
        fetchTicketSettings();
        setTicketId('');
        toast.success(r?.data?.message);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true));
          } else {
            toast.error(err.response.data.message || "Something went wrong");
          }
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log('while define ticket id');
    }
    finally {
      setLoadingTI(false);
    }
  }

  const handleUpdateTicketId = async () => {
    if (!editingTicketId.trim()) {
      toast.error('Please fill the Ticket Id Field!');
      return;
    }
    try {
      setLoadingTIS(true);
      const res = await axios.post(`${URI}/admin/updateticketsettings`, { adminId: user?._id, ticketId: editingTicketId, branches: user?.branches }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(r => {
        fetchTicketSettings();
        setEditingTicketId('');
        toast.success(r.data.message);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true));
          } else {
            toast.error(err.response.data.message || "Something went wrong");
          }
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log('while updating ticket id', error);
    }
    finally {
      setLoadingTIS(false);
    }
  }

  const handleDeleteTicketId = async (ticketId) => {
    try {
      const res = await axios.post(`${URI}/admin/deleteticketsettings`, { adminId: ticketSettings?.adminId, ticketId }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(r => {
        fetchTicketSettings();
        toast.success(r.data.message);
      }
      ).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data) {
          if (err.response.data.notAuthorized) {
            dispatch(setSessionWarning(true));
          } else {
            toast.error(err.response.data.message || "Something went wrong");
          }
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log('while delete Ticket Id', error);
    }
  }

  const days = ['1 day', '2 days', '3 days', '4 days', '5 days', '6 days', '1 week', '2 week',];
  const hours = ['1 hour', '2 hours', '3 hours', '4 hours', '5 hours', '6 hours', '7 hours', '8 hours', '9 hours', '10 hours', '11 hours', '12 hours', '13 hours', '14 hours', '15 hours', '16 hours', '17 hours', '18 hours', '19 hours', '20 hours', '21 hours', '22 hours', '23 hours', '24 hours'];

  const renderTicketSetting = () => (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Ticket Settings</h2>
        <p className="text-muted">Manage ticket categories and priorities</p>
      </div>
      <div className="grid grid-2 gap-4">
        {/* Categories Section */}
        <div className="card">
          <div className="card-header">
            <h3>Categories</h3>
          </div>
          <div className="card-body">
            {/* Add New Category Form */}
            <div className="mb-4 p-3 bg-gray-100 rounded">
              <h4 className="mb-2 font-medium">Add New Category</h4>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
              </div>
              {
                loadingC ? <button className="btn btn-primary mt-2">
                  <img src="/img/loader.png" className='Loader' alt="loader" />
                </button>
                  :
                  <button className="btn btn-primary mt-2" onClick={handleAddCategory}>
                    Add Category
                  </button>
              }
            </div>

            {/* Categories List */}
            <div className="space-y-3">
              {ticketSettings?.categories?.map(category => (
                <div key={category?._id} className="p-3 border rounded">
                  {editingCategory?._id === category?._id ? (
                    <div>
                      <input
                        type="text"
                        className="form-control mb-2"
                        value={editingCategory?.name}
                        onChange={(e) => setEditingCategory({
                          ...editingCategory,
                          name: e.target.value
                        })}
                      />
                      <input
                        type="text"
                        className="form-control mb-2"
                        value={editingCategory?.description}
                        onChange={(e) => setEditingCategory({
                          ...editingCategory,
                          description: e.target.value
                        })}
                      />
                      <div className="flex gap-2">
                        {
                          loadingCS ? <button className="btn btn-sm btn-primary">
                            <img src="/img/loader.png" className='Loader' alt="loader" />
                          </button>
                            :
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={handleUpdateCategory}
                            >
                              Save
                            </button>
                        }
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => setEditingCategory(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium">{category?.name}</h4>
                      <p className="text-sm text-muted">{category?.description}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => setEditingCategory(category)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleDeleteCategory(category._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priorities Section */}
        <div className="card">
          <div className="card-header">
            <h3>Priorities</h3>
          </div>
          <div className="card-body">
            {/* Add New Priority Form */}
            <div className="mb-4 p-3 bg-gray-100 rounded">
              <h4 className="mb-2 font-medium">Add New Priority</h4>
              <div className="form-group">

                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Priority Name"
                  value={newPriority.name}
                  onChange={(e) => setNewPriority({ ...newPriority, name: e.target.value })}
                />
                <label htmlFor="status-filter" className="form-label">Turn Around Time</label>
                <div className="mb-2 d-flex gap-2" style={{ display: 'flex', width: '100%' }}>
                  {
                    !tat?.hour && !tat?.mint &&
                    <select name="" id=""
                      className="form-control mb-2"
                      onChange={(e) => setTat({ day: e.target.value })}
                    >
                      <option value="" selected disabled>Days</option>
                      {
                        days?.map(curElem => (
                          <option value={curElem}>{curElem}</option>
                        ))
                      }
                    </select>
                  }
                  {
                    !tat?.day && !tat?.mint &&
                    <select name="" id=""
                      className="form-control mb-2"
                      onChange={(e) => setTat({ hour: e.target.value })}
                    >
                      <option value="" selected disabled>Hours</option>
                      {
                        hours?.map(curElem => (
                          <option value={curElem}>{curElem}</option>
                        ))
                      }
                    </select>
                  }
                  {
                    !tat?.hour && !tat?.day &&
                    <select name="" id=""
                      className="form-control mb-2"
                      onChange={(e) => setTat({ mint: e.target.value })}
                    >
                      <option value="" selected disabled>Minutes</option>
                      {
                        Array.from({ length: 60 }, (_, i) => i + 1).map(curElem => (
                          <option value={`${curElem} minutes`}>{curElem} minutes</option>
                        ))
                      }
                    </select>
                  }
                </div>
                <label htmlFor="color" className="form-label">Select the Color</label>
                <input
                  type="color"
                  className="form-control"
                  id='color'
                  value={newPriority.color}
                  onChange={(e) => setNewPriority({ ...newPriority, color: e.target.value })}
                />
              </div>
              {
                loadingP ? <button className="btn btn-primary mt-2">
                  <img src="/img/loader.png" className='Loader' alt="loader" />
                </button>
                  :
                  <button className="btn btn-primary mt-2" onClick={handleAddPriority}>
                    Add Priority
                  </button>
              }
            </div>

            {/* Priorities List */}
            <div className="space-y-3">
              {ticketSettings?.priorities?.map(priority => (
                <div key={priority?._id} className="p-3 border rounded">
                  {editingPriority?._id === priority?._id ? (
                    <div>
                      <input
                        type="text"
                        className="form-control mb-2"
                        value={editingPriority?.name}
                        onChange={(e) => setEditingPriority({
                          ...editingPriority,
                          name: e.target.value
                        })}
                      />
                      <label htmlFor="status-filter" className="form-label">Turn Around Time</label>
                      <div className="mb-2 d-flex gap-2" style={{ display: 'flex', width: '100%' }}>
                        {
                          !editingTat?.hour && !editingTat?.mint &&
                          <select name="" id=""
                            className="form-control mb-2"
                            onChange={(e) => setEditingTat({ day: e.target.value })}
                          >
                            <option value="" selected disabled>Days</option>
                            {
                              days?.map(curElem => (
                                <option value={curElem}>{curElem}</option>
                              ))
                            }
                          </select>
                        }
                        {
                          !editingTat?.day && !editingTat?.mint &&
                          <select name="" id=""
                            className="form-control mb-2"
                            onChange={(e) => setEditingTat({ hour: e.target.value })}
                          >
                            <option value="" selected disabled>Hours</option>
                            {
                              hours?.map(curElem => (
                                <option value={curElem}>{curElem}</option>
                              ))
                            }
                          </select>
                        }
                        {
                          !editingTat?.hour && !editingTat?.day &&
                          <select name="" id=""
                            className="form-control mb-2"
                            onChange={(e) => setEditingTat({ mint: e.target.value })}
                          >
                            <option value="" selected disabled>Minutes</option>
                            {
                              Array.from({ length: 60 }, (_, i) => i + 1).map(curElem => (
                                <option value={`${curElem} minutes`}>{curElem} minutes</option>
                              ))
                            }
                          </select>
                        }
                      </div>
                      <label htmlFor="color" className="form-label">Select the Color</label>
                      <input
                        type="color"
                        className="form-control mb-2"
                        value={editingPriority?.color}
                        onChange={(e) => setEditingPriority({
                          ...editingPriority,
                          color: e.target.value
                        })}
                      />
                      <div className="flex gap-2">
                        {
                          loadingPS ? <button className="btn btn-sm btn-primary">
                            <img src="/img/loader.png" className='Loader' alt="loader" />
                          </button>
                            :
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={handleUpdatePriority}
                            >
                              Save
                            </button>
                        }
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => setEditingPriority(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{
                            backgroundColor: priority?.color,
                            padding: '5px 10px',
                            borderRadius: '5px',
                            color: parseInt(priority?.color?.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff'
                          }}
                        >
                          <span className="font-medium">{priority?.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{
                            // backgroundColor: priority?.color,
                            padding: '5px 10px',
                            borderRadius: '5px',
                            // color: parseInt(priority?.color?.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff'
                          }}
                        >
                          <span className="font-medium">{priority?.tat}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => setEditingPriority(priority)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleDeletePriority(priority?._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Branch Ticket Id</h3>
          </div>
          <div className="card-body">
            {/* Add New Ticket Id Form */}
            <div className="mb-4 p-3 bg-gray-100 rounded">
              <h4 className="mb-2 font-medium">Define Ticket Id</h4>
              <div className="form-group">

                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Define Id"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                />
              </div>
              {
                loadingTI ? <button className="btn btn-primary mt-2">
                  <img src="/img/loader.png" className='Loader' alt="loader" />
                </button>
                  :
                  <button className="btn btn-primary mt-2" onClick={defineTicketId}>
                    Submit
                  </button>
              }
            </div>

            {/* Show Ticket Id */}
            <div className="space-y-3">

              <div className="p-3 border rounded">
                {editingTicketId ? (
                  <div>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={editingTicketId}
                      onChange={(e) => setEditingTicketId(e.target.value)}
                    />

                    <div className="flex gap-2">
                      {
                        loadingTIS ? <button className="btn btn-sm btn-primary">
                          <img src="/img/loader.png" className='Loader' alt="loader" />
                        </button>
                          :
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={handleUpdateTicketId}
                          >
                            Save
                          </button>
                      }
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => setEditingTicketId('')}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {
                      ticketSettings?.ticketId &&
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{
                              // backgroundColor: priority?.color,
                              padding: '5px 10px',
                              borderRadius: '5px',
                              // color: parseInt(priority?.color?.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff'
                            }}
                          >
                            <span className="font-medium">{ticketSettings?.ticketId}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setEditingTicketId(ticketSettings?.ticketId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => handleDeleteTicketId(ticketSettings?.ticketId)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    }
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderOverviewView = () => (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
        <p className="text-muted">Admin Overview of the Ticketing System</p>
      </div>

      <div className="dashboard-grid" >

        <div className="stat-card" onClick={() => navigate('/dashboard/departments')}>
          <div className="stat-card-header">
            <h3 className="stat-card-title">Departments</h3>
            <div className="stat-card-icon blue">
              <FontAwesomeIcon icon={faUser} />
            </div>
          </div>
          <div className="stat-card-value">{stats?.totalDepartments}</div>
        </div>

        <div className="stat-card-1" onClick={() => navigate('/dashboard/leadership')}>
          <div className="stat-card-header">
            <h3 className="stat-card-title">Total Users</h3>
            <div className="stat-card-icon green">
              <FontAwesomeIcon icon={faUser} />
              {/* <FaUsers /> */}
            </div>
          </div>
          <div className="stat-card-value">{stats?.totalUsers}</div>
        </div>

        <div className="stat-card-2" onClick={() => navigate('/dashboard/tickets')}>
          <div className="stat-card-header">
            <h3 className="stat-card-title">Total Tickets</h3>
            <div className="stat-card-icon orange">
              <FontAwesomeIcon icon={faTicketAlt} />
              {/* <FaTicketAlt /> */}
            </div>
          </div>
          <div className="stat-card-value">{stats?.totalTickets}</div>
        </div>

        <div className="stat-card-3" onClick={() => navigate('/dashboard/user-requests')}>
          <div className="stat-card-header">
            <h3 className="stat-card-title">Pending Requests</h3>
            <div className="stat-card-icon orange">
              <FontAwesomeIcon icon={faLock} />
              {/* <FaTicketAlt /> */}
            </div>
          </div>
          <div className="stat-card-value">{stats?.pendingPasswordRequests}</div>
        </div>

      </div>

      <div className="grid grid-2 gap-4 mt-4">

        <TicketStatusChart ticket={tickets} />

        <OpenTicketCategorization openTickets={tickets?.filter(t => t?.status === 'open')} />

      </div> <br />
      <div className="card">
        <div className="card-header">
          <h3>Branch Overview</h3>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Manager</th>
                  <th>Total Tickets</th>
                  <th>Open Tickets</th>
                  <th>Over Tat</th>
                </tr>
              </thead>
              <tbody onClick={() => navigate('/dashboard/tickets')}>
                {user?.branches?.map(dept => {
                  // const deptTeamLeaders = teamLeaders?.filter(tl => tl?.department === dept?.name);
                  const overTat = tickets?.filter(ticket => dept === ticket?.branch && ticket?.status !== 'resolved' && ticket?.tat && formatTat(ticket?.tat, ticket?.createdAt) === 'TAT Over');
                  const deptTotalTickets = tickets?.filter(t =>
                    dept === t?.branch
                  );
                  const deptOpenTickets = tickets?.filter(t =>
                    dept === t?.branch && t?.status === 'open'
                  );

                  const manager = managers?.find(man => man?.branch === dept);
                  console.log(manager);
                  return (
                    <tr key={dept?._id}>
                      <td>{dept}</td>
                      <td>{manager ? manager?.name : 'Not Assigned'}</td>
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

  const renderDepartmentsView = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Departments</h2>
          <p className="text-muted">Manage departments in {user?.branch || 'your organization'}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowDepartmentForm(true)}
        >
          Add New Department
        </button>
      </div>

      {showDepartmentForm ? (
        <div className="card mb-4 animate-slide-up">
          <div className="card-header">
            <h3>{selectedDepartment ? 'Edit Department' : 'Create New Department'}</h3>
          </div>
          <div className="card-body">
            <DepartmentForm
              initialData={selectedDepartment}
              allUsers={teamLeaders}
              // onSubmit={selectedDepartment ? handleUpdateDepartment : handleCreateDepartment}
              fetchDepartment={fetchDepartment}
              onCancel={() => {
                setSelectedDepartment(null);
                setShowDepartmentForm(false);
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
                  placeholder="Search departments by name or description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-0">
              {filteredDepartments.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Branch</th>
                        <th>Team Leader</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDepartments.map(dept => {
                        const tl = teamLeaders?.find(tl => tl?.username === dept?.teamleader);
                        return (
                          <tr key={dept.id}  >
                            <td className="font-medium">{dept?.name}</td>
                            <td>{dept?.branch}</td>
                            <td >
                              {tl ? (
                                <div className="flex items-center gap-2" style={{ justifyContent: 'center' }} >
                                  <img className="user-avatar" src={tl?.profile ? tl?.profile : '/img/admin.png'} alt="/img/admin.png" />
                                  <span>{tl?.name}</span>
                                </div>
                              ) : <span className="text-muted " >Not assigned</span>}
                            </td>
                            <td>{formatDate(dept.createdAt)}</td>
                            <td style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div className="flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline"
                                  onClick={() => handleEditDepartment(dept?._id)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-error"
                                  onClick={() => confirmDeleteDepartment(dept?._id)}
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
                  <p className="text-muted">No departments found. Add a new department to get started!</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderLeadershipView = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Team Leaders & Managers</h2>
          <p className="text-muted">Manage leadership in {user?.branch || 'your organization'}</p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setUserRole('Executive');
              setShowUserForm(true);
            }}
          >
            Add Executive
          </button>
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
              setUserRole('Manager');
              setShowUserForm(true);
            }}
          >
            Add Manager
          </button>
        </div>
      </div>

      {showUserForm ? (
        <div className="card mb-4 animate-slide-up">
          <div className="card-header">
            <h3>
              {selectedUser
                ? `Edit ${userRole === 'Team Leader' ? 'Team Leader' : userRole === 'Manager' ? 'Manager' : 'Executive'}`
                : `Create New ${userRole === 'Team Leader' ? 'Team Leader' : userRole === 'Manager' ? 'Manager' : 'Executive'}`}
            </h3>
          </div>
          <div className="card-body">
            <UserForm
              initialData={selectedUser}
              designation={userRole}
              fetchAllUsers={userRole === 'Executive' ? fetchAllUsers : userRole === 'Manager' ? fetchAllManagers : fetchAllTeamLeaders}
              onCancel={() => {
                setselectedUser(null);
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
                        <th>Department</th>
                        <th>Branch</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeamLeaders?.map(tl => (
                        <>
                          {
                            // tl?.designation === "Team Leader" && tl?.branch === user?.branch &&
                            <tr key={tl.id}>
                              <td>
                                <div className="flex items-center gap-2" style={{ justifyContent: 'center' }}>
                                  <img className="user-avatar" src={tl?.profile ? tl?.profile : '/img/admin.png'} alt="/img/admin.png" />
                                  {/* <div className="user-avatar">{tl?.profile}</div> */}
                                  <span>{tl?.username}</span>
                                </div>
                              </td>

                              <td>{tl?.department ? tl?.department : 'Not Assigned'}</td>
                              <td>{tl?.branch}</td>
                              <td>{formatDate(tl?.createdAt)}</td>
                              <td style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div className="flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() => handleEditUser(tl?._id, 'Team Leader')}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-error"
                                    onClick={() => confirmDeleteUser(tl?._id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          }
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-muted">No team leaders found. Add a new team leader to get started!</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Managers</h3>
            </div>
            <div className="card-body p-0">
              {filteredManagers?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Branch</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredManagers?.map(m => (
                        <>
                          {
                            // m?.designation === "Manager" && m?.branch === user?.branch &&
                            < tr key={m.id}>
                              <td>
                                <div className="flex items-center gap-2" style={{ justifyContent: 'center' }}>
                                  <img className="user-avatar" src={m?.profile ? m?.profile : '/img/admin.png'} alt="/img/admin.png" />
                                  {/* <div className="user-avatar">{m?.profile}</div> */}
                                  <span>{m?.username}</span>
                                </div>
                              </td>
                              <td>{m?.email}</td>
                              <td>{m?.branch}</td>
                              <td>{formatDate(m.createdAt)}</td>
                              <td>
                                <div className="flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() => handleEditUser(m?._id, 'Manager')}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-error"
                                    onClick={() => confirmDeleteUser(m?._id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr >
                          }
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-muted">No managers found. Add a new manager to get started!</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Executives</h3>
            </div>
            <div className="card-body p-0">
              {filteredExecutives?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Branch</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExecutives?.map(m => (
                        <>
                          {
                            // m?.designation === "Manager" && m?.branch === user?.branch &&
                            < tr key={m.id}>
                              <td>
                                <div className="flex items-center gap-2" style={{ justifyContent: 'center' }}>
                                  <img className="user-avatar" src={m?.profile ? m?.profile : '/img/admin.png'} alt="/img/admin.png" />
                                  {/* <div className="user-avatar">{m?.profile}</div> */}
                                  <span>{m?.username}</span>
                                </div>
                              </td>

                              <td>{m?.department}</td>
                              <td>{m?.branch}</td>
                              <td>{formatDate(m.createdAt)}</td>
                              <td>
                                <div className="flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() => handleEditUser(m._id, 'Executive')}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-error"
                                    onClick={() => confirmDeleteUser(m._id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr >
                          }
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-muted">No managers found. Add a new executive to get started!</p>
                </div>
              )}
            </div>
          </div>
        </>
      )
      }
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
        <h2 className="text-xl font-bold">All Tickets</h2>
        <p className="text-muted">Manage tickets in {branch?.name || 'your organization'}</p>
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
          await fetchAllManagers();
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
                    <th>Branch</th>
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
                      <tr key={ticket?._id}>
                        <td style={{ textAlign: 'center' }}>{ticket?.branch}</td>

                        {/* <td style={{ textAlign: 'center' }}>{formatDate(ticket?.createdAt)}</td> */}
                        <td style={{ textAlign: 'center' }}>{ticket?.subject}</td>
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
                        <td style={{ textAlign: 'center' }}>{ticket?.branch}</td>

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
                        <td style={{ textAlign: 'center' }}>{ticket?.branch}</td>

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
      </div>
    </>
  );

  const renderPasswordRequestsView = () => (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Password Update Requests</h2>
        <p className="text-muted">Manage password change requests from team leaders and managers</p>
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
                onCancel={() => {
                  setselectedUser(null);
                  setUserRole('');
                  setShowUserForm(false);
                }}
                designation={userRole}
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
                      <th>Branch</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPasswordRequests?.map((request, index) => {
                      return (
                        <>
                          <tr key={request?.id}>
                            <td>#{index + 1}</td>
                            <td>

                              <div className="flex items-center gap-2">
                                <img src={request?.profile ? request?.profile : '/img/admin.png'} className='user-avatar' alt="/img/admin.png" />
                                <span>{request?.username}</span>
                              </div>

                            </td>
                            <td>
                              {request?.designation}
                            </td>
                            <td>{request?.branch}</td>

                            <td>
                              {/* {request?.status === 'pending' ? ( */}
                              <div className="flex gap-2" style={{ justifyContent: 'center' }}>
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleEditUser(request?._id, request?.designation)}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button
                                  className="btn btn-sm btn-error"
                                  onClick={() => deleteUpdateRequest(request?._id)}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </div>

                            </td>
                          </tr>

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
        )}
      </div>
    </>
  );

  const renderUserRequestsView = () => (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-bold">User Requests</h2>
        <p className="text-muted">Manage requests from team leaders and managers</p>
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
                          request.status === 'pending' && request?.designation === 'Manager' &&
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
                                            <button
                                              className="btn btn-sm btn-error"
                                              onClick={() => deleteUserEditRequest(request?._id)}
                                            >
                                              Delete
                                            </button>
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
                          request.status === 'pending' && (request?.designation === 'Team Leader' || request?.designation === 'Executive') &&
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
                                            <button
                                              className="btn btn-sm btn-error"
                                              onClick={() => deleteUserEditRequest(request?._id)}
                                            >
                                              Delete
                                            </button>
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
                                            <button
                                              className="btn btn-sm btn-error"
                                              onClick={() => deleteUserEditRequest(request?._id)}
                                            >
                                              Delete
                                            </button>
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
                      deleteType === 'user' ? itemToDelete.name : itemToDelete.name
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
                    onClick={deleteType === 'user' ? confirmDeleteUser : handleDeleteDepartment}
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
                          selectedTicket?.priority === 'medium' ? 'badge-warning' : 'badge-primary'}`}
                          style={{ background: ticketSettings?.priorities?.find(p => p?.name === selectedTicket?.priority)?.color }}
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

export default AdminPanel;