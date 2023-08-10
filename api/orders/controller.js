const nodemailer = require("nodemailer");
require('dotenv').config()
var Mailgen = require('mailgen');
const { connect } = require("mongoose");
const Order = require('./models')

const demoMail = async (req, res) => {
    const { email, customerName } = req.body;


    if (!email || !customerName) {
        res.status(403).json({ message: "Please Give your email" })
    }

    else {
        const config = {
            service: 'gmail',
            auth: {
                // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD
            }
        }

        const transporter = nodemailer.createTransport(config);


        var mailGenerator = new Mailgen({
            theme: 'default',
            product: {
                // Appears in header & footer of e-mails
                name: 'Mailgen Banoqabil',
                link: 'https://mailgen.js/'
            }
        });

        var mailGenEmail = {
            body: {
                name: customerName,
                intro: 'Welcome to Mailgen! We\'re very excited to have you on board.',
                table: {
                    data: [
                        {
                            name: customerName,
                            email: email,
                            token: "1234565"
                        }
                    ]
                },
                outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
            }
        };






        const response = {
            from: process.env.NODEMAILER_EMAIL, // sender address
            to: email, // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: mailGenerator.generate(mailGenEmail), // html body
        }



        try {
            await transporter.sendMail(response);
            res.json({ message: "Check your Email" })
        }

        catch (error) {
            res.status(500).json({ error })
        }
    }

}

const addOrders = async (req, res) => {

    const { items, totalBill, customerAddress, customerContact, customerName, customerEmail } = req.body
    if (!items || !totalBill || !customerAddress || !customerContact || !customerName || !customerEmail) {
        res.status(403).json({ message: "Invalid payload" })
    }

    else {


        try {
            await connect(process.env.MONGO_URI)
            const order = await Order.create({ items, totalBill, customerAddress, customerContact, customerName, customerEmail })


            //EMAIL 
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                    user: process.env.NODEMAILER_EMAIL,
                    pass: process.env.NODEMAILER_PASSWORD
                }
            });

            //MAIL GEN SETUP

            var mailGenerator = new Mailgen({
                theme: 'default',
                product: {
                    // Appears in header & footer of e-mails
                    name: 'Mailgen Banoqabil',
                    link: 'https://mailgen.js/'
                }
            });


            await transporter.sendMail({
                from: process.env.NODEMAILER_EMAIL, // sender address
                to: customerEmail, // list of receivers
                subject: "Hello ✔", // Subject line
                text: "Hello world?", // plain text body
                html: mailGenerator.generate({
                    body: {
                        name: customerName,
                        intro: 'Welcome to Rabi Sweets, we ensure best quality sweets at your doorstep',
                        table: {
                            data: [
                                {
                                    name: customerName,
                                    email: customerEmail,
                                    TrackingId: order._id,
                                    Address: customerAddress,
                                    Contact: customerContact
                                }
                            ]
                        },
                        outro: 'Please make sure the above mentioned details are correcrt , incase any mistake , you can contact us.'
                    }
                }), // html body
            });

            res.status(201).json({
                message: "Order Place Successfully",
                TrackingId: order._id
            })
        }



        catch (error) {
            res.status(500).json({ message: error.message })
        }




    }





}

const allorders = async (req, res) => {

    try {
        await connect(process.env.MONGO_URI)
        const orders = await Order.find()
        res.json({ orders })
    }

    catch (error) {
        res.status(500).message({ message: error.message })

    }
}

const orderbyId = async (req, res) => {
    const { _id } = req.params

    try {
        await connect(process.env.MONGO_URI)
        const order = await Order.findOne({ _id })
        res.json({ order })
    }

    catch (error) {
        res.status(500).message({ message: error.message })

    }
}

module.exports = { demoMail, addOrders, orderbyId, allorders }