import { useActionState, useState } from 'react';
import '../assets/css/login.css';
import mockUsers from '../data/mockUsers';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import URI from '../utills';
import toast from 'react-hot-toast';
import { setUser } from '../Redux/userSlice';
import { faDyalog } from '@fortawesome/free-brands-svg-icons'
import { faBell, faBuilding, faChartBar, faComment, faEye, faEyeSlash, faMoon, faSun, faUser } from '@fortawesome/free-regular-svg-icons'
import { faAdd, faBars, faChartLine, faCodePullRequest, faCog, faCommentDots, faGear, faLeaf, faLock, faPersonCircleQuestion, faPlusSquare, faSignOut, faTicketAlt, faTimes, faUserCog, faUsers, faUsersCog } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNavigate } from 'react-router-dom';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [npassword, setNpassword] = useState('');
  const [designation, setDesignation] = useState('');
  const [passwordModel, setPasswordModel] = useState('');
  const [code, setCode] = useState('');
  const [sendedCode, setSendedCode] = useState('');
  const [cpassword, setCPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingF, setLoadingF] = useState(false);

  const GenerateRandomOTP = (lenth) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const characterlenth = characters.length;
    let result = '';
    for (let i = 0; i < lenth; i++) {
      result += characters.charAt(Math.floor(Math.random() * characterlenth));
    }
    return result;
  }

  const forgetPassword = async () => {
    try {
      setLoadingF(true);
      if (!email) {
        toast.error('Please fill the Email field!');
      }
      // if (!designation) {
      //   toast.error('Please Select the designation!');
      // }
      else {
        const res = await axios.get(`${URI}/auth/findemail/${email}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(async (r) => {
          if (!r?.data?.user?.designation?.includes('admin')) {
            const result = window.confirm('Send Request for Update your Password!')
            if (result) {
              const reqRes = await axios.post(`${URI}/auth/reqforupdatepassword`, r?.data?.user, {
                headers: {
                  'Content-Type': 'application/json'
                }
              })
                .then(async res => {
                  const notificationRes = await axios.post(`${URI}/notification/pushnotification`, { user: r?.data?.user?._id, branch: r?.data?.user?.branch, section: 'passreq', designation: r?.data?.user?.designation, department: r?.data?.user?.department },
                    {
                      headers: {
                        'Content-Type': 'application/json'
                      }
                    }
                  )

                  toast.success(res?.data?.message);
                  setEmail('');
                  setDesignation("");
                }).catch(err => {
                  // Handle error and show toast
                  if (err.response && err.response.data && err.response.data.message) {
                    toast.error(err.response.data.message); // For 400, 401, etc.
                  } else {
                    toast.error("Something went wrong got up");
                  }
                });

            } else {
              toast.error("Request Canceled by User");
            }
          }

          //work there
          else {
            const Code = GenerateRandomOTP(6);
            if (Code) {
              // setLoading(true);
              const res = await axios.post(`${URI}/auth/mailforupdatepass`, { email: r?.data?.user?.email, code: Code }, {
                headers: {
                  'Content-Type': 'application/json'
                }
              }).then(re => {
                toast.success(re?.data?.message);
                setSendedCode(Code);
                setPasswordModel(true);
              }).catch(err => {
                // Handle error and show toast
                if (err.response && err.response.data && err.response.data.message) {
                  toast.error(err.response.data.message); // For 400, 401, etc.
                } else {
                  toast.error("Something went wrong");
                }
              });
            }

          }


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
      console.log("while sending forget password request", error);
    }
    finally {
      setLoadingF(false);
    }
  }

  const updatePassword = async (e) => {
    e.preventDefault();
    try {
      if (code !== sendedCode) {
        toast.error('Code does not Match!');
      }
      else if (npassword !== cpassword) {
        toast.error('Confirm Password does not Match!')
      }
      else {
        const res = await axios.post(`${URI}/auth/updateforgetpass`, { email: email, password: npassword }, {
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(r => {

          setEmail('');
          setPassword('');
          setNpassword('');
          setCPassword('');
          setCode('');
          setDesignation('');
          setSendedCode('');
          setPasswordModel(false);
          toast.success(r?.data?.message);
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
      console.log('while update password', error);
    }
  }

  const login = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${URI}/auth/login`, { email: email, password: password }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }).then(res => {
        dispatch(setUser(res?.data?.user));
        toast.success(res.data.message);
      }).catch(err => {
        // Handle error and show toast
        if (err.response && err.response.data && err.response.data.message) {
          toast.error(err.response.data.message); // For 400, 401, etc.
        } else {
          toast.error("Something went wrong");
        }
      });
    } catch (error) {
      console.log("while login", error);
    }
    finally {
      setLoading(false);
    }
  }

  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <>
      {
        passwordModel ?
          <div className="login-container">
            <div className="infinity-background">
              <div className="infinity-shape"></div>
            </div>
            <div className="login-card animate-fade">
              <div className="login-header">
                <h1>Infinis Ticketing System</h1>
                <p className="text-muted">Update your Password</p>
              </div>

              <form onSubmit={updatePassword} className="login-form">
                <div className="form-group">
                  <label htmlFor="code" className="form-label">Code</label>
                  <input
                    type="text"
                    id="code"
                    className="form-control"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Verification Code"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="npassword" className="form-label">New Password</label>
                  <input
                    type="password"
                    id="npassword"
                    className="form-control"
                    value={npassword}
                    onChange={(e) => setNpassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />

                </div>

                <div className="form-group">
                  <label htmlFor="cpassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    id="cpassword"
                    className="form-control"
                    value={cpassword}
                    onChange={(e) => setCPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                // disabled={loading}
                >
                  {/* {loading ? 'Signing in...' : 'Sign In'} */}
                  Update Password
                </button>
                {
                  passwordModel && <label className="form-check-label" style={{ color: 'blue', float: 'left' }} htmlFor="remember" onClick={() => setPasswordModel(false)}>
                    Back
                  </label>
                }
                {/* <label className="form-check-label" style={{ color: 'blue' }} htmlFor="remember" onClick={forgetPassword}>
                  forget password
                </label> */}
              </form>
            </div>
          </div>
          :
          <div className="login-container">
            <div className="infinity-background">
              <div className="infinity-shape"></div>
            </div>
            <div className="login-card animate-fade">
              <div className="login-header">
                <h1>Infinis Ticketing System</h1>
                <p className="text-muted">Sign in to your account</p>
              </div>

              <form onSubmit={login} className="login-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    // style={styles.input}
                    />
                    <span onClick={togglePassword} style={styles.icon}>
                      {password ? showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} /> : ''}
                    </span>
                  </div>
                </div>

                {
                  loading ? <button className="btn btn-primary btn-block">
                    <img src="/img/loader.png" className='Loader' alt="loader" />
                  </button>
                    :
                    <button
                      type="submit"
                      className="btn btn-primary btn-block"
                    >
                      Sign In
                    </button>
                }
                {
                  loadingF ? <label className="form-check-label">
                    <img src="/img/loader.png" className='Loader' alt="loader" />
                  </label>
                    :
                    <label className="form-check-label" style={{ color: 'blue' }} htmlFor="remember" onClick={forgetPassword}>
                      forget password
                    </label>
                }
              </form>
              <span style={{ float: 'left' }} >Administrator <label onClick={() => navigate('/signup')} className="form-check-labe" style={{ color: 'blue', cursor: 'pointer' }} htmlFor="remember">
                SignUp
              </label></span>
            </div>
          </div>
      }
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
      `}</style>
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

export default Login;
{/*             5  <div className="background-animation">
              <div className="particle particle-1"></div>
              <div className="particle particle-2"></div>
              <div className="particle particle-3"></div>
              <div className="particle particle-4"></div>
              <div className="particle particle-5"></div>
              <div className="particle particle-6"></div>
              <div className="glow-orb glow-1"></div>
              <div className="glow-orb glow-2"></div>
              <div className="glow-orb glow-3"></div>
              <div className="floating-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
              </div>
            </div> */}
{/* 4 <div class="infinity-bg">
              <svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#00f2fe">
                      <animate attributeName="offset" values="0;1;0" dur="4s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="50%" stop-color="#4facfe" />
                    <stop offset="100%" stop-color="#00f2fe">
                      <animate attributeName="offset" values="1;0;1" dur="4s" repeatCount="indefinite" />
                    </stop>
                  </linearGradient>

                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <path
                  d="M60,75
           C60,30 120,30 150,75
           C180,120 240,120 240,75
           C240,30 180,30 150,75
           C120,120 60,120 60,75 Z"
                  fill="none"
                  stroke="url(#waveGradient)"
                  stroke-width="6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  filter="url(#glow)"
                />
              </svg>
            </div> */}

{/* 3 <div class="infinity-bg">
              <svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#8b5cf6" />
                    <stop offset="100%" stop-color="#06b6d4" />
                  </linearGradient>

                  <mask id="infinityWaveMask">
                    <path id="wavePath"
                      d="M60,75
               C60,30 120,30 150,75
               C180,120 240,120 240,75
               C240,30 180,30 150,75
               C120,120 60,120 60,75 Z"
                      fill="none"
                      stroke="white"
                      stroke-width="6">
                      <animate attributeName="stroke-dashoffset"
                        from="0" to="-60"
                        dur="1.2s"
                        repeatCount="indefinite" />
                    </path>
                  </mask>
                </defs>

                <path
                  d="M60,75
           C60,30 120,30 150,75
           C180,120 240,120 240,75
           C240,30 180,30 150,75
           C120,120 60,120 60,75 Z"
                  fill="none"
                  stroke="url(#waveGradient)"
                  stroke-width="6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  mask="url(#infinityWaveMask)"
                />
              </svg>
            </div> */}
{/* 2 <div class="infinity-bg">
              <svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#8b5cf6" />
                    <stop offset="100%" stop-color="#06b6d4" />
                  </linearGradient>
                </defs>

                <path
                  d="M60,75
           C60,30 120,30 150,75
           C180,120 240,120 240,75
           C240,30 180,30 150,75
           C120,120 60,120 60,75 Z"
                  fill="none"
                  stroke="url(#infinityGradient)"
                  stroke-width="6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-dasharray="15 10"
                  stroke-dashoffset="0"
                >
                  <animate attributeName="stroke-dashoffset"
                    values="0;25"
                    dur="1s"
                    repeatCount="indefinite" />
                </path>
              </svg>
            </div> */}
{/* 1 <div class="infinity-bg">
              <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">

                <defs>
                  <pattern id="wave" x="0" y="0" width="20" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 0 5 Q 5 0, 10 5 T 20 5" fill="none" stroke="#a855f7" stroke-width="2" />
                  </pattern>

                  <mask id="wave-mask">
                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                    <rect x="0" y="0" width="200%" height="100%" fill="url(#wave)">
                      <animateTransform attributeName="transform"
                        type="translate"
                        from="0,0" to="20,0"
                        dur="1s" repeatCount="indefinite" />
                    </rect>
                  </mask>
                </defs>

                <path
                  d="M30,50
           C30,20 70,20 100,50
           C130,80 170,80 170,50
           C170,20 130,20 100,50
           C70,80 30,80 30,50 Z"
                  fill="none"
                  stroke="#9333ea"
                  stroke-width="6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  mask="url(#wave-mask)"
                />
              </svg>
            </div> */}