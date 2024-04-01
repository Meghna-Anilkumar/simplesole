const bodyParser = require('body-parser')
const express = require('express')
const app = express()
app.use(bodyParser.json())
const Order = require('../models/orderSchema')
const User=require('../models/user')
const Product = require('../models/product')
const Address = require('../models/address')
const ejs=require('ejs')
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const pdf = require('html-pdf');

module.exports = {

  //to admin login page
  toadminlogin: async (req, res) => {
    res.render('adminviews/adminlogin', {
      title: 'Homepage'
    });
  },

  //to login the admin
  adminlogin: async (req, res) => {
    const credential = {
      email: 'admin@gmail.com',
      password: '1'
    }
    if (
      req.body.email == credential.email &&
      req.body.password == credential.password
    ) {
      req.session.isadminlogged = true
      res.render('adminviews/dashboard', { title: 'Admin Dashboard' });
    }
    else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  },

  //get dashboard
  dashboard: async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments()
    const totalProductQuantity = await Order.aggregate([
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: null,
          totalProductQuantity: { $sum: "$items.quantity" },
        },
      },
    ]).exec();
    const productQuantity =
      totalProductQuantity.length > 0
        ? totalProductQuantity[0].totalProductQuantity
        : 0;

    res.render('adminviews/dashboard', {
      title: 'Dashboard',
      totalOrders: totalOrders,
      productQuantity: productQuantity,
      totalUsers: totalUsers,
      
    },
    )
  },

  //admin logout
  adminlogout: async (req, res) => {

    console.log('Accessed /adminlogout');
    req.session.isadminlogged = false

    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/adminlogin')
        }
    })
},


//generate sales report
generatesalesreport:  async (req, res) => {
  const { fromDate, toDate, interval } = req.query;
  let query = {};

  if (fromDate && toDate) {
    query.orderdate = { $gte: new Date(fromDate), $lte: new Date(toDate) };
  }

  const orders = await Order.find(query);

  let salesData = {};

  switch (interval) {
    case 'daily':
      orders.forEach(order => {
        const date = order.orderdate.toISOString().split('T')[0];
        if (!salesData[date]) salesData[date] = 0;
        salesData[date] += order.totalAmount;
      });
      break;

    case 'monthly':
      orders.forEach(order => {
        const yearMonth = order.orderdate.toISOString().slice(0, 7);
        if (!salesData[yearMonth]) salesData[yearMonth] = 0;
        salesData[yearMonth] += order.totalAmount;
      });

      // Fill in missing months with zero sales
      const firstOrderDate = orders.length > 0 ? orders[0].orderdate : new Date();
      const lastOrderDate = orders.length > 0 ? orders[orders.length - 1].orderdate : new Date();

      const startDate = new Date(firstOrderDate.getFullYear(), firstOrderDate.getMonth(), 1);
      const endDate = new Date(lastOrderDate.getFullYear(), lastOrderDate.getMonth() + 1, 0);

      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const yearMonth = currentDate.toISOString().slice(0, 7);
        if (!salesData[yearMonth]) salesData[yearMonth] = 0;
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      break;

    case 'yearly':
      orders.forEach(order => {
        const year = order.orderdate.getFullYear().toString();
        if (!salesData[year]) salesData[year] = 0;
        salesData[year] += order.totalAmount;
      });
      break;

    default:
      return res.status(400).json({ error: 'Invalid interval' });
  }

  res.json(salesData);
},


//generate sales report pdf
generatepdf:async (req, res) => {
  try {
      // Retrieve the fromDate, toDate, and interval from the request query parameters
      const { fromDate, toDate, interval } = req.query;

      // Assuming you have a function to fetch orders based on the fromDate and toDate
      const orders = await Order.find({ orderdate: { $gte: fromDate, $lte: toDate } })
      .populate('user')
      .populate('items.product');

      // Render the sales report template with the orders, startDate, and endDate
      ejs.renderFile(
          path.join(__dirname, '..', 'views', 'adminviews', 'salesreport.ejs'),
          { orders, startDate: fromDate, endDate: toDate },
          (err, html) => {
              if (err) {
                  console.error('Error rendering EJS file:', err);
                  return res.status(500).send('Internal Server Error');
              }

              const options = {
                  format: 'Letter'
              };

              // Generate the PDF from the HTML content
              pdf.create(html, options).toStream((err, stream) => {
                  if (err) {
                      console.error('Error converting HTML to PDF:', err);
                      return res.status(500).send('Internal Server Error');
                  }

                  // Set the response headers for PDF download
                  const fileName = `sales_report_${fromDate}_${toDate}.pdf`;
                  res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
                  res.setHeader('Content-type', 'application/pdf');

                  // Pipe the PDF stream to the response
                  stream.pipe(res);
              });
          }
      );
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
},

}