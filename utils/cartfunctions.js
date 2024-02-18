const calculateTotalPrice = (items) => {
    let total = 0;
    items.forEach(item => {
        total += item.product.price * item.quantity;
    });
    return total.toFixed(2);
};

module.exports = {
    calculateTotalPrice,
}