// const express = require('express');
const AWS = require("aws-sdk");
// const app = express();
const fs = require('fs');
const path = require('path');

let fileName = "";
let record = {
     ACCESS_KEY :"",
     SECRET_ACCESS_KEY : "",
     BUCKET_NAME : "",
     REGION : ""   
}

s3 = new AWS.S3({     
    accessKeyId: record.ACCESS_KEY,
    secretAccessKey: record.SECRET_ACCESS_KEY
}); 


    const startUpload = () => {
        const params = {
            Key: fileName,
            Bucket: record.BUCKET_NAME,
        };
        return new Promise((resolve, reject) => {
            s3.createMultipartUpload(params, (err, data) => {
                if (err) return reject(err);
                return resolve(data);
            });
        })
    }

    const uploadPart = (buffer, uploadId, partNumber) => {
        const params = {
            Key: fileName,
            Bucket: record.BUCKET_NAME,
            Body: buffer,
            PartNumber: partNumber, // Any number from one to 10.000
            UploadId: uploadId, // UploadId returned from the first method
        };

        return new Promise((resolve, reject) => {
            s3.uploadPart(params, (err, data) => {
                if (err) return reject({ PartNumber: partNumber, error: err });
                console.log({ PartNumber: partNumber, ETag: data.ETag })
                return resolve({ PartNumber: partNumber, ETag: data.ETag });
            });
        });
    }

    const abortUpload = async (uploadId) => {
        const params = {
            Key: fileName,
            Bucket: record.BUCKET_NAME,
            UploadId: uploadId,
        };
        return new Promise((resolve, reject) => {
            s3.abortMultipartUpload(params, (err, data) => {
                if (err) return reject(err);
                return resolve(data);
            });
        });
    }

    const completeUpload = async (uploadId, parts) => {
        const params = {
            Key: fileName,
            Bucket: record.BUCKET_NAME,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: parts,
            },
        };
        return new Promise((resolve, reject) => {
            s3.completeMultipartUpload(params, (err, data) => {
                if (err) return reject(err);
                return resolve(data);
            });
        });
    }
    const uploadLargeFile = async (filePath, fileName) => {
        const file = fs.readFileSync(filePath); // read the file from the path specified
        const chunkSize = Math.pow(1024, 2) * 5; // chunk size is set to 10MB
        const fileSize = file.byteLength;
        const iterations = Math.ceil(fileSize / chunkSize); // number of chunks to be broken
        let arr = Array.from(Array(iterations).keys()); // dummy array to loop through
        let uploadId = ''; // we will use this later
        arr.shift()
        arr.push(arr[arr.length - 1] + 1)
        try {
            let uploadData = await startUpload(fileName); // this will start the connection and return UploadId
            uploadId = uploadData.UploadId
            console.log("uploadId", uploadId, "iterations", iterations);
            const parts = await Promise.allSettled(arr.map(item => uploadPart(file.slice((item - 1) * chunkSize, item * chunkSize), uploadId, item, fileName)))
            const failedParts = parts.filter((part) => part.status === "rejected").map((part) => part.reason);
            const succeededParts = parts.filter((part) => part.status === "fulfilled").map((part) => part.value);
            let retriedParts = [];
            if (failedParts.length)
                retriedParts = await Promise.all(failedParts.map(({ PartNumber }) => uploadPart(data.slice((PartNumber - 1) * chunkSize, PartNumber * chunkSize), uploadId, PartNumber, fileName)));
            succeededParts.push(...retriedParts); // when the failed parts succeed after retry
            const data = await completeUpload(uploadId, succeededParts.sort((a, b) => a.PartNumber - b.PartNumber), fileName);
            console.log(data) // the URL to access the object in S3
        } catch (err) {
            await abortUpload(uploadId, fileName)
            throw err
        }
    }
module. exports = (fileName, filePath, option) => {
        record.ACCESS_KEY = option.ACCESS_KEY;
        record.SECRET_ACCESS_KEY = option.SECRET_ACCESS_KEY;
        record.BUCKET_NAME = option.BUCKET_NAME;
        record.REGION = option.REGION;   
        fileName = fileName;
    await uploadLargeFile(filePath, fileName);
    return res.json({success:"file uploaded successfully"});
};

