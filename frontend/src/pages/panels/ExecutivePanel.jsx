import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import mockTickets from '../../data/mockTickets';
import mockPasswordRequests from '../../data/mockPasswordRequests';
import TicketForm from '../../components/TicketForm';
import axios from 'axios';
import URI from '../../utills';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots } from '@fortawesome/free-regular-svg-icons';
import SessionEndWarning from '../../components/SessionEndWarning';
import ReportBar from '../../components/ReportBar';
import TicketCard from '../../components/TicketCard';
import { useDispatch, useSelector } from 'react-redux';
import { setSessionWarning } from '../../Redux/userSlice';

function ExecutivePanel({ user, view = 'tickets' }) {
  const [tickets, setTickets] = useState([]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showPriorityUpdate, setShowPriorityUpdate] = useState(false);
  const [newPriority, setNewPriority] = useState('');
  const [reAssignto, setReAssignto] = useState({
    name: '',
    description: '',
    users: []
  });
  const [department, setDepartment] = useState(null);
  const [comment, setComment] = useState('');
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [reAssignDiv, setReAssignDiv] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState();

  const dispatch = useDispatch();
  const { sessionWarning } = useSelector(store => store.user);

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

  const fetchAllTickets = async () => {
    try {
      const res = await axios.get(`${URI}/executive/getalltickets`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      const filtered = res?.data?.data?.filter(ticket =>
        ticket?.issuedby === `${user?.username}${user?.department ? ` - ${user.department}` : ''} (${user?.designation})` ||
        ticket?.department?.some(dept => dept?.users?.includes(user?.username))
      );
      setTickets(filtered);
    } catch (err) {
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
    };
  };
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

  useEffect(() => {
    fetchAllTickets();
    fetchDepartment();
    fetchAllUsers();
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

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket?.status === filterStatus;
    const matchesSearch = ticket?.subject?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      ticket?.name?.toLowerCase().includes(searchTerm?.toLowerCase())
    return matchesStatus && matchesSearch;
  });

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
        toast.error('Plese fill the Comment Box!');
      }
    } catch (error) {
      console.log('error while adding comment', error);
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
            dispatch(setSessionWarning(true));
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

  const [executives, setExecutives] = useState();

  //fetch users
  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${URI}/admin/executives`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        setExecutives(res?.data?.allBranchesData?.filter((exec) => exec?.branch === user?.branch));
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

  return (
    <div className="animate-fade">
      {sessionWarning && <SessionEndWarning />}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Tickets</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowTicketForm(true)}
        >
          Create New Ticket
        </button>
      </div>

      <ReportBar
        reportData={tickets}
        fetchData={async () => {
          // await fetchBranches();
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
              fetchAllTickets={fetchAllTickets}
              onCancel={() => setShowTicketForm(false)}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="card">
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
          <br />
          <div className="card">
            <h2 className="text-xl font-bold">Tickets on You</h2>
            <div className="card-body p-0">
              {filteredTickets?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        {/* <th>ID</th> */}
                        <th>Ticket Id</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>T.A.T.</th>
                        <th>Subject</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets?.map((ticket, index) => (
                        ticket?.department?.some(dep => dep?.users?.includes(user?.username)) &&

                        <>
                          {
                            ticket?.status === 'in-progress' &&
                            <tr key={ticket?.id}>
                              {/* <td>#{index + 1}</td> */}
                              <td style={{ textAlign: 'center' }}>{ticket?.ticketId}</td>
                              <td>{ticket?.name}</td>
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
                                <span className={`badge ${ticket?.status === 'open' ? 'badge-warning' :
                                  ticket?.status === 'in-progress' ? 'badge-primary' :
                                    'badge-success'
                                  }`} style={{ background: ticket?.tat && tatBG(ticket?.tat, ticket?.createdAt) }}>
                                  {ticket?.tat && formatTat(ticket?.tat, ticket?.createdAt)}
                                </span>
                              </td>
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
                              <td >
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
                          }
                        </>

                      ))}
                      {filteredTickets?.map((ticket, index) => (
                        ticket?.department?.some(dep => dep?.users?.includes(user?.username)) &&
                        <>
                          {
                            ticket?.status === 'open' &&
                            <tr key={ticket?.id}>
                              {/* <td>#{index + 1}</td> */}
                              <td style={{ textAlign: 'center' }}>{ticket?.ticketId}</td>
                              <td>{ticket?.name}</td>

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
                                <span className={`badge ${ticket?.status === 'open' ? 'badge-warning' :
                                  ticket?.status === 'in-progress' ? 'badge-primary' :
                                    'badge-success'
                                  }`} style={{ background: ticket?.tat && tatBG(ticket?.tat, ticket?.createdAt) }}>
                                  {ticket?.tat && formatTat(ticket?.tat, ticket?.createdAt)}
                                </span>
                              </td>
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
                              <td >
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
                          }
                        </>

                      ))}
                      {filteredTickets?.map((ticket, index) => (
                        ticket?.department?.some(dep => dep.users?.includes(user?.username)) &&
                        <>
                          {
                            ticket?.status === 'resolved' &&
                            <tr key={ticket?.id}>
                              {/* <td>#{index + 1}</td> */}
                              <td style={{ textAlign: 'center' }}>{ticket?.ticketId}</td>
                              <td>{ticket?.name}</td>

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
                                <span className={`badge ${ticket?.status === 'open' ? 'badge-warning' :
                                  ticket?.status === 'in-progress' ? 'badge-primary' :
                                    'badge-success'
                                  }`} style={{ background: ticket?.tat && tatBG(ticket?.tat, ticket?.createdAt) }}>
                                  {ticket?.tat && formatTat(ticket?.tat, ticket?.createdAt)}
                                </span>
                              </td>
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
                              <td >
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
                          }
                        </>

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
            allUsers={executives}
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
                  <h3 className="modal-title">Ticket #{selectedTicket?._id}</h3>
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
                    
                    {
                      selectedTicket?.issuedby !== user?.username ?
                        <>
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
                        </> :
                        <>
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
                        </>
                    }

                  </section>
                  <hr />
                  Section 4: Comment
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
        // <div className="modal-backdrop" onClick={handleCloseModal}>
        //   <div className="modal">
        //     <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        //       <div className="modal-content">
        //         {/* Header */}
        //         <div className="modal-header">
        //           <h3 className="modal-title">Ticket #{selectedTicket?.id}</h3>
        //           <button className="modal-close" onClick={handleCloseModal}>×</button>
        //         </div>

        //         <div className="modal-body space-y-6">
        //           {/* Section 1: Ticket Info */}
        //           <section className="space-y-2 border-b pb-4">
        //             <h6 style={{ float: 'left', display: 'flex', gap: '5px' }}>
        //               Issued by: <h5>{selectedTicket?.issuedby === user?.username ? 'You' : selectedTicket?.issuedby}</h5>
        //             </h6>
        //             <br />
        //             <h4 style={{ display: 'flex', justifyContent: 'center' }} className="text-lg font-bold">
        //               {selectedTicket?.category} - <h5>{selectedTicket?.subject}</h5>
        //             </h4>
        //             <div className="flex gap-3 flex-wrap" style={{ justifyContent: 'space-between' }}>
        //               <div className="flex gap-3 flex-wrap">
        //                 <span className={`badge ${
        //                   selectedTicket?.status === 'open' ? 'badge-warning' :
        //                   selectedTicket?.status === 'in-progress' ? 'badge-primary' :
        //                   'badge-success'
        //                 }`}>
        //                   {selectedTicket?.status === 'in-progress' ? 'In Progress' :
        //                    selectedTicket?.status?.charAt(0).toUpperCase() + selectedTicket?.status?.slice(1)}
        //                 </span>
        //                 <span className={`badge ${
        //                   selectedTicket?.priority === 'high' ? 'badge-error' :
        //                   selectedTicket?.priority === 'medium' ? 'badge-warning' :
        //                   'badge-primary'
        //                 }`}>
        //                   {selectedTicket?.priority?.charAt(0).toUpperCase() + selectedTicket?.priority?.slice(1)}
        //                 </span>
        //                 <span className={`badge`} 
        //                   style={{ background: selectedTicket?.tat && tatBG(selectedTicket?.tat, selectedTicket?.createdAt) }}>
        //                   {selectedTicket?.tat && formatTat(selectedTicket?.tat, selectedTicket?.createdAt)}
        //                 </span>
        //               </div>
        //               <span className="text-sm text-muted">
        //                 {formatDate(selectedTicket?.createdAt)} , {formatTime(selectedTicket?.createdAt)}
        //               </span>
        //             </div>
        //           </section>
        //           <hr />

        //           {/* Section 2: User Info */}
        //           <section className="space-y-2 border-b pb-4">
        //             <h5 className="font-semibold">User Information</h5>
        //             <div className="flex gap-4 flex-wrap text-sm" style={{ justifyContent: 'center' }}>
        //               <span><strong>Name:</strong> {selectedTicket?.name}</span>
        //               <span><strong>Mobile:</strong> {selectedTicket?.mobile}</span>
        //             </div>
        //           </section>
        //           <hr />

        //           {/* Section 3: Department Info */}
        //           <section className="space-y-4 border-b pb-4">
        //             <h5 className="font-semibold">Departments</h5>
        //             <div style={{ display: 'flex', gap: '5px' }}>
        //               <span className="font-bold">
        //                 {myDept?.name}{myDept?.description && ':'}
        //               </span>
        //               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
        //                 {myDept?.users?.map((user, index) => (
        //                   <span key={index}>{user}</span>
        //                 ))}
        //               </div>
        //             </div>
        //             <p className="text-sm" style={{ wordBreak: 'break-word' }}>{myDept?.description}</p>
        //           </section>
        //           <hr />

        //           {/* Section 4: Comments */}
        //           {selectedTicket?.comments?.length > 0 && (
        //             <button
        //               className="notification-btn"
        //               aria-label="Notifications"
        //               style={{ float: 'right' }}
        //               onClick={() => setIsCommentOpen(!isCommentOpen)}
        //             >
        //               <FontAwesomeIcon icon={faCommentDots} />
        //               <span className="notification-badge">{selectedTicket?.comments?.length}</span>
        //             </button>
        //           )}

        //           {isCommentOpen && (
        //             <>
        //               <section className="space-y-3 border-b pb-4">
        //                 <h5 className="font-semibold">Comments ({selectedTicket?.comments?.length})</h5>
        //                 {selectedTicket?.comments?.length > 0 ? (
        //                   <div className="space-y-2">
        //                     {selectedTicket?.comments?.map((comment, index) => (
        //                       <div key={index} className="p-2 bg-gray-100 rounded">
        //                         <p className="text-sm" style={{ wordBreak: 'break-word' }}>{comment?.content}</p>
        //                         <p className="text-xs text-muted">
        //                           {comment?.commenter} - {formatDate(comment?.createdAt)}
        //                         </p>
        //                       </div>
        //                     ))}
        //                   </div>
        //                 ) : (
        //                   <p className="text-muted">No comments yet.</p>
        //                 )}
        //               </section>
        //               <hr />
        //             </>
        //           )}

        //           {/* Section 5: Add Comment */}
        //           <section className="space-y-2">
        //             <label htmlFor="comment" className="form-label font-semibold">Add Comment</label>
        //             <textarea
        //               id="comment"
        //               className="form-control"
        //               rows="3"
        //               placeholder="Add your comment..."
        //               value={comment}
        //               onChange={(e) => setComment(e.target.value)}
        //             ></textarea>
        //           </section>
        //         </div>

        //         {/* Footer */}
        //         <div className="modal-footer">
        //           <button className="btn btn-outline" onClick={handleCloseModal}>Close</button>
        //           <button className="btn btn-primary" onClick={addCommentOnTicket}>Add Comment</button>
        //         </div>
        //       </div>
        //     </div>
        //   </div>
        // </div>
      )
      }
    </div >
  );
}

export default ExecutivePanel;