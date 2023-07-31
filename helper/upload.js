const express = require('express')
let multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'documents/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file?.originalname)
    }
})

const upload = multer({ storage })

module.exports = upload
