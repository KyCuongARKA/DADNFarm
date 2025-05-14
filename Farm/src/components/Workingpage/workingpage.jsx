import { useRef, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import lightSensor from '../../assets/light-sensor.png';
import temperatureSensor from '../../assets/temperature-sensor.png';
import soilMoistureSensor from '../../assets/soil-moisture-sensor.png';
import airHumiditySensor from '../../assets/air-humidity-sensor.png';
import pump from '../../assets/pump.png';
import led from '../../assets/led.png';

import './workingpage.css';

function Workingpage() {
    const token = localStorage.getItem('token');
    const queryClient = useQueryClient();

    const [tempNow, setTempNow] = useState();
    const [moilA, setMoilA] = useState();
    const [moilD, setMoilD] = useState();
    const [lux, setLux] = useState();
    const [val, setVal] = useState();

    const [farms, setFarms] = useState([]);
    const [sensors, setSensors] = useState([]);
    const [devices, setDevices] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedFarm, setSelectedFarm] = useState(null);
    const [image, setImage] = useState(null);
    const [mode, setMode] = useState("sensor");

    const sensorRef = useRef(null);
    const deviceRef = useRef(null);

    const imageMap = {
        'lightSensor': lightSensor,
        'temperatureSensor': temperatureSensor,
        'soilMoistureSensor': soilMoistureSensor,
        'airHumiditySensor': airHumiditySensor,
        'led': led,
        'pump': pump
    };

    const { data, refetch } = useQuery({
        queryKey: ['data'],
        queryFn: async () => {
            const response = await fetch('http://localhost:5000/data', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        },
    });

    useEffect(() => {
        if (data&&!selectedItem) {
            setDevices(data.devices || []);
            setSensors(data.sensors || []);
            setFarms(data.farms || []);
            const firstSensor = data.sensors?.[0];
            setSelectedItem(firstSensor || null);
            setImage(imageMap[firstSensor?.image] || null);
            setSelectedFarm(data.farms?.[0] || null);
        }
        else if (data && selectedItem) {
            setDevices(data.devices || []);
            setSensors(data.sensors || []);
            setFarms(data.farms || []);

            const matchedDevice = data.devices?.find(device => device._id === selectedItem._id);
            const matchedSensor = data.sensors?.find(sensor=> sensor._id === selectedItem._id);
            if (matchedDevice) {
                setSelectedItem(matchedDevice);
                setImage(imageMap[matchedDevice.image] || null);
            } 
            else if(matchedSensor) {
                setSelectedItem(matchedSensor);
                setImage(imageMap[matchedSensor.image] || null);
            }

            const currentFarmStillExists = data.farms?.some(f => f._id === selectedFarm?._id);
            if (!currentFarmStillExists) {
                setSelectedFarm(data.farms?.[0] || null);
            }
        }

    }, [data]);

    useEffect(() => {
        if(data){
            if (mode === "sensor") {
                const firstSensor = data.sensors?.[0];
                setSelectedItem(firstSensor || null);
                setImage(imageMap[firstSensor?.image] || null);
                sensorRef.current.classList.add("active");
                deviceRef.current.classList.remove("active");
            }
            else{
                const firstDevice = data.devices?.[0];
                setSelectedItem(firstDevice || null);
                setImage(imageMap[firstDevice?.image] || null);
                sensorRef.current.classList.remove("active");
                deviceRef.current.classList.add("active");
            }
        }
    }, [mode]);
    const [sensorsAutomaticArray, setSensorsAutomaticArray] = useState(['On', 'On', 'On', 'On']);
    const [devicesAutomaticArray, setDevicesAutomaticArray] = useState(['On', 'On']);
    const handleSetVal = useCallback(() => {
        if (!selectedItem) return;
        if (selectedItem.name === "Cảm biến nhiệt độ") {
            if(sensorsAutomaticArray[0] === 'On'){
                setVal(tempNow);
            }
            else {
                setVal('Đã ngắt kết nối');
            }
        } else if (selectedItem.name === "Cảm biến ánh sáng") {
            if(sensorsAutomaticArray[1] === 'On'){
                setVal(lux);
            }
            else {
                setVal('Đã ngắt kết nối');
            }
        } else if (selectedItem.name === "Cảm biến độ ẩm đất") {
            if(sensorsAutomaticArray[2] === 'On'){
                setVal(moilD);
            }
            else {
                setVal('Đã ngắt kết nối');
            }
        } else {
            if(sensorsAutomaticArray[3] === 'On'){
                setVal(moilA);
            }
            else {
                setVal('Đã ngắt kết nối');
            }
        }
    }, [selectedItem, tempNow, lux, moilD, moilA, sensorsAutomaticArray]);
    const [tempNof, setTempNof] = useState(0); 
    const [moilANof, setMoilANof] = useState(0);
    const [moilDNof, setMoilDNof] = useState(0);
    const [luxNof, setLuxNof] = useState(0);
    const getData = useCallback(async () => {
        if (!selectedItem) return;
        try {
            let resTemp, resMoilA, resMoilD, resLux;
            if(sensorsAutomaticArray[idMap["Cảm biến nhiệt độ"]] === "On"){
                resTemp = await fetch('http://localhost:5000/feed/v1');
                const json1 = await resTemp.json();
                setTempNow(json1.value);
                if (selectedItem.name === "Cảm biến nhiệt độ") setVal(json1.value);
                if (json1.value < data.sensors[0].min) {
                    setTempNof(1);
                    if (Date.now() - lastSentTimeRef.current['nhiệt độ'] > 15 * 60 * 1000) {
                        EmailNotification("thấp", "Nhiệt độ");
                        lastSentTimeRef.current['nhiệt độ'] = Date.now();
                    }
                }
                else if(json1.value>data.sensors[0].max){
                    setTempNof(1);
                    if (Date.now() - lastSentTimeRef.current['nhiệt độ'] > 15 * 60 * 1000) {
                        EmailNotification("cao", "Nhiệt độ");
                        lastSentTimeRef.current['nhiệt độ'] = Date.now();
                    }
                }
                else{
                    setTempNof(0);
                }
            }
            if(sensorsAutomaticArray[idMap["Cảm biến độ ẩm không khí"]] === "On"){
                resMoilA = await fetch('http://localhost:5000/feed/v2');
                const json2 = await resMoilA.json();
                setMoilA(json2.value);
                if (selectedItem.name === "Cảm biến độ ẩm không khí") setVal(json2.value);
                if(json2.value<data.sensors[3].min){
                    setMoilANof(1);
                    if (Date.now() - lastSentTimeRef.current['độ ẩm không khí'] > 15 * 60 * 1000) {
                        EmailNotification("thấp", "Độ ẩm không khí");
                        lastSentTimeRef.current['độ ẩm không khí'] = Date.now();
                    }
                }
                else if(json2.value>data.sensors[3].max){
                    setMoilANof(1);
                    if (Date.now() - lastSentTimeRef.current['độ ẩm không khí'] > 15 * 60 * 1000) {
                        EmailNotification("cao", "Độ ẩm không khí");
                        lastSentTimeRef.current['độ ẩm không khí'] = Date.now();
                    }
                }
                else{
                    setMoilANof(0);
                }
            }
            if(sensorsAutomaticArray[idMap["Cảm biến độ ẩm đất"]] === "On"){
                resMoilD = await fetch('http://localhost:5000/feed/v3');
                const json3 = await resMoilD.json();
                setMoilD(json3.value);
                if (selectedItem.name === "Cảm biến độ ẩm đất") setVal(json3.value);
                if(json3.value<data.sensors[2].min){
                    setMoilDNof(1);
                    if (Date.now() - lastSentTimeRef.current['độ ẩm đất'] > 15 * 60 * 1000) {
                        EmailNotification("thấp", "Độ ẩm đất");
                        lastSentTimeRef.current['độ ẩm đất'] = Date.now();
                    }
                    if(devicesAutomaticArray[1] === 'On') autoTurn("On", 1);
                }
                else if(json3.value>data.sensors[2].max){
                    setMoilDNof(1);
                    if (Date.now() - lastSentTimeRef.current['độ ẩm đất'] > 15 * 60 * 1000) {
                        EmailNotification("cao", "Độ ẩm đất");
                        lastSentTimeRef.current['độ ẩm đất'] = Date.now();
                    }
                    if(devicesAutomaticArray[1] === 'On') autoTurn("Off", 1);
                }
                else{
                    setMoilDNof(0);
                    if(devicesAutomaticArray[1] === 'On') autoTurn("Off", 1);
                }
            }
            if(sensorsAutomaticArray[idMap["Cảm biến ánh sáng"]] === "On"){
                resLux =  await fetch('http://localhost:5000/feed/v4');
                const json4 = await resLux.json();
                setLux(json4.value);
                if (selectedItem.name === "Cảm biến ánh sáng") setVal(json4.value);
                if(json4.value<data.sensors[1].min){
                    console.log(json4.value);
                    console.log(data.sensors[1].min);
                    if(devicesAutomaticArray[0] === 'On') {
                        autoTurn("On", 0);
                    }
                    setLuxNof(1);
                    if (Date.now() - lastSentTimeRef.current['ánh sáng'] > 15 * 60 * 1000) {
                        EmailNotification("thấp", "Ánh sáng");
                        lastSentTimeRef.current['ánh sáng'] = Date.now();
                    }
                }
                else if(json4.value>data.sensors[1].max){
                    console.log(json4.value);
                    console.log(data.sensors[1].max);
                    if(devicesAutomaticArray[0] === 'On') autoTurn("Off", 0);
                    setLuxNof(1);
                    if (Date.now() - lastSentTimeRef.current['ánh sáng'] > 15 * 60 * 1000) {
                        EmailNotification("cao", "Ánh sáng");
                        lastSentTimeRef.current['ánh sáng'] = Date.now();
                    }
                }
                else{
                    if(devicesAutomaticArray[0] === 'On') autoTurn("Off", 0);
                    setLuxNof(0);
                }
            }
        } catch (err) {
            console.error("Lỗi fetch dữ liệu feed:", err);
        }
    }, [selectedItem, sensorsAutomaticArray, devicesAutomaticArray]);
    const lastSentTimeRef = useRef({
        'nhiệt độ': Date.now() - 16 * 60 * 1000,
        'độ ẩm đất': Date.now() - 16 * 60 * 1000,
        'độ ẩm không khí': Date.now() - 16 * 60 * 1000,
        'ánh sáng': Date.now() - 16 * 60 * 1000,
    });
    async function EmailNotification(type, sensor) {
        const message = `${sensor} đang ${type} vượt ngưỡng cho phép!`;
        try {
            const res = await fetch('http://localhost:5000/notification-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: `${selectedItem.email}`,
                    subject: `Cảnh báo: ${sensor} ${type} vượt ngưỡng`,
                    text: message
                })
            });
            const result = await res.json();
            console.log(result.message);    
            if (!res.ok) {
                throw new Error(`Lỗi gửi email: ${res.status}`);
            }
        } catch (err) {
            console.error('Lỗi khi gửi EmailNotification:', err);
        }
    }
    async function autoTurn(state, id) {
        const currentDevice = data.devices[id];
        if (!currentDevice) return;
        
        // Nếu trạng thái hiện tại đã đúng, không cần gọi API
        if (state === currentDevice.state) return;

        try {
            const res = await turnSwitch({
                email: currentDevice.email,
                farmId: currentDevice.farmId,
                deviceName: currentDevice.name,
                state: state   // dùng đúng state được truyền vào
            });

            if (res?.success) {
                refetch();
            } else {
                console.error('Gọi API thất bại:', res);
            }
        } catch (err) {
            console.error('Lỗi khi gọi API autoTurn:', err);
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            getData();
        }, 20000);
        return () => clearInterval(interval);
    }, [getData]);

    function handleMode(mode) {
        setMode(mode);
    }
    function handleDeviceAutomatic(id){
        setDevicesAutomaticArray(prev => {
            const newArray = [...prev]; 
            newArray[id] = devicesAutomaticArray[id] === 'On' ? 'Off' : 'On';   
            return newArray;              
        });
    }
    async function handleStateDevices(id) {
        if(mode==='sensor'){
            setSensorsAutomaticArray(prev => {
                const newArray = [...prev]; 
                newArray[id] = sensorsAutomaticArray[id] === 'On' ? 'Off' : 'On';   
                if (newArray[id] === 'Off') {
                    if (id === 0) setTempNof(0);
                    else if (id === 1) setLuxNof(0);
                    else if (id === 2) setMoilDNof(0);
                    else if (id === 3) setMoilANof(0);
                }        
                return newArray;              
            });
        }
        else{
            if (!selectedItem) return;
            const newState = selectedItem.state === "On" ? "Off" : "On";
            const res = await turnSwitch({
                email: selectedItem.email,
                farmId: selectedItem.farmId,
                deviceName: selectedItem.name,
                state: newState
            });
            if (res?.success) {
                refetch();
            }
        }
    }
    async function turnSwitch(stateVal) {
        try {
            const response = await fetch('http://localhost:5000/switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stateVal)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseJSON = await response.json();
            return responseJSON;
        } catch (err) {
            console.error('Lỗi khi gọi API /switch:', err);
            return null;
        }
    }
    useEffect(() => {
        handleSetVal();
    }, [selectedItem, handleSetVal]);
    const idMap = {
        'Cảm biến nhiệt độ': 0,
        'Cảm biến ánh sáng': 1, 
        'Cảm biến độ ẩm đất': 2,
        'Cảm biến độ ẩm không khí': 3,
        'Đèn led': 0,
        'Máy bơm': 1,
    }
    const minRef = useRef(null);
    const maxRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    async function confirmEdit() {
        const rawMin = minRef.current.value;
        const rawMax = maxRef.current.value;
        const parsedMin = rawMin !== '' ? Number(rawMin) : null;
        const parsedMax = rawMax !== '' ? Number(rawMax) : null;
        if (rawMin !== '' && isNaN(parsedMin)) {
            minRef.current.value = '';
            setIsEditing(false);
            return;
        }
        if (rawMax !== '' && isNaN(parsedMax)) {
            maxRef.current.value = '';
            setIsEditing(false);
            return;
        }
        if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
            maxRef.current.value = '';
            setIsEditing(false);
            return;
        }
        const infor = {
            email: selectedItem.email,
            farmId: selectedItem.farmId,
            name: selectedItem.name,
            min: parsedMin !== null ? parsedMin : selectedItem.min,
            max: parsedMax !== null ? parsedMax : selectedItem.max
        };
        try {
            const response = await fetch('http://localhost:5000/minmaxupdate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(infor)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            minRef.current.value = '';
            maxRef.current.value = '';
            setIsEditing(false);
            refetch();
        } catch (err) {
            console.error('Lỗi khi gọi API /minmaxupdate:', err);
        }
    }
    return (
        <>
            <div className="overlay3"></div>
            <div className="working-box">
                <div className='loca_notifi'>
                    <div className='notification'>
                        <h2>Thông báo</h2>
                        <div className='farm-list'>
                                <div
                                    className='farm'
                                    style={{display: tempNof === 1 ? '' : 'none'}}>
                                    <p />Nhiệt độ đang vượt ngưỡng 
                                </div>
                                <div
                                    className='farm'
                                    style={{display: luxNof === 1 ? '' : 'none'}}>
                                    <p />Độ sáng đang vượt ngưỡng
                                </div>
                                <div
                                    className='farm'
                                    style={{display: moilDNof === 1 ? '' : 'none'}}>
                                    <p />Độ ẩm đất đang vượt ngưỡng
                                </div>
                                <div
                                    className='farm'
                                    style={{display: moilANof === 1 ? '' : 'none'}}>
                                    <p />Độ ẩm không khí đang vượt ngưỡng
                                </div>
                        </div>
                    </div>
                    <div className="location">
                        <h2>Vị Trí</h2>
                        <div className='farm-list'>
                            {farms.map((farm, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedFarm(farm)}
                                    className='farm'
                                    style={{
                                        cursor: 'pointer',
                                        border: selectedFarm === farm ? '2px solid #90EE90' : ""
                                    }}>
                                    <p />{farm.farmName}
                                </div>
                            ))}
                        </div>
                        <button className='spec-but'>Thêm vị trí</button>
                    </div>
                    
                </div>
                <div className='working-space'>
                    <div className='menu-bar'>
                        <div ref={sensorRef} onClick={() => handleMode("sensor")} className='menu-element'>Cảm biến</div>
                        <div ref={deviceRef} onClick={() => handleMode("device")} className='menu-element'>Thiết bị</div>
                    </div>

                    <div className='table'>
                        <table border="1" style={{ display: mode === 'sensor' ? '' : 'none' }}>
                            <colgroup>
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '45%' }} />
                                <col style={{ width: '45%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Tên cảm biến</th>
                                    <th>Ngày thêm</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sensors
                                    .filter(sensor => selectedFarm && sensor.farmId === selectedFarm.farmId)
                                    .map((sensor, index) => (
                                        <tr key={index} onClick={() => {
                                            setSelectedItem(sensor);
                                            setImage(imageMap[sensor.image]);
                                        }}>
                                            <td>{index + 1}</td>
                                            <td>{sensor.name}</td>
                                            <td>{sensor.date}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                        <table border="1" style={{ display: mode === 'device' ? '' : 'none' }}>
                            <colgroup>
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '45%' }} />
                                <col style={{ width: '45%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Tên thiết bị</th>
                                    <th>Ngày thêm</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices
                                    .filter(device => selectedFarm && device.farmId === selectedFarm.farmId)
                                    .map((device, index) => (
                                        <tr key={index} onClick={() => {
                                            setSelectedItem(device);
                                            setImage(imageMap[device.image]);
                                        }}>
                                            <td>{index + 1}</td>
                                            <td>{device.name}</td>
                                            <td>{device.date}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {selectedItem && (
                        <div className='display'>
                            <img src={image} alt="device" />
                            <div className='specifications'>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <h2 style={{ marginLeft: "30px", marginRight: '100px' }}>{selectedItem.name}</h2>
                                    <p>{farms.find(farm => farm.farmId === selectedItem.farmId)?.farmName}</p>
                                </div>
                                <div className="spec-row">
                                    <span>Trạng thái: <p style={{ 
                                            color: sensorsAutomaticArray[idMap[selectedItem.name]] === "On" ? "#90EE90" : "white",
                                            display: mode === 'sensor' ? '' : 'none',
                                         }}>
                                            {sensorsAutomaticArray[idMap[selectedItem.name]]}
                                        </p>
                                        <p style={{ 
                                            display: mode === 'sensor' ? 'none' : '',
                                            color: selectedItem.state === "On" ? "#90EE90" : "white"
                                         }}>
                                            {selectedItem.state}
                                        </p>
                                    </span>
                                    <label className="switch" 
                                           style={{
                                                display: mode === 'sensor' ? '' : 'none',
                                                marginLeft: '85px'}}>
                                        <input type="checkbox" onChange={()=>handleStateDevices(idMap[selectedItem.name])} checked={sensorsAutomaticArray[idMap[selectedItem.name]] === "On"} />
                                        <span className="slider"></span>
                                    </label>
                                    <label className="switch" 
                                           style={{
                                                display: mode === 'sensor' ? 'none' : '',
                                                marginLeft: '85px'}}>
                                        <input type="checkbox" onChange={()=>handleStateDevices(null)} checked={selectedItem.state === "On"} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="spec-row">
                                    {selectedItem.name.includes("Cảm biến") ? (
                                        <div className='grid'>
                                            <span>Tối thiểu: <p style ={{display: isEditing === true ? 'none' : ''}}>{selectedItem.min ?? '-'}</p>
                                                <input 
                                                    ref = {minRef}
                                                    className='Input'
                                                    style ={{
                                                        display: isEditing === true ? 'inline' : 'none',
                                                        width: '50px'
                                                    }}
                                                    type="number" />
                                            </span>
                                            <span>Tối đa: <p style ={{display: isEditing === true ? 'none' : ''}}>{selectedItem.max}</p>
                                                <input 
                                                    ref = {maxRef}
                                                    className='Input'
                                                    style ={{
                                                        display: isEditing === true ? 'inline' : 'none',
                                                        width: '50px'
                                                    }}
                                                    type="number" />
                                            </span>
                                            <button onClick={()=>setIsEditing(true)} className='spec-but' style ={{display: isEditing === true ? 'none' : ''}}>
                                                Chỉnh sửa
                                            </button>
                                            <button 
                                                onClick={confirmEdit}
                                                className='spec-but' 
                                                style ={{display: isEditing === false ? 'none' : ''}}>
                                                    Xác nhận
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span>Tự động: <p 
                                                style={{ color: devicesAutomaticArray[idMap[selectedItem.name]] === "On" ? "#90EE90" : "white" }}>{devicesAutomaticArray[idMap[selectedItem.name]]}
                                                </p>
                                            </span>
                                            <label className="switch" style={{marginLeft: '100px'}}>
                                                <input type="checkbox" 
                                                    onChange={() => {
                                                        handleDeviceAutomatic(idMap[selectedItem.name])
                                                    }} 
                                                    checked={devicesAutomaticArray[idMap[selectedItem.name]] === "On"} />
                                                <span className="slider"></span>
                                            </label>
                                        </>
                                    )}
                                </div>
                                <div className="spec-row actions" style={{display: mode === 'sensor' ? '' : 'none'}}>
                                    <button className='spec-but' style={{ marginBottom: '15px' }}>Thống kê</button>
                                    <p style={{marginLeft: '102px'}}>Giá trị hiện tại: {val}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
export default Workingpage;