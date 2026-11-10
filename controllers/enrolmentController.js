const { ObjectId } = require("mongodb");
const { getDB } = require("../db");

const getLessonEnrolment = async (req, res) => {
  try {
    const db = getDB();
    const { lessonid } = req.params;

    // Validate lesson ID
    if (!ObjectId.isValid(lessonid)) {
      return res.status(400).json({
        message: "Invalid lesson ID"
      });
    }

    const lessonObjectId = new ObjectId(lessonid);

    // Check whether the lesson exists
    const lesson = await db.collection("lessons").findOne({
      _id: lessonObjectId
    });

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found"
      });
    }

    // Calculate total purchased spaces
    const result = await db.collection("orders").aggregate([
      {
        $unwind: "$items"
      },
      {
        $match: {
          "items.lessonId": lessonObjectId
        }
      },
      {
        $group: {
          _id: null,
          totalEnrolment: {
            $sum: "$items.quantity"
          }
        }
      }
    ]).toArray();

    const enrolment = result.length > 0
      ? result[0].totalEnrolment
      : 0;

    res.status(200).json({
      lessonId: lessonid,
      enrolment
    });

  } catch (error) {
    console.error("Error retrieving lesson enrolment:", error);

    res.status(500).json({
      message: "Failed to retrieve lesson enrolment",
      error: error.message
    });
  }
};

module.exports = { getLessonEnrolment };