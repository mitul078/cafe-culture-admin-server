const { DeleteObjectCommand } = require("@aws-sdk/client-s3")
const s3 = require("../config/s3")

const deleteToS3 = async (file, folder = "items") => {

    const key = file.split(".amazonaws.com/")[1]

    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key

    })

    await s3.send(command)
}

module.exports = deleteToS3