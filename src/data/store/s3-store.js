const { GetObjectCommand, PutObjectCommand, S3Client} = require('@aws-sdk/client-s3')

class S3Store {
    constructor(bucket, fileName) {
        this.bucket = bucket;
        this.fileName = fileName;
        this.s3Client = new S3Client();
    }

    async read () {
        const params = {Bucket: this.bucket, Key: this.fileName};
        return await new Promise(async (resolve, reject) => {
            const getObjectCommand = new GetObjectCommand(params)
            try {
                const response = await this.s3Client.send(getObjectCommand)
                let responseDataChunks = []
                response.Body.once('error', err => reject(err))
                response.Body.on('data', chunk => responseDataChunks.push(chunk))
                response.Body.once('end', () => resolve(responseDataChunks.join('')))
            } catch (err) {
                return reject(err)
            }
        })
    }

    async write(content) {
        const params = {
            Bucket: this.bucket,
            Key: this.fileName,
            Body: content
        }
        const putObjectCommand = new PutObjectCommand(params);
        return await new Promise((resolve, reject) => {
            try {
                this.s3Client.send(putObjectCommand)
                    .then((res) => resolve(res))
                    .catch((error) => reject(error));
            }
            catch(error){
                return reject(error);
            }
        });
    }

}

module.exports = S3Store;
