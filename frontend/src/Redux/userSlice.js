import { createSlice } from "@reduxjs/toolkit";


const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        theme: 'light',
        notificationCount: 0,
        sessionWarning: false
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
        setNotificationCount: (state, action) => {
            state.notificationCount = action.payload;
        },
        setSessionWarning: (state, action) => {
            state.sessionWarning = action.payload;
        }
    }
});

export const { setUser, setTheme, setNotificationCount,setSessionWarning } = userSlice.actions;
export default userSlice.reducer;