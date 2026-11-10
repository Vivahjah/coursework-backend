
const { getDB } = require("../db");
const { ObjectId } = require("mongodb");

const getAllLessons = async (req, res) => {
  try {
    const db = getDB();

    const search = req.query.search;

    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$price" },
                regex: search,
                options: "i"
              }
            }
          },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$space" },
                regex: search,
                options: "i"
              }
            }
          }
        ]
      };
    }

    const lessons = await db.collection("lessons")
      .find(query)
      .toArray();

    res.status(200).json(lessons);

  } catch (error) {
    console.error("Error fetching lessons:", error);

    res.status(500).json({
      message: "Failed to retrieve lessons",
      error: error.message
    });
  }
};

const updateLesson = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    // Check if the lesson ID is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid lesson ID"
      });
    }

    // Get the fields to update
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Please provide at least one field to update"
      });
    }

    // Prevent users from changing the MongoDB document ID
    delete updates._id;

    const result = await db.collection("lessons").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Lesson not found"
      });
    }
    // console.log(result);

    res.status(200).json({
      message: "Lesson updated successfully",
      updatedFields: updates
    });

  } catch (error) {
    console.error("Error updating lesson:", error);

    res.status(500).json({
      message: "Failed to update lesson",
      error: error.message
    });
  }
};
module.exports = { getAllLessons, updateLesson };
