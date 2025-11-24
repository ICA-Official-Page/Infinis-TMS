import { useState } from 'react';
import '../assets/css/login.css';
import mockUsers from '../data/mockUsers';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import URI from '../utills';
import toast from 'react-hot-toast';
import { setUser } from '../Redux/userSlice';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';

function Signup() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [profile, setProfile] = useState(null);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        cpassword: '',
        email: '',
        name: '',
        mobile: '',
        address: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const passValidation = () => {
        if (!formData?.username || !formData?.email || !formData?.password || !formData?.cpassword || !formData?.mobile || !formData?.address) {
            toast.error('Please fill out all Fields!')
            return false;
        }
        else if (!formData?.password?.length > 6) {
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
                    alert('Passwords does not match!')
            }
            else {
                alert('Password have at least 1 character and 1 number!');
                return false
            }
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
                formdata.append('designation', 'superadmin');
                formdata.append('profile', profile);

                const res = await axios.post(`${URI}/auth/superadminsignup`, formdata, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(res => {

                    // fetchAllUsers();
                    setFormData({
                        username: '',
                        email: '',
                        password: '',
                        cpassword: '',
                        mobile: '',
                        designation: '',
                        department: '',
                        address: ''
                    });
                    setProfile(null);
                    toast.success(res?.data?.message);
                }).catch(err => {
                    // Handle error and show toast
                    if (err.response && err.response.data && err.response.data.message) {
                        toast.error(err.response.data.message); // For 400, 401, etc.
                    } else {
                        toast.error("Something went wrong");
                    }
                });
            }
        } catch (error) {
            console.log("while make an admin", error);
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
        <div className="login-container"  >
            <div className="infinity-background">
                <div className="infinity-shape"></div>
            </div>
            <div className="login-card animated-fade"  >
                <div className="login-header">
                    <h1>Ticketing System</h1>
                    <p className="text-muted">Administrator Sign Up</p>
                </div>

                <form onSubmit={makeUser} className="form" style={{ width: '100%' }} >
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="form-control"
                            value={formData?.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            name='username'
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <input
                            type="text"
                            name='name'
                            id="name"
                            className="form-control"
                            value={formData?.name}
                            onChange={handleChange}
                            placeholder="Enter your Full Name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            name='email'
                            className="form-control"
                            value={formData?.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="cpassword" className="form-label">Password</label>
                        <div style={styles.container}  >
                            <input
                                className='form-control'
                                id='password'
                                type={showPassword ? "text" : "password"}
                                name='password'
                                placeholder={"Enter Password"}
                                value={formData?.password}
                                onChange={handleChange}
                                required
                            // style={styles.input}
                            />
                            <span onClick={togglePassword} style={styles.icon}>
                                {formData?.password ? showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} /> : ''}
                            </span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="cpassword" className="form-label">Confirm Password</label>
                        <div style={styles.container}  >
                            <input
                                className='form-control'
                                id='cpassword'
                                type={showcPassword ? "text" : "password"}
                                name='cpassword'
                                placeholder={"Confirm Password"}
                                value={formData?.cpassword}
                                onChange={handleChange}
                                required
                            // style={styles.input}
                            />
                            <span onClick={togglecPassword} style={styles.icon}>
                                {formData?.cpassword ? showcPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} /> : ''}
                            </span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="mobile" className="form-label">Mobile Number</label>
                        <input
                            type="number"
                            id="mobile"
                            name='mobile'
                            className="form-control"
                            value={formData?.mobile}
                            onChange={handleChange}
                            placeholder="Enter Mobile No."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address" className="form-label">Address</label>
                        <input
                            type="text"
                            name='address'
                            id="address"
                            className="form-control"
                            value={formData?.address}
                            onChange={handleChange}
                            placeholder="Enter your Address"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="" className="form-label">Profile Picture</label>
                        <label htmlFor="profile" className='form-control' style={{
                            backgroundColor: 'rgba(35, 225, 232, 0.9)',
                            color: "white", padding: '7%', borderRadius: '12px'
                        }}>{profile ? profile?.name : 'Upload a Profile Picture'}</label>
                        <input
                            type="file"
                            id="profile"
                            name="profile"
                            style={{ display: 'none' }}
                            className=''
                            // value={profile}
                            onChange={(e) => setProfile(e.target.files[0])}
                            placeholder="Enter full name"
                        />
                        {/* {errors.name && <div className="text-error text-sm mt-1">{errors.name}</div>} */}
                    </div>
                    {
                        loading ? <button className="btn btn-primary btn-block">
                            <img src="/img/loader.png" className='Loader' alt="loader" />
                        </button>
                            :
                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                style={{ width: '200%' }}
                            >
                                Sign Up
                            </button>
                    }
                </form>
                <span style={{ float: 'left' }} >Already have an Account <label onClick={() => navigate('/')} className="form-check-labe" style={{ color: 'blue', cursor: 'pointer' }} htmlFor="remember">
                    SignIn
                </label></span>

            </div>
        </div>
    );
}

// Basic inline styling
const styles = {
    container: {
        position: 'relative',
        width: '100%',
        maxWidth: '300px',
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

export default Signup;