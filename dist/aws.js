"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const AWS = require('aws-sdk');
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const s3ImageUpload = function (file_data) {
    const s3 = new aws_sdk_1.default.S3({
        accessKeyId: 'AKIAYVXFOTB3WK3W4YU7',
        secretAccessKey: '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',
        region: 'us-east-1'
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
