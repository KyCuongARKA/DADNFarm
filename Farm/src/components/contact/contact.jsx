import './contact.css'
import rice from '../../assets/rice.png'
function Contact(){
    return <>
                <div className='overlay2'></div>
                <div className="contactBox">
                    <div className="contactLeft">
                        <h2>Contact</h2>
                        <p className='p1'>Bạn không chắc chắn về những gì bạn cần? Đội ngũ tại Smart Farm sẽ rất vui lòng lắng nghe và hỗ trợ bạn</p>
                        <p>Email: phu.nguyenminhphu@hcmut.edu.vn</p>
                        <p>Phone: 0123456789 </p>
                    </div>
                    <div className="contactRight">
                        <h3>Chúng tôi rất mong nhận được phản hồi từ bạn!</h3>
                        <form>
                            <div className="formRow">
                                <input type="text" placeholder="Tiêu đề" />
                            </div>
                            <div className="formRow">
                                <input type="email" placeholder="Email" />
                            </div>
                            <textarea placeholder="Nội dung"></textarea>
                            <button>Gửi</button>
                        </form>
                    </div>
                </div>
                <img className="rice" src={rice}/>
           </>
}
export default Contact;