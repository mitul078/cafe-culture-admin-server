const Client = require("./client.model")

exports.createClientController = async (req, res, next) => {
    try {

        const { adminId, cafeName, paymentMethod, address, maxQr, tableType } = req.body

        if (!adminId || !cafeName || !address || !maxQr || !tableType) {
            throw new Error("Required fields missing")
        }

        const findAdmin = await Client.findOne({ adminId });

        if (findAdmin) {
            throw new Error("ADMIN ALREADY EXIST")
        }

        const start = new Date()
        if (isNaN(start.getTime())) {
            throw new Error("INVALID STARTING DATE")
        }

        const end = new Date(start)
        end.setFullYear(end.getFullYear() + 1)

        const due = new Date(start)
        due.setDate(due.getDate() + 5)

        const plan = `
Subscription Summary

Plan Validity: ${start.toDateString()} - ${end.toDateString()}
Payment Due Date: ${due.toDateString()}

Total Payable Amount: ₹9999

Note:
Kindly ensure the subscription payment is completed before the due date to maintain uninterrupted service.

In case the payment is not received within the due date, admin access to the system will be temporarily disabled. Access will be restored immediately after payment confirmation.

For any assistance, please contact the support team.
`.trim()

        const createClient = await Client.create({
            cafeName,
            adminId,
            address,
            subscriptionDetail: {
                maxQr,
                tableType,
                paymentMethod,
                plan,
                startingDate: start,
                endingDate: end,
                dueDate: due,
            }
        })

        res.status(201).json({
            success: true,
            message: "CLIENT CREATED SUCCESSFULLY",
            data: createClient
        })

    } catch (error) {
        next(error)
    }
}