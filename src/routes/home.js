const express = require('express');
const router = express.Router();

const homeController = require('../app/controller/HomeController');
const Customer = require('../app/models/Member')

// GET all user checkin

router.get('/customer', (req, res) => {
    Customer.find({})
        .then(customers => {
            res.json(customers)
        })
        .catch(err => {
            res.status(500).json({ message: err.message })
        })
})

// POST Create new user
router.post('/customer', async(req, res) => {
    var customer = new Customer(req.body)
    try {
        await customer.save()
        res.status(201).json(customer)
            //res.redirect('/api/customer')
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// POST data user checkin

router.post('/customer/:_id', (req, res) => {
    Customer.findById({ _id: req.params._id })
        .then(customer => {

            // Get day/month/year -- hours:minutes:seconds
            const checkDate = new Date();
            const day = checkDate.getDate();
            const month = checkDate.getMonth() + 1;
            const year = checkDate.getFullYear();
            const hours = checkDate.getHours();
            const minutes = checkDate.getMinutes();
            const seconds = checkDate.getSeconds();

            // console.log(day);
            // console.log(month);
            // console.log(year);
            // console.log(hours);
            // console.log(minutes);
            // console.log(seconds);

            var dateString = '' + day + '/' + month + '/' + year;
            var timeString = '' + hours + ':' + minutes + ':' + seconds
                // console.log(dateString)
                // console.log(timeString)

            if (customer.data.length == 0) {
                var newCheck = {
                    dateCheckin: dateString,
                    timeCheckin: {
                        first: timeString,
                        last: 'null'
                    }
                }
                customer.data.push(newCheck);
                customer.save();
            }

            for (var i = 0; i < customer.data.length; i++) {
                if (customer.data[i].dateCheckin == dateString) {
                    customer.data[i].timeCheckin.last = timeString;
                    customer.save();
                    break;
                }
                if (i == customer.data.length - 1) {
                    var newCheck = {
                        dateCheckin: dateString,
                        timeCheckin: {
                            first: timeString,
                            last: 'null'
                        }
                    }
                    customer.data.push(newCheck);
                    customer.save();
                }
            }

            res.json(customer)
        })
        .catch(err => {
            res.status(500).json({ message: err.message })
        })
})
router.get('/history', homeController.history);

router.get('/', homeController.home);


module.exports = router;