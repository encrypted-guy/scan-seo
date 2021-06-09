const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt  = require('jsonwebtoken')
const User = require('../../models/User')
const JWT_SECRET = process.env.JWT_SECRET

// POST api/v1/sign-up | public | register a new userand keep logged in
router.post('/sign-up', async (req, res) => {
    try {
        const {name, email, password} = req.body
        // CHECKING ALL THE FEILDS
        if(!name || !email || !password){
            return res.status(400).json({ msg: 'please enter all feilds' })
        }

        // IF USER EXIXTS OR NOT
        let user = await User.findOne({email})
        if(user){
            return res.status(400).json({ msg: 'user alrady exists' })
        }

        let date_info = new Date;
        let date_into = (date_info.getMonth()+1) + '/' + date_info.getDate() + '/' +  date_info.getFullYear();


        user = new User({
            name,
            email,
            password,
            cleatedAt: date_into
        })

        // GANARATEING SALT AND HASHING THE PASSOWRD
        const slat =await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, slat)
        await user.save()
        
        const payload = { 
            user: {
                id: user._id
            }
        }
        jwt.sign(payload, JWT_SECRET, {
            expiresIn: 36000 
        }, (err, token) => {
            if(err) throw err 
            res.status(200).json({
                token
            })
        })
    } catch (err) {
        console.log(err)
    }
})

module.exports = router