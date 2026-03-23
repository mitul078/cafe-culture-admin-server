const Item = require("./item.model")
const uploadToS3 = require("../../../../utils/s3Upload")

// image must be store in clients/${adminId}/items
exports.createMenuItem = async (req, res, next) => {
    try {

        const adminId = req.admin.id



    } catch (error) {
        next(error)
    }
}