const { ObjectId } = require("mongodb");
const { getDB } = require("../db");

const createOrder = async (req, res) => {
  try {
    const db = getDB();

    const { name, phone, items } = req.body;

    // Validate customer details
    if (!name || !phone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Name, phone and at least one lesson are required"
      });
    }

    if (!/^[A-Za-z\s'-]+$/.test(name)) {
      return res.status(400).json({
        message: "Name must contain letters only"
      });
    }

    if (!/^\d+$/.test(phone)) {
      return res.status(400).json({
        message: "Phone must contain numbers only"
      });
    }

    // Validate lesson IDs and quantities
    const lessonIds = [];

    for (const item of items) {
      if (
        !item.lessonId ||
        !ObjectId.isValid(item.lessonId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          message: "Invalid lesson ID or quantity"
        });
      }

      lessonIds.push(new ObjectId(item.lessonId));
    }

    // Prevent duplicate lesson entries
    if (new Set(lessonIds.map(id => id.toString())).size !== lessonIds.length) {
      return res.status(400).json({
        message: "A lesson should only appear once in an order"
      });
    }

    // Check that all lessons exist and have enough spaces
    const lessons = await db.collection("lessons")
      .find({ _id: { $in: lessonIds } })
      .toArray();

    if (lessons.length !== items.length) {
      return res.status(404).json({
        message: "One or more lessons could not be found"
      });
    }

    for (const item of items) {
      const lesson = lessons.find(
        lesson => lesson._id.toString() === item.lessonId
      );

      if (item.quantity > lesson.space) {
        return res.status(400).json({
          message: `Not enough spaces available for ${lesson.topic}`
        });
      }
    }

    // Prepare the order document
    const newOrder = {
      name,
      phone,
      items: items.map((item, index) => ({
        lessonId: lessonIds[index],
        quantity: item.quantity
      })),
      createdAt: new Date()
    };

    // Save the order to MongoDB
    const result = await db.collection("orders").insertOne(newOrder);

    res.status(201).json({
      message: "Order submitted successfully",
      orderId: result.insertedId
    });

  } catch (error) {
    console.error("Error creating order:", error);

    res.status(500).json({
      message: "Failed to create order",
      error: error.message
    });
  }
};

module.exports = { createOrder };

