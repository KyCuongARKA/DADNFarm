import './information.css'
import avatar from '../../assets/avatar.png';
import { useEffect, useState, useRef } from 'react';
import { useUser } from '../UserContext/usercontext';
function Information(){
    
    const [popup, setPopup] = useState(0);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [popupContent, setPopupContent] = useState("");
    const [isEditTing, setIsEditTing] = useState(false);
    const [onchangeUserName, setOnchangeUserName] = useState('');
    const {userName, setUserName, email} = useUser();
    async function handleChangePassword(password){
        const response = await fetch('http://localhost:5000/changepassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(password)
        })
        const responseJSON = await response.json();
        if(responseJSON.message === 'Fail'){
            setPopup(1);
            setPopupType("Error");
            setPopupContent("Mật khẩu không đúng");
            return false;
        }
        else return true;
    }
    const userNameInputRef = useRef(null);
    async function changeUserName(infor) {
        try {
            const response = await fetch('http://localhost:5000/changeusername', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(infor)
            });
            const responseJSON = await response.json();
    
            if (response.ok && responseJSON.message === 'Success') {
                setOnchangeUserName(infor.userName);
                setUserName(infor.userName);
            } else {
                throw new Error("Đổi tên thất bại");
            }
        } catch (error) {
            setPopup(1);
            setPopupType("Error");
            setPopupContent("Đã xảy ra lỗi khi đổi tên");
        }
    }
    
    function handleChangeUserName() {
        const rawInput = userNameInputRef.current?.value ?? '';
        const newUserName = rawInput.trim(); 
        if (newUserName === '') {
            setIsEditTing(false);
            return;
        }
    
        if (newUserName.length > 12) {
            setPopup(1);
            setPopupType("Error");
            setPopupContent("User name vượt quá 12 kí tự");
            userNameInputRef.current.value = '';
            setIsEditTing(false);
            return;
        }
    
        const infor = { userName: newUserName, email: email };
        changeUserName(infor);
        userNameInputRef.current.value = '';
        setIsEditTing(false);
    }
    const currentPassword = useRef(null);
    const newPassword = useRef(null);
    async function changePassword(){
        const current = currentPassword.current.value;
        const newPass = newPassword.current.value;
        if (current === '') {
            setPopup(1);
            setPopupType('Error');
            setPopupContent('Chưa nhập mật khẩu');
            return;
        }
        if (newPass === '') {
            setPopup(1);
            setPopupType('Error');
            setPopupContent('Chưa nhập mật khẩu mới');
            return;
        }
    
        const password = { email, currentPassword: current, newPassword: newPass };
        const success = await handleChangePassword(password);
        if (success) {
            setPopup(1);
            setPopupType('Success');
            setPopupContent('Đổi mật khẩu thành công');
            currentPassword.current.value = '';
            newPassword.current.value = '';
            setIsChangingPassword(false);
        }
    }
    return (
        <>
            <div className="infor-box">
                <div className="infor-user-left">
                    <img src={avatar} />
                    <p>{userName}</p>
                </div>
                <div className='infor-user'>
                        <div className='element' style={{marginTop: '30px'}}>
                            <p>
                                Name: <span style={{ display: isEditTing ? 'none' : 'inline' }}> {userName} </span>
                            </p>
                            <input className='Input' ref = {userNameInputRef} type="text" onChange={(e)=>setOnchangeUserName(e.target.value)} style={{display: isEditTing ? '' : 'none'}}/>
                            </div>
                        <div className='element'>
                            <p>Email: {email}</p>
                        </div>
                        <button onClick={()=>setIsChangingPassword(true)} style={{ display: isChangingPassword ? 'none' : '' }}>Đổi mật khẩu</button>
                        <div className='element' style={{ display: isChangingPassword ? 'flex' : 'none' }}> 
                            <p style={{paddingRight: '12px' }}>Nhập mật khẩu hiện tại: </p><input  className='Input' type='password' ref={currentPassword}/>
                        </div>
                        <div onClick={handleChangePassword} className='element' style={{ display: isChangingPassword ? 'flex' : 'none'}}> 
                            <p style={{paddingRight: '35px' }}>Nhập mật khẩu mới: </p><input className='Input' type='password' ref={newPassword}/>
                        </div>
                        <button onClick={changePassword} style={{ display: isChangingPassword ? '' : 'none', marginBottom: '10px' }}>Đổi mật khẩu</button>
                        <button onClick={()=>setIsChangingPassword(false)} style={{ display: isChangingPassword ? '' : 'none' , marginBottom: '10px'}}>Hủy</button>
                </div>
                <div className='infor-user' style={{marginTop: '30px'}}>
                    <div className='element'>
                        <i className='bi bi-pencil-square' 
                            onClick={()=>setIsEditTing(true)}
                            style={{display: isEditTing ? 'none' : ''}}/>
                        <i className='bi bi-check-square-fill' 
                            onClick={()=>handleChangeUserName()}
                            style={{display: isEditTing ? '' : 'none'}}/>
                    </div>
                </div>
            </div>
            <div className='popup' style={{display: popup === 1 ? 'block' : 'none'}}>
                <p>{popupType}</p>
                <div className='popup-content'>
                    <p>{popupContent}</p>
                    <button onClick={()=>setPopup(0)}>Ok</button>
                </div>
            </div>
        </>
    )
}
export default Information;