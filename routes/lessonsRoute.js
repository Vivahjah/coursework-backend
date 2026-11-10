
const express = require("express");
const router = express.Router();

const { getAllLessons, updateLesson } = require("../controllers/lessonController");

router.get("/", getAllLessons);
router.put("/:id", updateLesson);

module.exports = router;
