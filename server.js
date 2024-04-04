const express = require("express");
const fs = require("fs");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

//Events API
app.post(`/api/events`, (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const {eventType, data, deviceInfo} = req.body;
    console.log(`${eventType}: ${data}`);

    fs.appendFileSync(`./logs/events.log`, `${eventType} -- ${data} -- IP: ${ip} -- Device: ${deviceInfo} -- TIME: ${new Date().toISOString()}\n`);
    res.send({message: `${eventType} Recorded`});
})
app.get('/api/eventLogs', (req, res) => {
    fs.readFile('./logs/events.log', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the log file:', err);
            return res.status(500).send('Unable to read logs');
        }
        res.send(data);
    });
});

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`)
})