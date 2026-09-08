const crypto = require("crypto");
const Razorpay = require("razorpay");
const { createOrder, setOrderPaymentId, getOrderByPaymentId, confirmOrder } = require("../../repositories/postgres-repository");

const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID || "RAZORPAY_KEY_ID", key_secret: process.env.RAZORPAY_SECRET || "RAZORPAY_SECRET" });

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, userId, userName, userEmail, instructorId, instructorName, courseImage, courseTitle, courseId, coursePricing } = req.body;
    const requestedAmount = Number(amount);
    const numericPrice = Number(coursePricing || amount);
    if (!requestedAmount || requestedAmount <= 0 || !numericPrice || numericPrice <= 0) return res.status(400).json({ success: false, message: "Invalid amount" });
    const order = await createOrder({ userId, userName, userEmail, instructorId, instructorName, courseImage, courseTitle, courseId, coursePricing: numericPrice });
    const razorpayOrder = await razorpay.orders.create({ amount: Math.round(requestedAmount * 100), currency: "INR", receipt: `receipt_${order._id}`, notes: { orderDbId: String(order._id) } });
    await setOrderPaymentId(order._id, razorpayOrder.id);
    res.status(201).json({ success: true, data: { order_id: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency } });
  } catch (error) { console.log("Create Razorpay Order Error:", error.message); res.status(500).json({ success: false, message: "Some error occured!" }); }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ success: false, message: "Missing payment verification fields" });
    const signature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET || "RAZORPAY_SECRET").update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (signature !== razorpay_signature) return res.status(400).json({ success: false, message: "Payment verification failed" });
    const order = await getOrderByPaymentId(razorpay_order_id);
    if (!order) return res.status(404).json({ success: false, message: "Order cannot be found" });
    const confirmedOrder = await confirmOrder(order._id, razorpay_payment_id);
    res.status(200).json({ success: true, message: "Order confirmed", data: confirmedOrder });
  } catch (error) { console.log(error); res.status(500).json({ success: false, message: "Some error occured!" }); }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment };