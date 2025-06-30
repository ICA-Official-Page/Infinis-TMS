import { useEffect, useState } from 'react';
import mockPasswordRequests from '../data/mockPasswordRequests';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import URI from '../utills'
import toast from 'react-hot-toast';
import SessionEndWarning from '../components/SessionEndWarning';
import { setSessionWarning, setUser } from '../Redux/userSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import CropperModal from '../components/CropperModal';

function UserProfile() {

  const { sessionWarning, user } = useSelector(store => store.user);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username,
    name: user?.name,
    email: user?.email,
    mobile: user?.mobile
  });
  const [profile, setProfile] = useState(null);
  const [croppedProfile, setCroppedProfile] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile(file);
      setShowCropper(true);
    }
  };

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const [userRequest, setUserRequest] = useState([]);
  const [loadingC, setLoadingC] = useState(false);
  const [loadingCS, setLoadingCS] = useState(false);
  const [loadingE, setLoadingE] = useState(false);
  const [loadingES, setLoadingES] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData?.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData?.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData?.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData?.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData?.newPassword !== passwordData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const statusUpdateforUserRequest = async (requestId, status) => {
    try {
      const res = await axios.post(`${URI}/auth/statusupdateforuserrequest`, { requestId, status }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(r => {
        fetchEditProfileRequest();
        // toast.success(r?.data?.message);
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
  }

  const updateUser = async (e) => {
    try {
      e.preventDefault();
      setLoadingCS(true);
      setLoadingES(true);
      const formdata = new FormData();
      formdata.append('username', formData?.username);
      formdata.append('email', formData?.email);
      formdata.append('name', formData?.name);
      // formdata.append('password', formData?.password);
      formdata.append('mobile', formData?.mobile);
      // formdata.append('address', formData?.address);
      formdata.append('profile', profile);
      formdata.append('designation', user?.designation);

      // formdata.append('branches', formData?.branches);
      // formdata.append('department', formData?.department);
      // formdata.append('branch', formData?.branch);
      formdata.append('userid', user?._id);

      const activeRequest = userRequest.find(r => r.status === 'allow');

      const res = await axios.post(`${URI}/admin/updateuser`, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      }).then(async (res) => {
        // fetchAllUsers();
        if (!user?.designation?.includes('admin')) {
          await statusUpdateforUserRequest(activeRequest?._id, 'expired');
        }
        dispatch(setUser({
          ...user,
          username: formData?.username,
          name: formData?.name,
          email: formData?.email,
          mobile: formData?.mobile,
          // profile: formdata?.profile
        }))
        setFormData({
          username: '',
          email: '',
          name: '',
          password: '',
          cpassword: '',
          mobile: null,
          department: '',
          address: ''
        });

        setProfile(null);
        setIsEditing(false);
        cancelEdit();
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
      console.log("while updating user");
    }
    finally {
      setLoadingCS(false);
      setLoadingES(false);
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (validatePasswordForm()) {
      // In a real app, this would submit a password request

      // Create new password request
      const newRequest = {
        id: user?._id,
        currentPassword: passwordData?.currentPassword,
        newPassword: passwordData?.newPassword
      };

      const activeRequest = userRequest.find(r => r.status === 'allow');

      const res = await axios.post(`${URI}/auth/updatepassword`, newRequest, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(async (r) => {
        if (!user?.designation?.includes('admin')) {
          await statusUpdateforUserRequest(activeRequest?._id, 'expired');
        }
        setShowPasswordForm(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
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

    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      username: user?.username,
      name: user?.name,
      email: user?.email,
      mobile: user?.mobile
    });
    setErrors({});
  };

  const cancelPasswordChange = () => {

    setShowPasswordForm(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fetchEditProfileRequest = async () => {
    try {
      const res = await axios.get(`${URI}/auth/getupdateprofilerequests`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(r => {
        setUserRequest(r?.data?.requests?.filter((req) => req?.email === user?.email));
        // console.log('userid=', user?.email, 'requestId=', r?.data?.requests);
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
    fetchEditProfileRequest();

  }, []);

  const ReqToEditProfile = async (reqto, status) => {
    try {
      if (reqto === 'Change Password') {
        setLoadingC(true);
      }
      else {
        setLoadingE(true);
      }
      const data = {
        username: user?.username,
        email: user?.email,
        mobile: user?.mobile,
        branch: user?.branch,
        department: user?.department,
        address: user?.address,
        profile: user?.profile,
        designation: user?.designation,
        reqto: reqto,
        status: status
      }
      const res = await axios.post(`${URI}/auth/reqforupdateprofile`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(async r => {

        const notificationRes = await axios.post(`${URI}/notification/pushnotification`, { user: user?._id, branch: user?.branch, section: 'userreq', department: user?.department, designation: user?.designation },
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
      console.log('while requesting for edit profile', error);
    }
    finally {
      if (reqto === 'Change Password') {
        setLoadingC(false);
      }
      else {
        setLoadingE(false);
      }
    }
  }

  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const [shownPassword, setShownPassword] = useState(false);

  const togglenPassword = () => {
    setShownPassword((prev) => !prev);
  };

  const [showcPassword, setShowcPassword] = useState(false);

  const togglecPassword = () => {
    setShowcPassword((prev) => !prev);
  };


  return (
    <div className="animate-fade">
      {sessionWarning && <SessionEndWarning />}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">User Profile</h2>
      </div>

      <div className="grid grid-2 gap-4">
        {/* Profile Information */}
        <div className="card">

          <div className="card-body">
            <div className="flex items-center justify-center mb-4">

              <img
                className="user-avatar" style={{
                  width: '80px',
                  height: '80px',
                  fontSize: '2rem',
                  backgroundColor: 'var(--color-primary)'
                }}
                src={user?.profile ? user?.profile : '/img/admin.png'} alt="/img/admin.png" />

            </div>

            <div className="text-center mb-4">
              <h3 className="text-xl font-bold">{user?.username} {user?.name ? <>({user?.name})</> : ''}</h3>
              {/* {
                  user?.name!=="" && <p className="text-muted">{user?.name}</p>
                } */}
              <p className="text-muted">{user?.email}</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-2 gap-3">
                <div>
                  <p className="text-sm text-muted">Role</p>
                  <p className="font-medium">
                    {user?.designation?.charAt(0).toUpperCase() + user?.designation?.slice(1)}
                  </p>
                </div>
                {user?.department && (
                  <div>
                    <p className="text-sm text-muted">Department</p>
                    <p className="font-medium">{user?.department}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted">Joined Date</p>
                  <p className="font-medium">{formatDate(user?.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Address</p>
                  <p className="font-medium">
                    {user?.address}
                  </p>
                </div>
                {
                  user?.postdesignation && (
                    <div>
                      <p className="text-sm text-muted">Designation</p>
                      <p className="font-medium">{user?.postdesignation}</p>
                    </div>
                  )
                }
                {user?.branch && (
                  <div>
                    <p className="text-sm text-muted">Branch</p>
                    <p className="font-medium">{user?.branch}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted">Mobile Number</p>
                  <p className="font-medium"><span className="px-3 py-2 bg-gray-200 border border-r-0 rounded-l">+91 {user?.mobile}</span></p>
                </div>
                {user?.branches && (
                  <div>
                    <p className="font-medium">Your Branches</p>
                    {
                      user?.branches.length > 0 ?
                        <div style={{ display: 'flex', justifyContent: 'space-evenly', marginLeft: '20%', width: '100%' }}>
                          {
                            user?.branches?.map((curElem, index) => (
                              <p className="text-sm text-muted">{index + 1}. {curElem}</p>
                            ))
                          }
                        </div> : 'No Branches Assigned Yet!'
                    }


                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Additional Information */}
        <div className="card">
          {isEditing ? (
            <div className="card-body">
              <h3 className="mb-3">Edit Profile</h3>
              <form onSubmit={updateUser}>
                {
                  user?.designation === 'superadmin' &&
                  <div className="form-group">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className={`form-control ${errors.name ? 'border-error' : ''}`}
                      value={formData?.username}
                      onChange={handleChange}
                    />
                    {errors.username && <div className="text-error text-sm mt-1">{errors.username}</div>}
                  </div>
                }
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`form-control ${errors.name ? 'border-error' : ''}`}
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <div className="text-error text-sm mt-1">{errors.name}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-control ${errors.email ? 'border-error' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <div className="text-error text-sm mt-1">{errors.email}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="mobile" className="form-label">Mobile Number</label>
                  <input
                    type="number"
                    id="mobile"
                    name="mobile"
                    className={`form-control ${errors.mobile ? 'border-error' : ''}`}
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                  {errors.mobile && <div className="text-error text-sm mt-1">{errors.mobile}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="" className="form-label">Profile Picture</label>
                  <label htmlFor="profile" className='form-label' style={{ backgroundColor: 'rgba(35, 225, 232, 0.9)', color: "white", padding: '2%', borderRadius: '12px' }}>{croppedProfile ? croppedProfile.name : profile ? profile.name : 'Upload a Profile Picture'}</label>
                  <input
                    type="file"
                    id="profile"
                    name="profile"
                    style={{ display: 'none' }}
                    className=''
                    // value={profile}
                    onChange={handleFileChange}
                    placeholder="Enter full name"
                  />
                  {showCropper && (
                    <CropperModal
                      image={profile}
                      onCropDone={(croppedImage) => {
                        setCroppedProfile(croppedImage);
                        setShowCropper(false);
                      }}
                      onClose={() => setShowCropper(false)}
                    />
                  )}
                  {errors.name && <div className="text-error text-sm mt-1">{errors.name}</div>}
                </div>

                <div className="flex gap-2 justify-end mt-4">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                  {
                    loadingES ? <button className="btn btn-primary">
                      <img src="/img/loader.png" className='Loader' alt="loader" />
                    </button>
                      :
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        Save Changes
                      </button>
                  }

                </div>
              </form>
            </div>
          ) : showPasswordForm ? (
            <div className="card-body">
              <h3 className="mb-3">Change Password</h3>
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">Current Password</label>
                  <div style={styles.container}  >
                    <input
                      type={showPassword ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      className={`form-control ${errors.currentPassword ? 'border-error' : ''}`}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                    <span onClick={togglePassword} style={styles.icon}>
                      {passwordData.currentPassword ? showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} /> : ''}
                    </span>
                  </div>
                  {errors.currentPassword && (
                    <div className="text-error text-sm mt-1">{errors.currentPassword}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <div style={styles.container}  >
                    <input
                      type={shownPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      className={`form-control ${errors?.newPassword ? 'border-error' : ''}`}
                      value={passwordData?.newPassword}
                      onChange={handlePasswordChange}
                    />
                    <span onClick={togglenPassword} style={styles.icon}>
                      {passwordData?.newPassword ? shownPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} /> : ''}
                    </span>
                  </div>
                  {errors.newPassword && (
                    <div className="text-error text-sm mt-1">{errors?.newPassword}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                  <div style={styles.container}  >
                    <input
                      type={showcPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`form-control ${errors.confirmPassword ? 'border-error' : ''}`}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                    <span onClick={togglecPassword} style={styles.icon}>
                      {passwordData.confirmPassword ? showcPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} /> : ''}
                    </span>
                  </div>
                  {errors.confirmPassword && (
                    <div className="text-error text-sm mt-1">{errors.confirmPassword}</div>
                  )}
                </div>

                <div className="text-sm text-muted mt-2 mb-4">
                  <p>Password change will be processed according to your role:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Executives: Approved by Team Leaders</li>
                    <li>Team Leaders & Managers: Approved by Admins</li>
                    <li>Admins: Approved by Super Admins</li>
                  </ul>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={cancelPasswordChange}
                  >
                    Cancel
                  </button>
                  {
                    loadingCS ? <button className="btn btn-primary">
                      <img src="/img/loader.png" className='Loader' alt="loader" />
                    </button>
                      :
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        Submit
                      </button>
                  }
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="card-header">
                <h3>About Profile</h3>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <h4 className="text-md font-medium mb-2">Your Role Permissions</h4>
                  <ul className="list list-disc pl-5"  >
                    {user?.designation === 'Executive' && (
                      <>
                        <li> ➕ Create and view your own tickets</li>
                        <li> 📃 Request password changes</li>
                        <li> 🖋️ Update your profile information</li>
                      </>
                    )}
                    {user?.designation === 'Manager' && (
                      <>
                        <li>➕ Create Team Leaders and Executives</li>
                        <li> 📝 Manage departments in your branch</li>
                        <li> 🎗️ Full access to all tickets in your branch</li>
                        <li> 🉑 Approve password requests for Team Leaders and Executives</li>
                      </>
                    )}
                    {user?.designation === 'Team Leader' && (
                      <>
                        <li> ➕ Create, edit, and delete executives</li>
                        <li> 📝 Manage tickets in your department</li>
                        <li> 🉑 Approve password change requests</li>
                        {/* <li>  Assign tickets to team members</li> */}
                      </>
                    )}
                    {user?.designation === 'admin' && (
                      <>
                        <li> ➕ Create Team Leaders,Executives and Managers</li>
                        <li> 📝 Manage departments in your branches</li>
                        <li> 🎗️ Full access to all tickets in your branches</li>
                        <li> 🉑 Approve password requests for Team Leaders and Managers</li>
                      </>
                    )}
                    {user?.designation === 'superadmin' && (
                      <>
                        <li> ➕ Create and manage all branches</li>
                        <li> ➕ Create and manage admin accounts</li>
                        <li> 🎗️ Full system access and override capabilities</li>
                        <li> ⚙️ System-wide configuration and settings</li>
                      </>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="text-md font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-3">
                    {/* <div className="p-2 bg-gray-100 rounded">
                      <p className="text-sm">Logged in from new device</p>
                      <p className="text-xs text-muted">Today, 10:45 AM</p>
                    </div> */}
                    <div className="p-2 bg-gray-100 rounded" style={{ display: 'flex', gap: '10%' }} >
                      <p className=" list text-sm"> ✍️ Profile information updated</p>
                      <span className=" text-xs text-muted">{formatDate(user?.updatedAt)}</span>
                    </div>
                    {/* <div className="p-2 bg-gray-100 rounded">
                      <p className="text-sm">Password changed</p>
                      <p className="text-xs text-muted">Apr 15, 2023</p>
                    </div> */}
                  </div>
                </div>
                {/* work here */}
                <div className="" style={{ display: 'flex', gap: '5px' }}>
                  <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                    {
                      user?.designation?.includes('admin') ?
                        <button
                          className="btn btn-outline"
                          onClick={() => setShowPasswordForm(true)}
                        >
                          Change Password
                        </button> :

                        <>
                          {
                            !userRequest?.some((req) => req.reqto === 'Change Password') ? (
                              <>
                                {
                                  loadingC ? <button className="btn btn-primary">
                                    < img src="/img/loader.png" className='Loader' alt="loader" />
                                  </button>
                                    :
                                    <button
                                      className="btn btn-outline"
                                      onClick={() => ReqToEditProfile('Change Password', 'pending')}
                                    >
                                      <span>Request for Change Password</span>
                                    </button>
                                }
                              </>

                            ) : userRequest?.find((req) => req.reqto === 'Change Password' && req?.status === 'allow') ? (
                              <button
                                className="btn btn-outline"
                                onClick={() => setShowPasswordForm(true)}
                              >
                                Change Password
                              </button>
                            ) : userRequest?.find((req) => req.reqto === 'Change Password' && req?.status === 'pending') ? (
                              <button
                                className="btn btn-outline"
                                disabled
                              >
                                Change Password Request Pending
                              </button>
                            ) :
                              <>
                                {
                                  loadingC ? <button className="btn btn-primary">
                                    < img src="/img/loader.png" className='Loader' alt="loader" />
                                  </button>
                                    :
                                    <button
                                      className="btn btn-outline"
                                      onClick={() => ReqToEditProfile('Change Password', 'pending')}
                                    >
                                      <span>Request for Change Password</span>
                                    </button>
                                }
                              </>
                          }
                        </>
                    }
                  </div>

                  <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                    {
                      user?.designation?.includes('admin') ?
                        <button
                          className="btn btn-primary"
                          onClick={() => setIsEditing(true)}
                        >
                          Edit Profile
                        </button> :
                        <>
                          {
                            !userRequest?.some((req) => req.reqto === 'Edit Profile') ? (
                              <>
                                {
                                  loadingE ? <button className="btn btn-primary">
                                    < img src="/img/loader.png" className='Loader' alt="loader" />
                                  </button>
                                    :
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => ReqToEditProfile('Edit Profile', 'pending')}
                                    >
                                      Request for Edit Profile
                                    </button>
                                }
                              </>
                            ) : userRequest?.find((req) => req.reqto === 'Edit Profile' && req?.status === 'allow') ? (
                              <button
                                className="btn btn-primary"
                                onClick={() => setIsEditing(true)}
                              >
                                Edit Profile
                              </button>
                            ) : userRequest?.find((req) => req.reqto === 'Edit Profile' && req?.status === 'pending') ? (
                              <button
                                className="btn btn-outline"
                                disabled
                              >
                                Edit Profile Request Pending
                              </button>
                            ) :
                              (
                                <>
                                  {
                                    loadingE ? <button className="btn btn-primary">
                                      < img src="/img/loader.png" className='Loader' alt="loader" />
                                    </button>
                                      :
                                      <button
                                        className="btn btn-primary"
                                        onClick={() => ReqToEditProfile('Edit Profile', 'pending')}
                                      >
                                        Request for Edit Profile
                                      </button>
                                  }
                                </>
                              )
                          }
                        </>
                    }
                  </div>
                </div>

              </div>
            </>
          )
          }
        </div >

      </div >

    </div >
  );
}

// Basic inline styling
const styles = {
  container: {
    position: 'relative',
    width: '100%',
    // maxWidth: '300px',
  },
  input: {
    width: '100%',
    padding: '10px 40px 10px 10px',
    border: 'none'
    // fontSize: '16px',
  },
  icon: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#b2b0b0',
    // fontSize: '18px',
  },

};

export default UserProfile;