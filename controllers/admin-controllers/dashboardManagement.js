const adminDashboard = async (req, res) => {
    try {
        res.render('admin/dashBoard', { title: "Admin", layout: 'adminlayout' })
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");

    }
}

module.exports = {
    adminDashboard
}