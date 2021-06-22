import React, {
     createContext,
     useContext,
     useState,
     ReactNode,
     useEffect
     } from 'react';

import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { api } from '../services/api';
import { COLLECTION_USERS, COLLECTION_APPOINTMENTS } from '../configs/database';

type User = {
    id: string;
    username: string;
    firstName: string;
    avatar: string;
    email: string;
    token: string;
};

type AuthContextData = {
    user: User;
    loading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
};

type AuthProviderProps = {
    children: ReactNode;
};

type AuthorizationResponse = AuthSession.AuthSessionResult & {
    params: {
        access_token?: string;
        error?: string;
    }
};

export const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>({} as User);
    const [loading, setLoading] = useState(false);

    async function signIn() {
        try {
            setLoading(true);
            const authUrl = `${api.defaults.baseURL}/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=${process.env.RESPONSE_TYPE}&scope=${process.env.SCOPE}`;

            const {type, params } = await AuthSession.startAsync({ authUrl }) as AuthorizationResponse;

            if(type === "success" && !params.error)
            {
                api.defaults.headers.authorization = `Bearer ${params.access_token}`;
                const userInfo = await api.get('/users/@me');
                const firstName = userInfo.data.username.split(' ')[0];
                userInfo.data.avatar = `${process.env.CDN_IMAGE}/avatars/${userInfo.data.id}/${userInfo.data.avatar}.png`;

                const userData = {
                    ...userInfo.data,
                    firstName,
                    token: params.access_token
                };
                await AsyncStorage.setItem(COLLECTION_USERS, JSON.stringify(userData));
                setUser(userData);
            }
        } catch{
            throw new Error('Não foi possivel autenticar.');
        } finally {
            setLoading(false);
        }
    }

    async function signOut() {
        setUser({} as User);
        await AsyncStorage.removeItem(COLLECTION_USERS);
        await AsyncStorage.removeItem(COLLECTION_APPOINTMENTS);
    }

    async function loadUserStorageData() {
        const storage = await AsyncStorage.getItem(COLLECTION_USERS);
        if(storage) {
            const userLogged = JSON.parse(storage) as User;
            api.defaults.headers.authorization = `Bearer ${userLogged.token}`;
            setUser(userLogged);
        }
    }
    useEffect(() => {
        loadUserStorageData();
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signIn,
            signOut
        }}>
            { children }
        </AuthContext.Provider>
    );
}

function useAuth() {
    const context = useContext(AuthContext);
    return context;
}

export {
    AuthProvider,
    useAuth
};