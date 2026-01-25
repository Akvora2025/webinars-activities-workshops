import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';

const UserContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function UserProvider({ children }) {
    const { isSignedIn, isLoaded: authLoaded, getToken } = useAuth();
    const { user: clerkUser, isLoaded: userLoaded } = useUser();
    const [dbUser, setDbUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDbUser = async () => {
        if (!isSignedIn) {
            setDbUser(null);
            setLoading(false);
            return;
        }

        try {
            const token = await getToken();
            const response = await axios.get(`${API_URL}/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setDbUser(response.data.user);
            }
        } catch (err) {
            console.error('Error fetching DB user:', err);
            if (err.response?.status === 403 && err.response?.data?.isBlocked) {
                setDbUser({ isBlocked: true });
            } else {
                setError(err);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoaded && userLoaded) {
            fetchDbUser();
        }
    }, [authLoaded, userLoaded, isSignedIn]);

    return (
        <UserContext.Provider value={{ dbUser, loading, error, refreshUser: fetchDbUser, isBlocked: dbUser?.isBlocked }}>
            {children}
        </UserContext.Provider>
    );
}

export function useDbUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useDbUser must be used within a UserProvider');
    }
    return context;
}
