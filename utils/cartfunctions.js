const calculateTotalPrice = async (items, productOffers) => {
    let total = 0;
    if (!items || !Array.isArray(items)) {
        console.error('Items array is undefined or not an array:', items);
        return total;
    }

    for (const item of items) {
        console.log('item:', item); // Log the item to see its structure

        // Check if item.product is defined
        if (item.product) {
            // Check if productOffers is defined
            if (!productOffers || !Array.isArray(productOffers)) {
                console.error('Product offers array is undefined or not an array:', productOffers);
                return total;
            }

            // Fetch the offers for the current product
            const offers = productOffers.filter(offer => offer.product.toString() === item.product._id.toString() &&
                new Date() >= offer.startDate && new Date() <= offer.expiryDate);

            console.log('offers:', offers); // Log the offers to see their structure

            // If an offer exists and is valid, use the offer price, otherwise use the regular price
            if (offers.length > 0) {
                const offer = offers[0]; // Assuming there's only one valid offer for simplicity
                total += offer.newPrice * item.quantity;
            } else {
                total += item.product.price * item.quantity;
            }
        } else {
            console.error('Product is undefined for item:', item);
        }
    }

    return Number(total.toFixed(2)); // Convert total to number and return
};

module.exports = {
    calculateTotalPrice,
};
