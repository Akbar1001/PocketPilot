import {
    createContext,
    useContext,
    useState
} from "react";


// Create authentication context
const AuthContext = createContext(null);


// Authentication Provider
export const AuthProvider = ({ children }) => {

    // Get existing token from localStorage
    // This allows the user to remain logged in
    // even after refreshing the browser.
    const [token, setToken] = useState(
        localStorage.getItem("accessToken")
    );


    // Get existing user from localStorage
    const [user, setUser] = useState(() => {

        const storedUser =
            localStorage.getItem("user");

        return storedUser
            ? JSON.parse(storedUser)
            : null;
    });


    // Login function
    const login = (
        accessToken,
        refreshToken,
        userData
    ) => {

        // Save access token
        localStorage.setItem(
            "accessToken",
            accessToken
        );


        // Save refresh token
        localStorage.setItem(
            "refreshToken",
            refreshToken
        );


        // Save user information
        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );


        // Update React state
        setToken(accessToken);
        setUser(userData);
    };


    // Logout function
    const logout = () => {

        // Remove authentication data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");


        // Update React state
        setToken(null);
        setUser(null);
    };


    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


// Custom hook
export const useAuth = () => {

    return useContext(AuthContext);
};