// const AWS = require('aws-sdk');
import AWS from 'aws-sdk'


const s3ImageUpload = function(file_data){
const s3 = new AWS.S3({
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
    } else {
        console.log(`Image uploaded successfully. ETag: ${data.ETag}`);
    }
});
}

export default s3ImageUpload
