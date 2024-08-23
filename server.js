const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 3004; // Ensure the port is set correctly

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ordersDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define an order schema
const orderSchema = new mongoose.Schema({
    codeClient: Number,
    prixUnite: Number,
    quantite: Number,
    size: String,
    totalPrice: Number
});

const Order = mongoose.model('Order', orderSchema);

// Define a stock schema
const stockSchema = new mongoose.Schema({
    size: String,
    quantity: Number
});

const Stock = mongoose.model('Stock', stockSchema);

// Define a client schema
const clientSchema = new mongoose.Schema({
    codeClient: { type: Number, required: true, unique: true },
  
    currentCredit: { type: Number, required: true, default: 0 }
});

const Client = mongoose.model('Client', clientSchema);

app.use(cors());
app.use(express.json());

app.post('/submit-order', async (req, res) => {
    const { codeClient, prixUnite, quantite, size } = req.body;
    const totalPrice = prixUnite * quantite;
    console.log('Order received:', { codeClient, prixUnite, quantite, size, totalPrice });

    try {
        // Find client and check credit
        let client = await Client.findOne({ codeClient });

        if (!client) {
            client = new Client({
                codeClient,
               
                currentCredit: 0
            });
        }

        if (client.currentCredit + totalPrice > 5000) {
            return res.status(400).json({ message: 'Credit limit exceeded' });
        }

        // Check stock availability
        const stockItem = await Stock.findOne({ size });

        if (!stockItem || stockItem.quantity < quantite) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        // Deduct the ordered quantity from stock
        stockItem.quantity -= quantite;
        await stockItem.save();

        // Update client credit
        client.currentCredit += totalPrice;
        await client.save();

        // Create a new order document
        const newOrder = new Order({
            codeClient,
            prixUnite,
            quantite,
            size,
            totalPrice,
        });

        // Save the order to the database
        await newOrder.save();
        res.json({ message: 'Order saved successfully' });
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).json({ message: 'Failed to save order' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
