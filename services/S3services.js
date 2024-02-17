const S3 = require('aws-sdk/clients/s3');
require('dotenv').config();
const fs = require('fs');


const bucketName = process.env.AWS_BUCKET_NAME;
const accessKeyId = process.env.IAM_USER_KEY;
const secretAccessKey = process.env.IAM_USER_SECRET;

// intializing the instance of s3 object
const s3 = new S3({
    accessKeyId,
    secretAccessKey
});


exports.uploadToS3 = (filePath, filename) => {

    const fileContent = fs.readFileSync(filePath);
    const params = {
        Bucket: bucketName,
        Key: filename,
        Body: fileContent,
        ACL: 'public-read',
        ContentType: 'image/jpeg'
    }
    
    return new Promise((resolve, reject) => {
        s3.upload(params, (err, s3response) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log('success', s3response);
                resolve(s3response.Location);
            }
        })
    })
}