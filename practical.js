//write a CODE in nodejs for URL Shortener using mongoDB
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

// connect to database
mongoose.connect('mongodb://localhost:27017/').then(() => {
    console.log("db connected");
}).catch((err) => {
    console.log("error connecting db:", err);
});

// create schema for url
const urlSchema = new mongoose.Schema({
    fullUrl: String,
    short: String,
    clicks: { type: Number, default: 0 }
});

const UrlModel = mongoose.model('Url', urlSchema);

// route to make url short
app.post('/short', async (req, res) => {
    let original = req.body.url;

    if (!original) {
        return res.send("please provide a url");
    }

    try {
        // check if it exists
        let check = await UrlModel.findOne({ fullUrl: original });
        if (check) {
            return res.send(check);
        }

        // generate random 6 character string for short url
        let randomStr = Math.random().toString(36).substring(2, 8);

        let newUrl = new UrlModel({
            fullUrl: original,
            short: randomStr
        });

        await newUrl.save();
        res.send(newUrl);

    } catch (e) {
        console.log(e);
        res.send("something went wrong");
    }
});

// route to redirect
app.get('/:id', async (req, res) => {
    try {
        let myid = req.params.id;
        let data = await UrlModel.findOne({ short: myid });

        if (data) {
            data.clicks = data.clicks + 1; // increase click
            await data.save();
            res.redirect(data.fullUrl);
        } else {
            res.send("url not found");
        }
    } catch (err) {
        console.log(err);
        res.send("server error");
    }
});

// start server
app.listen(3000, () => {
    console.log("server started on port 3000");
});