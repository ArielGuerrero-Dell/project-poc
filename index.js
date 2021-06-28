import { parseApiNameQuery } from './controllers/api-name-controller.js';
import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';

config(); // loads .env

const app = express();
const port = process.env.PORT || '3000';

app.use(cors());

// catch 400
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(400).send(`Error: ${res.originUrl} not found`);
    next();
});

// catch 500
app.use((err, req, res, next) => {
    console.log(err.stack)
    res.status(500).send(`Error: ${err}`);
    next();
});

// used for validating names and sending suggested names if necessary
app.get(('/validation'), (req, res) => {
    var parsedObj = JSON.parse(JSON.stringify(req.query));
    console.log(parsedObj);
    parseApiNameQuery(parsedObj.query).then(response => { res.send(JSON.stringify(response)) });
});

app.post(('/validation'), (req, res) => {
    console.log(req.body);
    res.send("Post worked!");
});

// listen to a specific PORT
app.listen(port, () => console.log(`app listening at http://localhost:${port}`));