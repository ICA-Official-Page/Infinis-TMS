import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Create auth context
const AuthContext = createContext();

// Sample user data (in a real app this would come from a database)
const initialUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'superadmin@example.com',
    password: 'password123',
    role: 'superadmin',
    avatar: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    branchIds: ['1', '2'],
    avatar: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'manager@example.com',
    password: 'password123',
    role: 'manager',
    branchId: '1',
    departmentIds: ['1', '2'],
    avatar: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'teamleader@example.com',
    password: 'password123',
    role: 'teamleader',
    branchId: '1',
    departmentId: '1',
    avatar: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'executive@example.com',
    password: 'password123',
    role: 'executive',
    branchId: '1',
    departmentId: '1',
    avatar: null,
    createdAt: new Date().toISOString(),
  },
];

// Create provider component
export const AuthProvider = ({ children }) => {
  // Initialize state for current user
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : initialUsers;
  });
  const [passwordResetRequests, setPasswordResetRequests] = useState(() => {
    const savedRequests = localStorage.getItem('passwordResetRequests');
    return savedRequests ? JSON.parse(savedRequests) : [];
  });
  const [userRequests, setUserRequests] = useState(() => {
    const savedRequests = localStorage.getItem('userRequests');
    return savedRequests ? JSON.parse(savedRequests) : [];
  });

  // Initialize auth from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Save users to local storage when they change
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Save reset requests to local storage
  useEffect(() => {
    localStorage.setItem('passwordResetRequests', JSON.stringify(passwordResetRequests));
  }, [passwordResetRequests]);

  // Save user requests to local storage
  useEffect(() => {
    localStorage.setItem('userRequests', JSON.stringify(userRequests));
  }, [userRequests]);

  // Handle user login
  const login = (email, password) => {
    const user = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password
    );
    
    if (user) {
      // Clone user without password for security
      const { password, ...secureUser } = user;
      setCurrentUser(secureUser);
      localStorage.setItem('currentUser', JSON.stringify(secureUser));
      return { success: true, user: secureUser };
    }
    
    return { success: false, error: 'Invalid email or password' };
  };

  // Handle user logout
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Register new user
  const register = (userData) => {
    const existingUser = users.find(
      (user) => user.email.toLowerCase() === userData.email.toLowerCase()
    );
    
    if (existingUser) {
      return { success: false, error: 'Email already in use' };
    }
    
    const newUser = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString(),
    };
    
    setUsers((prevUsers) => [...prevUsers, newUser]);
    return { success: true, user: newUser };
  };

  // Create password reset request
  const requestPasswordReset = (email) => {
    const user = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    const resetRequest = {
      id: uuidv4(),
      userId: user.id,
      email: user.email,
      token: uuidv4(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };
    
    setPasswordResetRequests((prevRequests) => [...prevRequests, resetRequest]);
    return { success: true };
  };

  // Process password reset
  const resetPassword = (token, newPassword) => {
    const request = passwordResetRequests.find(
      (req) => req.token === token && req.status === 'pending'
    );
    
    if (!request || new Date(request.expiresAt) < new Date()) {
      return { success: false, error: 'Invalid or expired token' };
    }
    
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === request.userId ? { ...user, password: newPassword } : user
      )
    );
    
    setPasswordResetRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === request.id ? { ...req, status: 'completed' } : req
      )
    );
    
    return { success: true };
  };

  // Handle user request (e.g., new account, role change)
  const submitUserRequest = (requestData) => {
    const newRequest = {
      id: uuidv4(),
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    setUserRequests((prevRequests) => [...prevRequests, newRequest]);
    return { success: true, requestId: newRequest.id };
  };

  // Process user request
  const processUserRequest = (requestId, action) => {
    const request = userRequests.find((req) => req.id === requestId);
    
    if (!request) {
      return { success: false, error: 'Request not found' };
    }
    
    if (action === 'approve') {
      // If creating a new user
      if (request.type === 'new_user') {
        register({
          name: request.name,
          email: request.email,
          password: request.password || 'defaultPassword123', // In real app, generate secure password
          role: request.role,
          ...(request.branchId && { branchId: request.branchId }),
          ...(request.departmentId && { departmentId: request.departmentId }),
        });
      }
      // If role change, update user
      else if (request.type === 'role_change') {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === request.userId ? { ...user, role: request.newRole } : user
          )
        );
      }
    }
    
    // Update request status
    setUserRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === requestId ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' } : req
      )
    );
    
    return { success: true };
  };

  // Create a new user (for admins/managers)
  const createUser = (userData) => {
    const { email, role } = userData;
    
    // Check if email already exists
    const existingUser = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingUser) {
      return { success: false, error: 'Email already in use' };
    }
    
    // Create new user
    const newUser = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString(),
    };
    
    setUsers((prevUsers) => [...prevUsers, newUser]);
    return { success: true, user: newUser };
  };

  // Update user details
  const updateUser = (userId, userData) => {
    // Find user
    const user = users.find((u) => u.id === userId);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // If email is changing, check if it already exists
    if (userData.email && userData.email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = users.find(
        (u) => u.email.toLowerCase() === userData.email.toLowerCase()
      );
      
      if (existingUser) {
        return { success: false, error: 'Email already in use' };
      }
    }
    
    // Update user
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === userId ? { ...u, ...userData } : u))
    );
    
    // If updating current user, update currentUser state
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    return { success: true };
  };

  // Get users based on filters
  const getUsers = (filters = {}) => {
    let filteredUsers = [...users];
    
    // Filter by role
    if (filters.role) {
      filteredUsers = filteredUsers.filter((user) => user.role === filters.role);
    }
    
    // Filter by branch
    if (filters.branchId) {
      filteredUsers = filteredUsers.filter((user) => 
        user.branchId === filters.branchId || 
        (user.branchIds && user.branchIds.includes(filters.branchId))
      );
    }
    
    // Filter by department
    if (filters.departmentId) {
      filteredUsers = filteredUsers.filter((user) => 
        user.departmentId === filters.departmentId || 
        (user.departmentIds && user.departmentIds.includes(filters.departmentId))
      );
    }
    
    // Remove password for security
    return filteredUsers.map(({ password, ...user }) => user);
  };

  // Get a specific user
  const getUser = (userId) => {
    const user = users.find((u) => u.id === userId);
    
    if (!user) {
      return null;
    }
    
    // Remove password for security
    const { password, ...secureUser } = user;
    return secureUser;
  };

  // Determine if current user has permission for an action
  const hasPermission = (permission) => {
    if (!currentUser) return false;
    
    const roleHierarchy = {
      superadmin: 5,
      admin: 4,
      manager: 3,
      teamleader: 2,
      executive: 1,
    };
    
    const userRoleLevel = roleHierarchy[currentUser.role] || 0;
    
    // Define permissions based on role levels
    const permissions = {
      createBranch: 5,                // Super Admin only
      assignBranchToAdmin: 5,         // Super Admin only
      createAdmin: 5,                 // Super Admin only
      createManager: 4,               // Admin+
      assignBranchToManager: 4,       // Admin+
      createDepartment: 4,            // Admin+
      createTeamLeader: 3,            // Manager+
      assignDepartmentToTeamLeader: 3, // Manager+
      createExecutive: 2,             // Team Leader+
      viewAllTickets: 3,              // Manager+
      resolveAnyTicket: 3,            // Manager+
      viewUserRequests: 4,            // Admin+
      manageTicketSettings: 4,        // Admin+
    };
    
    return userRoleLevel >= (permissions[permission] || 999);
  };

  // Get the user's role as a string
  const userRole = currentUser?.role || null;

  // Exposed context value
  const value = {
    currentUser,
    isLoading,
    userRole,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
    submitUserRequest,
    processUserRequest,
    createUser,
    updateUser,
    getUsers,
    getUser,
    hasPermission,
    passwordResetRequests,
    userRequests,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;