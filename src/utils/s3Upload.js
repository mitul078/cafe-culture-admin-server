
const { PutObjectCommand } = require("@aws-sdk/client-s3")


const s3 = require("../config/s3")
const generateSnowflakeId = require("./snowflake")

const id = generateSnowflakeId()

const uploadToS3 = async (file, folder = "items") => {
    const key = `${folder}/${id}-${file.originalname}`

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: "public, max-age=31536000, immutable"
    })

    await s3.send(command)

    return key
}

module.exports = uploadToS3
