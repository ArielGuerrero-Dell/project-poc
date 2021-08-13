import { parseApiNameQuery } from './controllers/api-name-controller.js';
import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import axios from "axios";
import cors from 'cors';

const app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());


app.options('*', cors());

/* GET home page. */
app.get('/', function (req, res) {
    return res.json('working .... ');
});

app.get('/check', function (req, res) {
    let config = {
        method: 'get',
        url: req.query.url,
        headers: {}
    };

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
            res.send(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
            res.send(error);
        });

});

// used for validating names and sending suggested names if necessary
app.get(('/validation'), (req, res, next) => {
    var parsedObj = JSON.parse(JSON.stringify(req.query));
    console.log(parsedObj);
    parseApiNameQuery(parsedObj.query).then(response => {
        res.send(JSON.stringify(response))
    });
});


app.post(('/validation'), (req, res, next) => {
    console.log(req.body);
    res.json("Post worked!");
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});


// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json('error');
});


export { app };
