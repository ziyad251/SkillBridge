const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../../models/Order");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "RAZORPAY_KEY_ID",
  key_secret: process.env.RAZORPAY_SECRET || "RAZORPAY_SECRET",
});

const createRazorpayOrder = async (req, res) => {
  try {
    const {
      amount,
      userId,
      userName,
      userEmail,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing,
    } = req.body;

    const requestedAmount = Number(amount);
    const numericPrice = Number(coursePricing || amount);

    if (!requestedAmount || requestedAmount <= 0 || !numericPrice || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const newlyCreatedCourseOrder = new Order({
      userId,
      userName,
      userEmail,
      orderStatus: "pending",
      paymentMethod: "razorpay",
      paymentStatus: "initiated",
      orderDate: new Date(),
      paymentId: "",
      payerId: "",
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing: numericPrice,
    });

    await newlyCreatedCourseOrder.save();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(requestedAmount * 100),
      currency: "INR",
      receipt: `receipt_${newlyCreatedCourseOrder._id}`,
      notes: {
        orderDbId: String(newlyCreatedCourseOrder._id),
      },
    });

    newlyCreatedCourseOrder.paymentId = razorpayOrder.id;
    await newlyCreatedCourseOrder.save();

    return res.status(201).json({
      success: true,
      data: {
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (err) {
    console.log("Create Razorpay Order Error:", err);
    return res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET || "RAZORPAY_SECRET")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    let order = await Order.findOne({ paymentId: razorpay_order_id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order cannot be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.payerId = razorpay_payment_id;

    await order.save();

    const studentCourses = await StudentCourses.findOne({
      userId: order.userId,
    });

    if (studentCourses) {
      const alreadyPurchased = studentCourses.courses.some(
        (course) => String(course.courseId) === String(order.courseId)
      );

      if (!alreadyPurchased) {
        studentCourses.courses.push({
          courseId: String(order.courseId),
          title: order.courseTitle,
          instructorId: order.instructorId,
          instructorName: order.instructorName,
          dateOfPurchase: order.orderDate,
          courseImage: order.courseImage,
        });

        await studentCourses.save();
      }
    } else {
      const newStudentCourses = new StudentCourses({
        userId: order.userId,
        courses: [
          {
            courseId: String(order.courseId),
            title: order.courseTitle,
            instructorId: order.instructorId,
            instructorName: order.instructorName,
            dateOfPurchase: order.orderDate,
            courseImage: order.courseImage,
          },
        ],
      });

      await newStudentCourses.save();
    }

    const course = await Course.findById(order.courseId);

    if (course) {
      const students = course.students || [];
      const alreadyEnrolled = students.some(
        (student) => String(student.studentId) === String(order.userId)
      );

      if (!alreadyEnrolled) {
        students.push({
          studentId: String(order.userId),
          studentName: order.userName,
          studentEmail: order.userEmail,
          paidAmount: String(order.coursePricing),
        });
        course.students = students;
        await course.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment };
