import { useEffect, useState } from 'react';
import './header.css';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';
import avatar from '../../assets/avatar.png';
import { useAuth } from '../Authentication/authContext';
import { useUser } from '../UserContext/usercontext';
import { useQuery } from '@tanstack/react-query';

function Header() {
    const { userName, setUserName, setEmail } = useUser();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const {isLoading, error, data} = useQuery({
        queryKey: ['data'],
        queryFn: async () => {
            const response =  await fetch('http://localhost:5000/data', {
                headers: {Authorization: `Bearer ${token}`}
            })
            if(!response.ok)throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        }
    })
    useEffect(()=>{
            if(data){
                setUserName(data.userName);
                setEmail(data.email);
            }
        }, [data])
    // Trạng thái cho chỉ số điều hướng và màu sắc
    const [indicatorLeft, setIndicatorLeft] = useState("4%");
    const [colors, setColors] = useState(['white', '#2e7d32', '#2e7d32']); 
    const [indicatorColor, setIndicatorColor] = useState("#2e7d32");
    const [indicatorBorderColor, setIndicatorBorderColor] = useState("rgb(178, 246, 182)");

    // Trạng thái hiển thị dropdown và đăng nhập
    const [hidden, setHidden] = useState(true);
    const { isLoggedIn, setIsLoggedIn } = useAuth();

    // Xử lý hiện/ẩn dropdown khi click bên ngoài
    useEffect(() => {
        let clickHandler;
        if (isLoggedIn) {
            clickHandler = (event) => {
                if (event.target.classList.contains('user-image')) {
                    setHidden(false);
                } else {
                    setHidden(true);
                }
            };
            window.addEventListener('click', clickHandler);
        }
        return () => {
            if (clickHandler) {
                window.removeEventListener('click', clickHandler);
            }
        };
    }, [isLoggedIn]);

    // Cập nhật vị trí chỉ báo và màu sắc khi thay đổi đường dẫn
    useEffect(() => {
        let newLeft;
        let newColors = [...colors];
        if (location.pathname === '/home' || location.pathname === '/workingpage') {
            newLeft = '4%';
            newColors = ['white', '#90EE90', '#90EE90'];
            setIndicatorColor("#2e7d32");
            setIndicatorBorderColor("rgb(155, 241, 161)");
        } else if (location.pathname === '/aboutus') {
            newLeft = '37.5%';
            newColors = ['#2e7d32', 'white', '#2e7d32'];
            setIndicatorColor("#2e7d32");
            setIndicatorBorderColor("rgb(178, 246, 182)");
        } else if (location.pathname === '/contact') {
            newLeft = '72.3%';
            newColors = ['rgb(244, 241, 32)', 'rgb(244, 241, 32)', 'white'];
            setIndicatorColor("#86a020");
            setIndicatorBorderColor("rgb(246, 245, 178)");
        } else if (location.pathname === '/information' || location.pathname === '/workingpage') {
            newLeft = '4%';
            newColors = ['#90EE90', '#90EE90', '#90EE90'];
            setIndicatorColor("transparent");
            setIndicatorBorderColor("transparent");
        }
        setIndicatorLeft(newLeft);
        setColors(newColors); 
    }, [location]);

    
    function handleLogOut() {
        setIsLoggedIn(false);
        setHidden(true);
    }

    return (
        <div className="header2">
            <div className="name">
                <img src={logo} className="logo" alt="Logo" />
                <p className="web-name">Smart Farm</p>
            </div>

            
            <div className="header">
                <div className="tab-indicator"
                    style={{
                        left: indicatorLeft,
                        backgroundColor: indicatorColor,
                        border: "4px solid " + indicatorBorderColor
                    }} />
                <nav className="nav-links">
                    <Link to={isLoggedIn ? "/workingpage" : "/home"} className="a" style={{ color: colors[0] }}>
                        Home
                    </Link>
                    <Link to="/aboutus" className="a" style={{ color: colors[1] }}>
                        About us
                    </Link>
                    <Link to="/contact" className="a" style={{ color: colors[2] }}>
                        Contact
                    </Link>
                </nav>
            </div>

            
            <div className="right-header" style={{ display: isLoggedIn ? '' : 'none' }}>
                <div className='hello-user'>
                    <p>Xin chào, {userName}</p>
                </div>
                <div className="user">
                    <img src={avatar} className="user-image" alt="User" />
                </div>

                
                <div className='drop-down' style={{ display: !hidden ? '' : 'none' }}>
                    <Link to={"/information"} className='drop'>
                        <i className='bi-person' /><p>Thông tin</p>
                    </Link>
                    <Link to={"/home"} className='drop' onClick={handleLogOut}>
                        <i className='bi-box-arrow-right' /><p>Đăng xuất</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Header;
