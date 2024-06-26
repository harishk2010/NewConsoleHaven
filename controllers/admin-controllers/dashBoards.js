const moment = require('moment');
const Sale = require('../../models/order');
const Order = require('../../models/order');
const PDFDocument = require('pdfkit');
const hbs = require('hbs');
const Handlebars = require('handlebars');
const { Product } = require('../../models/productsSchema');
const { Category } = require('../../models/categorySchema');

let months = [];
let odersByMonth = [];
let revnueByMonth = [];
let totalRevnue = 0;
let totalSales = 0;
let categories = [];
let revenues = [];

const loadDashboard = async (req, res) => {
    try {
        const categoryRevenue = await Order.aggregate([
            { $unwind: "$product" },
            {
                $lookup: {
                    from: "products",
                    localField: "product._id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$productDetails.category",
                    totalRevenue: { $sum: { $multiply: ["$product.quantity", "$productDetails.price"] } }
                }
            },
            {
                $lookup: {
                    from: "category",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" },
            {
                $project: {
                    _id: 0,
                    category: "$categoryDetails.category",
                    totalRevenue: 1
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        categories = categoryRevenue.map(item => item.category);
        revenues = categoryRevenue.map(item => item.totalRevenue);

        console.log(categories);
        console.log("//////////////////////////////////////////////////////////", categoryRevenue);

        const sales = await Sale.find({}).lean();

        // console.log(sales, 'salessssssssssssssssss');

        const salesByMonth = {};

        sales.forEach((sale) => {
            const monthYear = moment(sale.date).format('MMMM YYYY');
            if (!salesByMonth[monthYear]) {
                salesByMonth[monthYear] = {
                    totalOrders: 0,
                    totalRevenue: 0
                };
            }
            salesByMonth[monthYear].totalOrders += 1;
            salesByMonth[monthYear].totalRevenue += sale.total;
        });

        const chartData = [];

        Object.keys(salesByMonth).forEach((monthYear) => {
            const { totalOrders, totalRevenue } = salesByMonth[monthYear];
            chartData.push({
                month: monthYear.split(' ')[0],
                totalOrders: totalOrders || 0,
                totalRevenue: totalRevenue || 0
            });
        });

        console.log(chartData);

        months = [];
        odersByMonth = [];
        revnueByMonth = [];
        totalRevnue = 0;
        totalSales = 0;

        chartData.forEach((data) => {
            months.push(data.month);
            odersByMonth.push(data.totalOrders);
            revnueByMonth.push(data.totalRevenue);
            totalRevnue += Number(data.totalRevenue);
            totalSales += Number(data.totalOrders);
        });

        const thisMonthOrder = odersByMonth[odersByMonth.length - 1];
        const thisMonthSales = revnueByMonth[revnueByMonth.length - 1];

        let bestSellings = await Product.find().sort({ bestSelling: -1 }).limit(5).lean();
        let popuarProducts = await Product.find().sort({ popularity: -1 }).limit(5).lean();
        let bestSellingCategory = await Category.find().sort({ bestSelling: -1 }).limit(5).lean();

        // console.log(thisMonthOrder, thisMonthSales);

        // console.log(months);
        // console.log(odersByMonth);
        // console.log(revnueByMonth);
        // console.log(totalRevnue);
        // console.log(totalSales);

        res.render('admin/dashBoard', {
            revnueByMonth,
            bestSellingCategory,
            bestSellings,
            popuarProducts,
            months,
            odersByMonth,
            totalRevnue,
            categoryRevenue,
            totalSales,
            thisMonthOrder,
            thisMonthSales,
            layout: 'adminlayout'
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        res.status(500).send('Internal Server Error');
    }
};

const getSales = async (req, res) => {
    const { stDate, edDate } = req.query;
    console.log(stDate, edDate);

    const startDate = new Date(stDate);
    const endDate = new Date(new Date(edDate).setHours(23, 59, 59, 999));
    try {
        const orders = await Order.find({
            date: {
                $gte: startDate,
                $lte: endDate,
            },
            status: 'Delivered'
        }).sort({ date: 'desc' });
        console.log(orders);

        const formattedOrders = orders.map((order) => ({
            date: moment(order.date).format('YYYY-MM-DD'),
            ...order._doc
        }));

        console.log(formattedOrders);

        let salesData = [];

        formattedOrders.forEach((element) => {
            salesData.push({
                date: element.date,
                orderId: element.orderId,
                total: element.total,
                payMethod: element.paymentMethod,
                proName: element.product,
            });
        });

        let grandTotal = 0;

        salesData.forEach(element => {
            grandTotal += element.total;
        });

        console.log(grandTotal);

        res.json({
            grandTotal: grandTotal,
            orders: salesData,
        });
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).send('Internal Server Error');
    }
};

const getChartData = (req, res) => {
    try {
        res.json({
            months: months,
            revnueByMonth: revnueByMonth,
            odersByMonth: odersByMonth,
            cat: categories,
            revenue: revenues
        });
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    loadDashboard,
    getSales,
    getChartData,
};
