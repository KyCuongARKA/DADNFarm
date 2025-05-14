// components/Footer.jsx
import '../footer/footer.css'
function Footer() {
    return (
        <div className="footer">
            <div className="contact">
                <p className="web-name">Smart Farm</p>
                <p style={{ marginRight: "102px" }}>© 2025 Smart Farm. All rights reserved.</p>
                <p style={{ marginRight: "102px" }}>Email: phu.nguyenminhphu@hcmut.edu.vn</p>
                <p>Phone number: 0123456789</p>
            </div>
            <div className="by">
                <p>©2025. Design by Group</p>
                <div className="icon-bar">
                    {[
                        { name: "youtube", color: "#90EE90" },
                        { name: "facebook", color: "#90EE90" },
                        { name: "telephone-fill", color: "#90EE90" }
                    ].map((e, index) => (
                        <i key={index} className={`bi-${e.name}`} style={{ color: e.color, cursor: "pointer" }}></i>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Footer;
