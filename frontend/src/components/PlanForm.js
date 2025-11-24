import axios from 'axios';
import { useEffect, useState } from 'react';
import URI from '../utills';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import SessionEndWarning from './SessionEndWarning';
import CropperModal from './CropperModal';
import LogoCropperModal from './LogoCropperModal';
import { useDispatch, useSelector } from 'react-redux';
import { setSessionWarning } from '../Redux/userSlice';

function PlanForm({ setIsFormActive, fetchBranches, initialData = null, admins = [] }) {
  const [formData, setFormData] = useState({
    duration: initialData?.duration || '',
    price: initialData?.price || null,
    description: initialData?.description || '',
    benifits: initialData?.benifits || "",
    branch: initialData?.branch || ''
  });

  const { sessionWarning } = useSelector(store => store.user);
  const dispatch = useDispatch();

  const [errors, setErrors] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [croppedProfile, setCroppedProfile] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1);

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setProfile(file);
//       setShowCropper(true);
//     }
//   };

//   //fetch users
//   const fetchAllUsers = async () => {
//     try {
//       const res = await axios.get(`${URI}/superadmin/getadmins`, {
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       }).then(res => {
//         setAllUsers(res?.data?.allBranchesData?.filter((us) => us?.designation !== 'superadmin'));
//       }).catch(err => {
//         // Handle error and show toast
//         if (err.response && err.response.data && err.response.data.message) {
//           toast.error(err.response.data.message); // For 400, 401, etc.
//         } else {
//           toast.error("Something went wrong");
//         }
//       });
//     } catch (error) {
//       console.log("while fetching all Users data", error);
//     }
//   }

//   useEffect(() => {
//     fetchAllUsers();
//   }, []);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.duration.trim()) {
      newErrors.duration = 'Plan Duration is required';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.benifits.trim()) {
      newErrors.benifits = 'Benifits is required';
    }

    if (!formData.branch.trim()) {
      newErrors.branch = 'Branch is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (validateForm()) {
        const res = await axios.post(`${URI}/payment/addplan`, formData, {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }).then(res => {
          fetchBranches();
          // onCancel();
          setIsFormActive(false);
          setFormData({
            duration: '',
            branch: '',
            description: '',
            benifits:'',
            price: null
          });
          // setProfile(null);
          // setCroppedProfile(null);
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
    } catch (error) {
      console.log("while creating branch", error);
    }
    finally {
      setLoading(false);
    }
  };

  const updateUser=()=>{}


//   const updateUser = async (e) => {
//     try {
//       setLoading(true);
//       e.preventDefault();
//       const formdata = new FormData();
//       formdata.append('name', formData?.name);
//       formdata.append('location', formData?.location);
//       formdata.append('branchid', initialData?._id)
//       if (formData?.admin) {
//         formdata.append('admin', formData?.admin);
//       }
//       formdata.append('profile', croppedProfile); //logo
//       const res = await axios.post(`${URI}/superadmin/updatebranch`, formdata, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         },
//         withCredentials: true
//       }).then(res => {
//         fetchBranches();
//         onCancel();
//         setFormData({
//           name: '',
//           location: '',
//           admin: '',
//         });
//         setProfile(null);
//         setCroppedProfile(null);
//         toast.success(res?.data?.message);
//       }).catch(err => {
//         // Handle error and show toast
//         if (err.response && err.response.data) {
//           if (err.response.data.notAuthorized) {
//             dispatch(setSessionWarning(true));
//           } else {
//             toast.error(err.response.data.message || "Something went wrong");
//           }
//         } else {
//           toast.error("Something went wrong");
//         }
//       });


//     } catch (error) {
//       console.log("while updating Branch");
//     }
//     finally {
//       setLoading(false);
//     }
//   }

//   // Filter out admins who are already assigned to a branch
//   const availableAdmins = allUsers?.filter(admin =>
//     admin.designation === 'admin'
//   );
  return (
    <>
      {sessionWarning && <SessionEndWarning />}
      <form className='form'>
        <div className="form-group">
          <label htmlFor="duration" className="form-label">Duration</label>
          <input
            type="text"
            id="duration"
            name="duration"
            className={`form-control ${errors.duration ? 'border-error' : ''}`}
            value={formData?.duration}
            onChange={handleChange}
            placeholder="Enter Duration"
          />
          {errors.duration && <div className="text-error text-sm mt-1">{errors.duration}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="price" className="form-label">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            className={`form-control ${errors.price ? 'border-error' : ''}`}
            value={formData?.price}
            onChange={handleChange}
            placeholder="Enter price in ruppes"
          />
          {errors.price && <div className="text-error text-sm mt-1">{errors.price}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            className={`form-control ${errors.description ? 'border-error' : ''}`}
            value={formData?.description}
            onChange={handleChange}
            placeholder="Enter description"
          />
          {errors.description && <div className="text-error text-sm mt-1">{errors.description}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="benifits" className="form-label">Benifits</label>
          <input
            type="text"
            id="benifits"
            name="benifits"
            className={`form-control ${errors.benifits ? 'border-error' : ''}`}
            value={formData?.benifits}
            onChange={handleChange}
            placeholder="Enter benifits"
          />
          {errors.benifits && <div className="text-error text-sm mt-1">{errors.benifits}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="branch" className="form-label">Branch</label>
          <input
            type="text"
            id="branch"
            name="branch"
            className={`form-control ${errors.branch ? 'border-error' : ''}`}
            value={formData?.branch}
            onChange={handleChange}
            placeholder="Enter branch"
          />
          {errors.branch && <div className="text-error text-sm mt-1">{errors.branch}</div>}
        </div>

        

        {/* <div className="form-group">
          <label htmlFor="" className="form-label">Branch Logo</label>
          <label htmlFor="profile" className='form-label' style={{ backgroundColor: 'rgba(35, 225, 232, 0.9)', color: "white", padding: '2%', borderRadius: '12px' }}>{croppedProfile ? croppedProfile.name : profile ? profile.name : 'Upload Branch Logo'}</label>
          <input
            type="file"
            id="profile"
            name="profile"
            style={{ display: 'none' }}
            className=''
            // value={profile}
            // onChange={handleFileChange}
            placeholder="Enter full name"
            accept='image/*'
          />
          {/* {croppedProfile && (
                    <img src={URL.createObjectURL(croppedProfile)} alt="Cropped Preview" width="100" height="100" />
                  )} */}

          {/* {showCropper && (
            <LogoCropperModal
              image={profile}
              aspectRatio={aspectRatio}
              onCropDone={(croppedImage) => {
                setCroppedProfile(croppedImage);
                setShowCropper(false);
              }}
              onClose={() => setShowCropper(false)}
            />
          )} */}
          {/* {errors.profile && <div className="text-error text-sm mt-1">{errors.profile}</div>}
        </div> <br /> <br />  */}

        {/* <div className="form-group">
          <label htmlFor="admin" className="form-label">Branch Admin</label>
          <select
            id="admin"
            name="admin"
            className="form-select"
            // value={formData?.admin ? formData?.admin : initialData?.admin}
            // onChange={handleChange}
          >
            <option value="" selected disabled>Select an admin (optional)</option>
            {/* {availableAdmins?.map(admin => (
              <option key={admin?.id} value={admin?.username}>
                {admin?.username} - {admin?.branches?.map(b => (<>{b}, </>))}
              </option>
            ))} */}

          {/* </select>
        </div> */}

        <div className="flex gap-2 justify-end mt-4">
          <button
            type="button"
            className="btn btn-outline"
            onClick={()=>setIsFormActive(false)}
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
                onClick={initialData ? updateUser : handleSubmit}
                className="btn btn-primary"
              >
                {initialData ? 'Update Branch' : 'Add Plan'}
              </button>
          }
        </div>
      </form>
    </>
  );
}

export default PlanForm;