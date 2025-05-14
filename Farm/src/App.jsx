import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Homepage1 from './components/homepage/homepage';
import Workingpage from './components/Workingpage/workingpage';
import AboutUs from './components/aboutUs/aboutUs';
import Contact from './components/contact/contact';
import Header from './components/header/Header';
import { AuthProvider, useAuth } from './components/Authentication/authContext';
import { UserProvider } from './components/UserContext/usercontext';
import Information from './components/Information/information';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const queryClient = new QueryClient();

function AppRoutes() {
    const { isLoggedIn } = useAuth();
    return (
        <Routes>
            <Route path="/" element={<Navigate to={isLoggedIn ? "/workingpage" : "/home"} replace />} />
            <Route path="/home" element={<Homepage1 />} />
            <Route path="/workingpage" element={<Workingpage />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/information" element={<Information />} />
        </Routes>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <UserProvider>
                    <BrowserRouter>
                        <Header />
                        <AppRoutes />
                    </BrowserRouter>
                </UserProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
