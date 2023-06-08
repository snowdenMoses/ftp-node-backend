"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require('aws-sdk');
const s3ImageUpload = function (file_data) {
    const s3 = new AWS.S3({
        endpoint: "https://nyc3.digitaloceanspaces.com",
        signatureVersion: 'v4',
        accessKeyId: 'DO00UQBJDFT826ZUQGGQ',
        secretAccessKey: 'OugkMRMj6YBcGKuh+5MeN87oMEkCuxfqkx0EqYHK2JY',
        region: "nyc3"
    });
    const params = {
        Bucket: 'ftp-node',
        Key: 'first_image',
        Body: file_data,
        ContentType: 'image/jpeg'
    };
    s3.putObject(params, (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(`Image uploaded successfully. ETag: ${data.ETag}`);
        }
    });
};
exports.default = s3ImageUpload;
