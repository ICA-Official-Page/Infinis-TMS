import axios from 'axios';
import { useState } from 'react';
import URI from '../utills';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import SessionEndWarning from './SessionEndWarning';
import { setSessionWarning } from '../Redux/userSlice';

function DepartmentForm({ onSubmit, onCancel, initialData = null, allUsers = [], fetchDepartment }) {

  const { user, sessionWarning } = useSelector(store => store.user);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    manager: initialData?.manager || '',
    teamleader: initialData?.teamleader || '',
    branch: initialData?.branch || ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
        // Convert managerId to number if it's not empty
        const res = await axios.post(`${URI}/admin/createdepartment`, formData, {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }).then(async res => {

          const notificationRes = await axios.post(`${URI}/notification/pushnotification`, { user: user?._id, branch: formData?.branch, section: 'department' },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          )

          setFormData({
            name: '',
            description: '',
            manager: '',
            teamleader: '',
            branch: ''
          })
          fetchDepartment();
          onCancel();
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
      console.log('while create dept', error);
    }
    finally {
      setLoading(false);
    }
  };

  const updateUser = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();

      const res = await axios.post(`${URI}/admin/updatedepartment`, { name: formData?.name, description: formData?.description, manager: formData?.manager, teamleader: formData?.teamleader, branch: formData?.branch, departmentid: initialData?._id }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(async res => {
        const notificationRes = await axios.post(`${URI}/notification/pushnotification`, { user: user?._id, branch: formData?.branch, section: 'department' },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        fetchDepartment();
        onCancel();
        setFormData({
          name: '',
          description: '',
          manager: '',
          teamleader: '',
          branch: ''
        });
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
      console.log("while updating Branch");
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <>
      {sessionWarning && <SessionEndWarning />}
      <form className='form'>
        <div className="form-group">
          <label htmlFor="name" className="form-label">Department Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className={`form-control ${errors.name ? 'border-error' : ''}`}
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter department name"
          />
          {errors.name && <div className="text-error text-sm mt-1">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            name="description"
            className={`form-control ${errors.description ? 'border-error' : ''}`}
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter department description"
            rows="3"
          ></textarea>
          {errors.description && <div className="text-error text-sm mt-1">{errors.description}</div>}

        </div>

        {
          !initialData && <div className="form-group">
            <label htmlFor="branch" className="form-label">Branch</label>
            <select
              id="branch"
              name="branch"
              className="form-select"
              value={formData?.branch}
              onChange={handleChange}
            >
              <option value="" disabled selected>Select a Branch</option>
              {user?.branches?.map(branch => (
                <>
                  {
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  }
                </>

              ))}
            </select>
            {errors.branch && <div className="text-error text-sm mt-1">{errors.branch}</div>}

          </div>
        }

        <div className="form-group">
          <label htmlFor="teamleader" className="form-label">Department Team Leader</label>
          <select
            id="teamleader"
            name="teamleader"
            className="form-select"
            value={formData?.teamleader}
            onChange={handleChange}
          >
            <option value="" disabled selected >Select a Team Leader (optional)</option>
            {allUsers?.map(TL => (
              <>
                {(initialData?.teamleader || (!TL?.department && TL?.branch === formData?.branch)) && (
                  <option key={TL?.username} value={TL?.username}>
                    {TL?.username} - {TL?.branch}
                  </option>
                )}
              </>

            ))}
          </select>
        </div>

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
                onClick={initialData ? updateUser : handleSubmit}
              >
                {initialData ? 'Update Department' : 'Create Department'}
              </button>
          }
        </div>
      </form>
    </>
  );
}

export default DepartmentForm;