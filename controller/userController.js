const express = require('express')
const db = require('../db.config/db.config')
const jwt = require('jsonwebtoken');
// const Auth = require('./auth')
const cookieParser = require('cookie-parser');
require("dotenv").config();
const bcrypt = require('bcrypt');
SECRET = process.env.SECRET


const register = async(req, res, next) => {
    const resultHash = bcrypt.hashSync(req.body.pass, bcrypt.genSaltSync(10))
    const user = {
        username : req.body.username,
        password : resultHash,
        email : req.body.email,
    };

    console.log(user);
    
    if (!user.password || !user.email || !user.username) {
        return res.status(400).send({ message : 'email, username, password must be provided'});
    }

    db.query(`SELECT * FROM unhan_modul_17 where email = $1`, [user.email], (err, results) => {
        if (results == null || results.rows.length == 0)  {
            db.query(`INSERT INTO unhan_modul_17 (username, email, password) values ($1, $2, $3)`, [user.username, user.email, user.password], (err, results) => {
                if (err){
                    console.log("Data Ga masuk: ", err);
                    return res.status(400).send("Data Tidak Masuk")
                }
                return res.status(200).send({user})
            }) 
        } else {
            return res.status(400).json({message: "Registrasi Gagal"});
        }
    })
}

const login = async(req, res, next) => {
    const user = {
        email: req.body.email,
        password : req.body.pass,
    }

    console.log(user);

    if (!user.email|| !user.password) {
        return res.status(400).send({ message : 'email and password is provided'});
    }

    db.query(`SELECT * FROM unhan_modul_17 where email = $1`, [user.email], (err, results) => {
        if (results != null && results.rows.length > 0)  {
            for (let row of results.rows){
                var hasil = row['email'] 
            }
            if (hasil == null) {
                console.log('Email Belum Terdaftar');
                return res.status(400).send("Email Belum terdaftar");
            }
            else {
                console.log(results.rows[0].id);
                if (!bcrypt.compareSync(user.password, results.rows[0].password)){
                    res.status(400).send({ message : 'The credentials you provided is incorrect' })
                }
    
                console.log('berhasil login');
                const token = jwt.sign(
                    {
                        id: results.rows[0].id,
                        email: user.email,
                    }, 
                        SECRET, { expiresIn: '1d'}
                )
    
                console.log({token});
    
                const user1 = {
                    id: results.rows[0].id,
                    email: results.rows[0].email,
                    username: results.rows[0].username,
                }
    
                return res.status(200).json({
                    user : user1,
                    token: token
                });
            }
        } else {
            return res.status(400).json({message: "Email Belum terdaftar"});
        }
    }) 
}

const logout = async(req, res, next) => {
                
    try {
        console.log('berhasil logout');
        return res.status(200).send('berhasil logout dari aplikasi')   
    } catch (err) {
        console.log(err.message);
        return res.status(500).send(err)
    }
            
}

const verify = async(req, res, next) => {
    try {
        const token = req.body.jwt
        const decoded = jwt.verify(token, SECRET)
        const user = await db.query(`SELECT * FROM unhan_modul_17 where id = $1`, [decoded.id])
        res.status(200).json(user.rows[0])
    } catch (err) {
        console.log(err.message);
        return res.status(500).send(err)    
    }
}

module.exports = {
    register,
    login,
    logout,
    verify,
}