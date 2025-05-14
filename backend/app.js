const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const port = 5000;
const JWT_SECRET = 'your_jwt_secret';

app.use(cors());
app.use(express.json());
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let collection, collectionFarms, collectionSensors, collectionDevices;

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,               
    secure: false, 
    auth: {
        user: "phu.nguyenminhphu@hcmut.edu.vn",
        pass: "watn qost vbvk ipwu",
    }
});

app.post('/notification-email', async (req, res) => {
    const { to, subject, text } = req.body;
    if (!to || !subject || !text) {
        return res.status(400).json({ error: 'Missing email data' });
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(to)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    const mailOptions = {
        from: '"SmartFarm" <phu.nguyenminhphu@hcmut.edu.vn>',
        to,
        subject,
        text,
    };
    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Email sent successfully' });
    } catch (err) {
        console.error('Lỗi gửi email:', err);
        res.status(500).json({ success: false, error: 'Failed to send email', details: err.message });
    }
});

async function connectDB() {
    try {
        await client.connect();
        const db = client.db('farm-account');
        collection = db.collection('users');
        collectionFarms = db.collection('farms');
        collectionSensors = db.collection('sensors');
        collectionDevices = db.collection('devices');

        console.log('Đã kết nối MongoDB');
    } catch (err) {
        console.error('Không thể kết nối MongoDB:', err);
    }
}

app.post('/register', async (req, res) => {
    const information = req.body;
    const hashedPassword = await bcrypt.hash(information.password, 10);
    try {
        const existingUser = await collection.findOne({email: information.email});
        if (existingUser) return res.json({ message: 'Fail-register' });
        await collection.insertOne({ userName:information.userName, email: information.email, password: hashedPassword, value: information.value });
        await collectionFarms.insertMany(information.farms.map((element)=>(
            {
                email: element.email,
                farmId: element.farmId, 
                farmName: element.farmName
            }
        )));
        await collectionSensors.insertMany(information.farms.flatMap(farm=>(
            farm.sensors.map(element=>(
                {
                    email: element.email,
                    farmId: element.farmId,
                    state: element.state,
                    image: element.image,
                    name: element.name,
                    min: element.min,
                    max: element.max,
                    date: element.date
                }
            ))
        )))
        await collectionDevices.insertMany(information.farms.flatMap(farm=>(
            farm.devices.map(element=>(
                {
                    email: element.email,
                    farmId: element.farmId,
                    state: element.state,
                    image: element.image,
                    name: element.name,
                    automatic: element.automatic,
                    date: element.date
                }
            ))
        )))
        res.json({ message: 'Success' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await collection.findOne({ email });
        if (!user){
            return req.json({message: 'Fail-login'});
        }
        else if(!(await bcrypt.compare(password, user.password))){
            return res.json({ message: 'Fail-login2' });
        }
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '10h' });
        res.json({ message: 'Success', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/data', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Missing token' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const email = decoded.email;
        const user = await collection.findOne({ email: email });
        const value = user?.value;
        const userName = user?.userName;
        const farms = await collectionFarms.find({ email: email }).toArray();
        const sensors = await collectionSensors.find({ email: email }).toArray();
        const devices = await collectionDevices.find({ email: email }).toArray();

        res.json({ message: 'Success', email, userName, farms, sensors, devices, value });
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Invalid token' });
    }
});

app.post('/changeusername', async (req, res)=>{
    try{
        const {userName, email} = req.body;
        if (!userName || !email) {
            return res.status(400).json({ message: 'Missing userName or email' });
        }
        const result = await collection.updateOne(
            { email: email },
            { $set: { userName: userName } }
        );
        if(result){
            res.json({message: 'Success'});
        }
        else{
            res.json({message: 'user not found'})
        }
    }
    catch(err){
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})
app.post('/changepassword', async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    try {
        const user = await collection.findOne({ email });
        if (!user || !(await bcrypt.compare(currentPassword, user.password)))
            return res.json({ message: 'Fail' });
        else{
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const result = await collection.updateOne(
                { email: email },
                { $set: { password: hashedPassword} }
            );
            if(result){
                res.json({message: 'Success'});
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/switch', async (req, res) => {
    const { email, farmId, deviceName, state } = req.body;
    const feedName = (deviceName === 'Đèn led') ? 'b1' : 'b2'; 
    if (typeof deviceName === 'undefined' || typeof state === 'undefined') {
        return res.status(400).json({ message: 'Thiếu "deviceName" hoặc "state" trong body' });
    }
    try {
        const result = await collectionDevices.updateOne(
            { email, farmId, name: deviceName },
            { $set: { state } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thiết bị hoặc không có gì thay đổi' });
        }
        if (feedName) {
            const response = await fetch(`/feed/${feedName}/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ value: state === "On" ? "1" : "0" })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Lỗi khi gửi dữ liệu tới /feed/${feedName}/send`);
            }
        }
        return res.json({ success: true });
    } catch (err) {
        console.error('Lỗi trong /switch:', err);
        return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
});

app.post('/minmaxupdate', async (req, res)=>{
    const { email, farmId, name, min, max } = req.body;
    try {
        const result = await collectionSensors.updateOne(
            {
                email: email,
                farmId: farmId,
                name: name
            },
            {
                $set: { min: min, max: max }
            }
        );
        if (!result) {
            return res.status(404).json({ message: 'Sensors not found' });
        }
        res.json({ success: true});
    } catch (err) {
        console.error('Lỗi trong /minmaxupdate:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
})
app.listen(port, async () => {
    await connectDB();
    console.log(`Server chạy tại http://localhost:${port}`);
});




const AIO_USERNAME = "buitheky";
const AIO_KEY = "aio_DNKS710h2USMuY3ginDuY6iK9QwX";
const BASE_URL = `https://io.adafruit.com/api/v2/${AIO_USERNAME}`;

// Service:
const getLatestFeedData = async (feedName) => {
  const url = `${BASE_URL}/feeds/${feedName}/data?limit=1`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-AIO-Key": AIO_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Lỗi khi lấy dữ liệu mới nhất: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.length === 0) return null;
  return data[0].value;
};

// Controller: API lấy dữ liệu mới nhất của feed
app.get("/feed/:name", async (req, res) => {
  const feedName = req.params.name;

  try {
    const result = await getLatestFeedData(feedName);
    if (result === null) {
      return res.status(404).json({ error: "Dữ liệu không có sẵn" });
    }
    return res.status(200).json({ value: result });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Lỗi khi gọi API Adafruit" });
  }
});




