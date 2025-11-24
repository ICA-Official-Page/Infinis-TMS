import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import URI from '../utills';
import toast from 'react-hot-toast';
import SessionEndWarning from './SessionEndWarning';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import CropperModal from './CropperModal';
import { setSessionWarning } from '../Redux/userSlice';

function UserForm({ designation, onCancel, initialData = null, fetchAllUsers, passReq, deleteUpdateRequest }) {

  const { sessionWarning, user } = useSelector(store => store.user);

  const [formData, setFormData] = useState({
    username: initialData?.username || '',
    password: initialData?.password || '',
    cpassword: initialData?.cpassword || '',
    email: initialData?.email || '',
    mobile: initialData?.mobile || '',
    address: initialData?.address || '',
    department: initialData?.department || user?.department || '',
    branches: [],
    branch: initialData?.branch || user?.branch || '',
    name: initialData?.name || '',
    postdesignation: initialData?.postdesignation || ''
  });
  const [profile, setProfile] = useState(null);
  const [croppedProfile, setCroppedProfile] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile(file);
      setShowCropper(true);
    }
  };
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [managers, setManagers] = useState([]);

  const [branches, setBranches] = useState([]);
  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${URI}/superadmin/branches`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        setBranches(res?.data?.branches)
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

  const [departments, setDepartments] = useState([]);
  const fetchDepartment = async () => {
    try {
      const res = await axios.get(`${URI}/admin/department`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        setDepartments(res?.data?.departmentes);
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

  //fetch managers
  const fetchAllManagers = async () => {
    try {
      const res = await axios.get(`${URI}/admin/managers`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        const matchedExecutives = res?.data?.allBranchesData?.filter((executive) =>
          user?.branches.includes(executive?.branch)
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

  useEffect(() => {
    fetchBranches();
    fetchDepartment();
    if (user?.designation === 'admin') {
      fetchAllManagers();
    }
  }, []);

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

  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    setFormData(prevFormData => {
      const currentBranches = prevFormData.branches || [];

      if (isChecked) {
        return {
          ...prevFormData,
          branches: [...currentBranches, value]
        };
      } else {
        return {
          ...prevFormData,
          branches: currentBranches.filter(val => val !== value)
        };
      }
    });


  };

  const passValidation = () => {
    if (!formData?.username || !formData?.email || !formData?.password || !formData?.cpassword || !formData?.mobile || !formData?.address || !formData?.postdesignation) {
      toast.error('Please fill out all Fields!')
      return false;
    }
    else if (formData?.mobile?.length !== 10) {
      toast.error('mobile must be 10 numbers!')
      return false;
    }
    else if (!formData?.password?.length > 6) {
      toast.error('Password must have at least 6 letters!')
      return false;
    }
    else if (designation === 'Manager' && !formData.branch) {
      toast.error('Branch is Required!');
      return false;
    }
    else {
      let hasLetter = false;
      let hasNumber = false;
      for (let i = 0; i < formData?.password?.length; i++) {
        let char = formData?.password[i];
        if (char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z') {
          hasLetter = true;
        }
        if (char >= '0' && char <= '9') {
          hasNumber = true
        }
      }
      if (hasLetter && hasNumber) {
        if (formData?.password === formData?.cpassword)
          return true
        else
          toast.error('Passwords does not match!')
      }
      else {
        toast.error('Password have at least 1 character and 1 number!');
        return false
      }
    }
  }

  const updationValidation = () => {
    if (formData?.mobile && formData?.mobile?.length !== 10) {
      toast.error('mobile must be 10 numbers!')
      return false;
    }
    if (formData?.password) {
      if (!formData?.password?.length > 6) {
        toast.error('Password must have at least 6 letters!')
        return false;
      }
      else {
        let hasLetter = false;
        let hasNumber = false;
        for (let i = 0; i < formData?.password?.length; i++) {
          let char = formData?.password[i];
          if (char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z') {
            hasLetter = true;
          }
          if (char >= '0' && char <= '9') {
            hasNumber = true
          }
        }
        if (hasLetter && hasNumber) {
          if (formData?.password === formData?.cpassword)
            return true
          else
            toast.error('Passwords does not match!')
        }
        else {
          toast.error('Password have at least 1 character and 1 number!');
          return false
        }
      }
    }
    else {
      return true;
    }
  }

  const makeUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let validation = passValidation();

      if (validation) {

        const formdata = new FormData();
        formdata.append('username', formData?.username);
        formdata.append('email', formData?.email);
        formdata.append('name', formData?.name);
        formdata.append('password', formData?.password);
        formdata.append('mobile', formData?.mobile);
        formdata.append('address', formData?.address);
        formdata.append('profile', croppedProfile);
        formdata.append('designation', designation);
        formdata.append('postdesignation', formData?.postdesignation);

        if (designation === 'Team Leader' || designation === 'Executive') {
          formdata.append('department', formData?.department);
        }

        if (designation === 'admin') {
          formData?.branches.forEach(branch => {
            formdata.append('branches', branch);
          });
          const res = await axios.post(`${URI}/superadmin/makeadmin`, formdata, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
          }).then(async (res) => {
            fetchAllUsers();
            onCancel();
            setFormData({
              username: '',
              email: '',
              name: '',
              password: '',
              cpassword: '',
              mobile: null,
              department: '',
              address: '',
              postdesignation: '',

            });
            setProfile(null);
            setCroppedProfile(null);
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


        if (designation === 'Manager' || designation === 'Executive' || designation === 'Team Leader') {
          formdata.append('branch', formData?.branch || user?.branch);
          const res = await axios.post(`${URI}/admin/adduser`, formdata, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
          }).then(async res => {
            if (designation === 'Executive' || designation === 'Team Leader') {
              const notificationRes = await axios.post(`${URI}/notification/pushnotification`, { user: user?._id, branch: formData?.branch || user?.branch, section: 'users', designation: designation, department: formData?.department },
                {
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              )
            }
            fetchAllUsers();
            onCancel();
            setFormData({
              username: '',
              email: '',
              name: '',
              password: '',
              cpassword: '',
              mobile: null,
              branch: '',
              address: '',
              postdesignation: '',

            });
            setProfile(null);
            setCroppedProfile(null);
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

      }
    } catch (error) {
      console.log("while make an admin", error);
    }
    finally {
      setLoading(false);
    }
  }

  const updateUser = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();

      let validation = updationValidation();

      if (validation) {

        const formdata = new FormData();
        formdata.append('username', formData?.username);
        formdata.append('email', formData?.email);
        formdata.append('name', formData?.name);
        formdata.append('password', formData?.password);
        formdata.append('mobile', formData?.mobile);
        formdata.append('address', formData?.address);
        formdata.append('profile', croppedProfile);
        formdata.append('designation', designation);
        formdata.append('postdesignation', formData?.postdesignation);
        formdata.append('branches', formData?.branches);
        formdata.append('department', formData?.department);
        formdata.append('branch', formData?.branch);
        formdata.append('userid', initialData?._id);

        const res = await axios.post(`${URI}/admin/updateuser`, formdata, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }).then(async res => {
          if (designation === 'Executive' || designation === 'Team Leader') {
            const notificationRes = await axios.post(`${URI}/notification/pushnotification`, { user: user?._id, branch: formData?.branch || user?.branch, section: 'users', designation: designation, department: formData?.department },
              {
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            )
          }

          fetchAllUsers();
          onCancel();
          setFormData({
            username: '',
            email: '',
            name: '',
            password: '',
            cpassword: '',
            mobile: null,
            department: '',
            address: '',
            postdesignation: '',
            profile: null,
            croppedProfile: null
          });
          setProfile(null);
          toast.success(res?.data?.message);
          if (passReq) {
            deleteUpdateRequest(initialData?._id);
            onCancel();
          }
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
    } catch (error) {
      console.log("while updating user");
    }
    finally {
      setLoading(false);
    }
  }


  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const [showcPassword, setShowcPassword] = useState(false);

  const togglecPassword = () => {
    setShowcPassword((prev) => !prev);
  };

  return (
    <>
      {sessionWarning && <SessionEndWarning />}
      <form className='form'>
        <div className="form-group">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            className={`form-control ${errors.name ? 'border-error' : ''}`}
            value={formData?.username}
            onChange={handleChange}
            placeholder="Enter Username"
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
            value={formData?.email}
            onChange={handleChange}
            placeholder="Enter email address"
          />
          {errors?.email && <div className="text-error text-sm mt-1">{errors?.email}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="name" className="form-label">Enter Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className={`form-control ${errors.name ? 'border-error' : ''}`}
            value={formData?.name}
            onChange={handleChange}
            placeholder="Enter Full Name"
          />
          {errors?.name && <div className="text-error text-sm mt-1">{errors?.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="mobile" className="form-label">Mobile Number</label>
          <div className="flex" style={{ width: '100%' }}>
            <span className="px-3 py-2 bg-gray-200 border border-r-0 rounded-l">+91</span>
            <input
              type="number"
              id="mobile"
              name="mobile"
              className={`form-control ${errors?.mobile ? 'border-error' : ''}`}
              value={formData?.mobile}
              onChange={handleChange}
              placeholder="Enter mobile number"
            />
          </div>

          {errors?.name && <div className="text-error text-sm mt-1">{errors?.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <div style={styles.container}  >
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className={`form-control ${errors?.name ? 'border-error' : ''}`}
              value={formData?.password}
              onChange={handleChange}
              placeholder="Enter Password"
            />
            <span onClick={togglePassword} style={styles.icon}>
              {formData?.password ? showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} /> : ''}
            </span>
          </div>
          {errors.name && <div className="text-error text-sm mt-1">{errors.name}</div>}
        </div>



        <div className="form-group">
          <label htmlFor="cpassword" className="form-label">Confirm Password</label>
          <div style={styles.container}>
            <input
              type={showcPassword ? "text" : "password"}
              id="cpassword"
              name="cpassword"
              className={`form-control ${formData.cpassword && formData.password !== formData.cpassword ? 'border-error' : ''}`}
              value={formData?.cpassword}
              onChange={handleChange}
              placeholder="Confirm Password"
            />
            <span onClick={togglecPassword} style={styles.icon}>
              {formData?.cpassword ? showcPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} /> : ''}
            </span>
          </div>

          {/* ✅ Show mismatch warning */}
          {formData.cpassword && formData.password !== formData.cpassword && (
            <div className="text-error text-sm mt-1">Passwords do not match</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="postdesignation" className="form-label">User Designation</label>
          <input
            type="text"
            id="postdesignation"
            name="postdesignation"
            className={`form-control ${errors.postdesignation ? 'border-error' : ''}`}
            value={formData?.postdesignation}
            onChange={handleChange}
            placeholder="User's Designation in Organization"
          />
          {errors?.postdesignation && <div className="text-error text-sm mt-1">{errors?.postdesignation}</div>}
        </div>

        {
          user?.designation === 'superadmin' &&
          <div className="form-group">
            <label htmlFor="branch" className="form-label">Branch</label>
            {
              (branches && branches.length > 0) ? (
                (() => {
                  const notAssignedBranches = branches.find(br => br.admin === '' || !br?.admin);
                  if (!notAssignedBranches) {
                    return <p>No branches to Assign!</p>;
                  }
                  return (
                    <div className='deptcheckbox'>
                      {
                        branches.map((curElem) => (
                          (curElem?.admin === '' || !curElem?.admin) && (
                            <p key={curElem._id}>
                              {curElem?.name}
                              <input
                                type="checkbox"
                                value={curElem?.name}
                                onChange={handleCheckboxChange}
                                name='department'
                              />
                            </p>
                          )
                        ))
                      }
                    </div>
                  );
                })()
              ) : (
                <p>No branches to Assign!</p>
              )
            }


            {errors?.branch && <div className="text-error text-sm mt-1">{errors?.branch}</div>}
          </div>
        }

        <div className="form-group">
          <label htmlFor="address" className="form-label">Enter Address</label>
          <input
            type="text"
            id="address"
            name="address"
            className={`form-control ${errors?.email ? 'border-error' : ''}`}
            value={formData?.address}
            onChange={handleChange}
            placeholder="Enter address"
          />
          {errors.email && <div className="text-error text-sm mt-1">{errors.email}</div>}
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
          {/* {croppedProfile && (
            <img src={URL.createObjectURL(croppedProfile)} alt="Cropped Preview" width="100" height="100" />
          )} */}

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

        {
          user?.designation === 'admin' &&
          <div className="form-group">
            <label htmlFor="branch" className="form-label">Branch</label>
            <select value={formData?.branch ? formData?.branch : initialData?.branch} onChange={handleChange} name="branch" id="branch" className={`form-control ${errors.branch ? 'border-error' : ''}`}>
              <option value="" disabled selected>--Branch--</option>
              {
                user?.branches?.map((curElem) => {
                  const isBranchAssigned = managers.some((man) => man.branch === curElem);

                  if (!isBranchAssigned || designation !== 'Manager') {
                    return (
                      <option key={curElem} value={curElem}>
                        {curElem}
                      </option>
                    );
                  }
                  return null;
                })
              }

            </select>
            {errors.email && <div className="text-error text-sm mt-1">{errors.email}</div>}
          </div>
        }
        {
          user?.designation !== 'Team Leader' &&
          <>
            {
              (designation === 'Executive' || designation === 'Team Leader') &&
              <div className="form-group">
                <label htmlFor="department" className="form-label">Department</label>
                <select value={formData?.department ? formData?.department : initialData?.department} onChange={handleChange} name="department" id="department" className={`form-control ${errors.branch ? 'border-error' : ''}`}>
                  <option value="" disabled selected>--Department--</option>
                  {
                    departments?.map((curElem) => (
                      curElem?.branch === formData?.branch &&
                        (designation === 'Executive' || (initialData || !curElem?.teamleader)) ? (
                        <option key={curElem?.name} value={curElem?.name}>
                          {curElem?.name}
                        </option>
                      ) : null
                    ))
                  }
                </select>
                {errors.email && <div className="text-error text-sm mt-1">{errors.email}</div>}
              </div>
            }
          </>
        } <br />


        <div className="flex gap-2 justify-end mt-4">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
          >
            Cancel
          </button>
          {
            loading ? <button className="btn btn-primary">
              <img src="/img/loader.png" className='Loader' alt="loader" />
            </button>
              :
              <button
                type="submit"
                className="btn btn-primary"
                onClick={initialData ? updateUser : makeUser}
              >
                {initialData ? 'Update Now' : 'Create Now'}
              </button>
          }
        </div>
      </form >
    </>
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


export default UserForm;