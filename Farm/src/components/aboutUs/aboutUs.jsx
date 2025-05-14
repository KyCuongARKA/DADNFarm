import './aboutUs.css';
import img from '../../assets/img.jpg';
import model1 from '../../assets/3D-1.png';
import model2 from '../../assets/3D-2.png';
function AboutUs() {
    return (
        <>
            <div className="overlay"></div>
            <div className="about-us">
                <div className="about-text">
                    <h2> About us</h2>
                    <p>Nông trại Thông minh! Sự kết hợp Internet of Things (IoT) và quản lý thông minh.</p> 
                    <p> Mang đến các giải pháp nông nghiệp tiên tiến, tối ưu hóa năng suất và bảo vệ môi trường.</p>
                    <p>Cùng nhau, chúng ta tạo ra thực phẩm chất lượng, đóng góp vào sự phát triển bền vững của Trái Đất.</p>
                    <div className="contact-info">
                        <p>Phone: 0123456789</p>
                        <p>Email: phu.nguyenminhphu@gmail.com</p>
                    </div>
                </div>
                <div className='about-image'>
                    <img className='main-img' src={img} alt="About Us" />
                    <img className='model1' src = {model1}/>
                    <img className='model2' src = {model2}/>
                </div>
            </div>
        </>
    );
}

export default AboutUs;
