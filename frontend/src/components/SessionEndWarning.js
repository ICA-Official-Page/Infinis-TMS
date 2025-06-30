import axios from 'axios';
import React from 'react'
import URI from '../utills';
import { useDispatch } from 'react-redux';
import { setUser,setSessionWarning } from '../Redux/userSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';



const SessionEndWarning = () => {

    const dispatch = useDispatch();
    const navigate=useNavigate();

    const handleLogout = async () => {
        try {
            const res = await axios.get(`${URI}/auth/logout`, {
                headers: {
                    'Content-Type': 'aplication/json'
                }
            }).then(res => {
                dispatch(setSessionWarning(false));
                dispatch(setUser(null));
                navigate('/');
                toast.success(res?.data?.message);
            }).catch(err => {
                // Handle error and show toast
                if (err.response && err.response.data && err.response.data.message) {
                    toast.error(err.response.data.message); // For 400, 401, etc.
                } else {
                    toast.error("Something went wrong");
                }
            });
        } catch (error) {
            console.log('While logout', error);
        }

    };

    return (
        <>
            <div className="modal-backdrop">
                <div className="modal">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title">Session Expired!</h3>
                                <button
                                    className="modal-close"
                                    onClick={handleLogout}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Your Session is Expired,Please Re-Login!
                                </p>
                                <p className="text-error mt-2">Logout and Re-Login!</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-outline"
                                    onClick={handleLogout}
                                >
                                    OK
                                </button>
                                {/* <button
                                    className="btn btn-error"
                                    onClick={deleteType === 'user' ? confirmDeleteUser : handleDeleteDepartment}
                                >
                                    Delete
                                </button> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SessionEndWarning
