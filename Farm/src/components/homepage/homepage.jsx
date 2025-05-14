import './homepage.css';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import Footer from '../footer/Footer';
import { useAuth } from '../Authentication/authContext';

function Homepage1() {
    const navigate = useNavigate();
    const { setIsLoggedIn } = useAuth();

    // --- References cho các form ---
    const registerRef = useRef(null);
    const loginRef = useRef(null);
    const forgotRef = useRef(null);

    // --- State quản lý hiển thị form ---
    const [current, setCurrent] = useState('login');

    // --- Login States ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [emailPlaceholder, setEmailPlaceholder] = useState('Email');
    const [passwordPlaceholder, setPasswordPlaceholder] = useState('Mật khẩu');

    // --- Register States ---
    const [regEmail, setRegEmail] = useState('');
    const [regPass, setRegPass] = useState('');
    const [regConfirm, setRegConfirm] = useState('');
    const [regEmailErr, setRegEmailErr] = useState(false);
    const [regPassErr, setRegPassErr] = useState(false);
    const [regConfirmErr, setRegConfirmErr] = useState(false);
    const [regEmailPlaceholder, setRegEmailPlaceholder] = useState('Email');
    const [regPassPlaceholder, setRegPassPlaceholder] = useState('Tạo mật khẩu');
    const [regConfirmPlaceholder, setRegConfirmPlaceholder] = useState('Nhập lại mật khẩu');

    // --- Popup ---
    const [popupType, setPopupType] = useState("");
    const [popupContent, setPopupContent] = useState("");
    const [popup, setPopup] = useState(0);

    // --- Giao diện form quên mật khẩu ---
    const inputConfigs = {
        forgot: [{ type: 'email', placeholder: 'Nhập email', bi: 'bi-envelope' }]
    };

    // --- Đổi giữa các form login/register/forgot ---
    function handleMove(target) {
        setCurrent(target);
        setEmail(''); setPassword('');
        setEmailError(false); setPasswordError(false);
        setEmailPlaceholder('Email'); setPasswordPlaceholder('Mật khẩu');

        setRegEmail(''); setRegPass(''); setRegConfirm('');
        setRegEmailErr(false); setRegPassErr(false); setRegConfirmErr(false);
        setRegEmailPlaceholder('Email'); 
        setRegPassPlaceholder('Tạo mật khẩu'); 
        setRegConfirmPlaceholder('Nhập lại mật khẩu');
    }

    // --- Điều chỉnh hiển thị các box theo ref ---
    useEffect(() => {
        const refs = { login: loginRef, register: registerRef, forgot: forgotRef };
        Object.keys(refs).forEach(key => {
            if (refs[key].current) {
                refs[key].current.style.display = key === current ? 'flex' : 'none';
            }
        });
    }, [current]);

    // --- Validate email ---
    function isValidEmail(email) {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email);
    }

    // --- Lấy thời gian hiện tại định dạng DD/MM/YYYY HH:MM:SS ---
    function getCurrentDateTime() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    // --- Hàm gửi thông tin đến server ---
    async function sendInformation(information, type) {
        const url = type === "login" 
            ? 'http://localhost:5000/login' 
            : 'http://localhost:5000/register';

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(information)
        });

        const responseJSON = await response.json();

        if (responseJSON.message === 'Fail-register') {
            setPopup(1);
            setPopupType("Error");
            setPopupContent("Email đã sử dụng cho tài khoản khác");
            return false;
        }
        if (responseJSON.message === 'Fail-login') {
            setPopup(1);
            setPopupType("Error");
            setPopupContent("Email chưa được đăng ký");
            return false;
        }
        if (responseJSON.message === 'Fail-login2') {
            setPopup(1);
            setPopupType("Error");
            setPopupContent("Mật khẩu không đúng");
            return false;
        }

        if (type === "login" && responseJSON.token) {
            localStorage.setItem('token', responseJSON.token);
        }

        return true;
    }

    // --- Xử lý đăng nhập ---
    async function Login() {
        let hasError = false;

        if (email.trim() === '') {
            setEmailError(true);
            setEmailPlaceholder('Chưa nhập email');
            hasError = true;
        } else if (!isValidEmail(email)) {
            setEmailError(true);
            setEmail('');
            setEmailPlaceholder('Email không hợp lệ');
            hasError = true;
        } else {
            setEmailError(false);
            setEmailPlaceholder('Email');
        }

        if (password.trim() === '') {
            setPasswordError(true);
            setPasswordPlaceholder('Chưa nhập mật khẩu');
            hasError = true;
        }

        if (!hasError) {
            const information = { email, password };
            const success = await sendInformation(information, "login");
            if (success) {
                setIsLoggedIn(true);
                handleMove('login');
                navigate('/workingpage');
            }
        }
    }

    // --- Xử lý đăng ký ---
    async function Register() {
        let hasError = false;

        if (regEmail.trim() === '') {
            setRegEmailErr(true);
            setRegEmailPlaceholder('Chưa nhập email');
            hasError = true;
        } else if (!isValidEmail(regEmail)) {
            setRegEmailErr(true);
            setRegEmail('');
            setRegEmailPlaceholder('Email không hợp lệ');
            hasError = true;
        } else {
            setRegEmailErr(false);
            setRegEmailPlaceholder('Email');
        }

        if (regPass.trim() === '') {
            setRegPassErr(true);
            setRegPassPlaceholder('Chưa nhập mật khẩu');
            hasError = true;
        } else {
            setRegPassErr(false);
            setRegPassPlaceholder('Tạo mật khẩu');
        }

        if (regConfirm.trim() === '') {
            setRegConfirmErr(true);
            setRegConfirmPlaceholder('Chưa nhập lại mật khẩu');
            hasError = true;
        } else if (regPass !== regConfirm) {
            setRegConfirmErr(true);
            setPopup(1);
            setPopupType("Error");
            setPopupContent("Mật khẩu không khớp");
            hasError = true;
        } else {
            setRegConfirmErr(false);
            setRegConfirmPlaceholder('Nhập lại mật khẩu');
        }

        if (!hasError) {
            const information = {
                userName: 'user123',
                email: regEmail,
                password: regPass,
                farms: [
                    {
                        email: regEmail,
                        farmId: 1,
                        farmName: 'Trang trại A',
                        sensors: [],
                        devices: []
                    }
                ]
            };

            information.farms[0].sensors = [
                { name: 'Cảm biến nhiệt độ', image: 'temperatureSensor', min: 20, max: 35 },
                { name: 'Cảm biến ánh sáng', image: 'lightSensor', min: 22, max: 33 },
                { name: 'Cảm biến độ ẩm đất', image: 'soilMoistureSensor', min: 22, max: 33 },
                { name: 'Cảm biến độ ẩm không khí', image: 'airHumiditySensor', min: 22, max: 33 }
            ].map(sensor => ({ ...sensor, email: regEmail, farmId: 1, date: getCurrentDateTime() }));

            information.farms[0].devices = [
                { name: 'Đèn led', image: 'led' },
                { name: 'Máy bơm', image: 'pump' }
            ].map(device => ({ ...device, email: regEmail, farmId: 1, state: "Off", date: getCurrentDateTime() }));
            const success = await sendInformation(information, "register");
            if (success) {
                setPopup(1);
                setPopupType("Success");
                setPopupContent("Đăng ký thành công");
                handleMove('login');
            }
        }
    }
    return (
        <>
            <div className="main-content">
                <h2>Smart Farm</h2>
                <p className="intro-text">
                    Nền tảng hỗ trợ quản lý nông trại hiệu quả.
                </p>
                <p className='intro-text2'>Cảm ơn bạn đã tin tưởng lựa chọn chúng tôi.</p>
                <p className='intro-text2'>Nếu có bất kỳ thắc mắc nào chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
            </div>

            <div className="login-box" ref={loginRef}>
                <p className="login-text">Login</p>
                <div className="input-box">
                    <div className="input-bar">
                        <input
                            type="email"
                            placeholder={emailPlaceholder}
                            className={emailError ? 'error' : ''}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <i className="bi bi-envelope"></i>
                    </div>
                    <div className="input-bar">
                        <input
                            type="password"
                            placeholder={passwordPlaceholder}
                            className={passwordError ? 'error' : ''}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <i className="bi bi-key"></i>
                    </div>
                </div>
                <p style={{ color: '#90EE90', cursor: 'pointer', fontSize: '13px' }} onClick={() => handleMove('forgot')}>
                    Quên mật khẩu?
                </p>
                <div className="log-box">
                    <button onClick={Login}>Login</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <p style={{ color:'white', margin: 0, fontSize: '13px' }}>Chưa có tài khoản?</p>
                    <p className="p1" style={{ color: '#90EE90', cursor: 'pointer', margin: 0 }} onClick={() => handleMove('register')}>
                        Đăng kí
                    </p>
                </div>
            </div>

            <div className="register-box" ref={registerRef}>
                <div className="login-bar">
                    <p className="login-text">Register</p>
                </div>
                <div className="input-box">
                    <div className="input-bar">
                        <input
                            type="email"
                            placeholder={regEmailPlaceholder}
                            className={regEmailErr ? 'error' : ''}
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                        />
                        <i className="bi bi-envelope"></i>
                    </div>
                    <div className="input-bar">
                        <input
                            type="password"
                            placeholder={regPassPlaceholder}
                            className={regPassErr ? 'error' : ''}
                            value={regPass}
                            onChange={(e) => setRegPass(e.target.value)}
                        />
                        <i className="bi bi-key"></i>
                    </div>
                    <div className="input-bar">
                        <input
                            type="password"
                            placeholder={regConfirmPlaceholder}
                            className={regConfirmErr ? 'error' : ''}
                            value={regConfirm}
                            onChange={(e) => setRegConfirm(e.target.value)}
                        />
                        <i className="bi bi-check"></i>
                    </div>
                </div>
                <div className="log-box">
                    <button onClick={Register}>
                        <div className="log-animation"></div>Đăng kí
                    </button>
                </div>
                <p style={{ color: '#90EE90', cursor: 'pointer', fontSize: '14px' }} onClick={() => handleMove('login')}>
                    Quay lại đăng nhập
                </p>
            </div>

            <div className="forgot-box" ref={forgotRef}>
                <div className="login-bar">
                    <p className="login-text">Forgot Password</p>
                </div>
                <div className="input-box">
                    {inputConfigs.forgot.map((item, idx) => (
                        <div key={idx} className="input-bar">
                            <input type={item.type} placeholder={item.placeholder} />
                            <i className="bi bi-envelope"></i>
                        </div>
                    ))}
                </div>
                <div className="log-box">
                    <button>
                        <div className="log-animation"></div>Gửi
                    </button>
                </div>
                <p style={{ color: '#90EE90', cursor: 'pointer', fontSize: '14px' }} onClick={() => handleMove('login')}>
                    Quay lại đăng nhập
                </p>
            </div>
            <div className='popup' style={{display: popup === 1 ? 'block' : 'none'}}>
                <p>{popupType}</p>
                <div className='popup-content'>
                    <p>{popupContent}</p>
                    <button onClick={()=>setPopup(0)}>Ok</button>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Homepage1;
