# What is this

This is a package for upload large flies on aws s3 


# Installation

`npm i large-file-upload`


# Syntax

const upload =require('large-file-upload')

upload(fileName, filePath, option);

Here fileName is the file which you want to upload on s3 bucket, filePath is the path where your file is located on server and option is an object which consist four different keys where you must have to mention your s3 bucket credentials. e.g

option = {
    ACCESS_KEY:""
    SECRET_ACCESS_KEY:""
    BUCKET_NAME:""
    REGION:"" 
}

# Example

const upload =require('large-file-upload');
const path = require('path');


let s3 = {
    ACCESS_KEY:"*************",
    SECRET_ACCESS_KEY:"*************",
    BUCKET_NAME:"*************",
    REGION:"*************"
}

const filePath = path.join(__dirname,'uploads');
const fileName = "nature.mp4"
upload(fileName, filePath, s3);


