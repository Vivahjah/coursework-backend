const express = require("express");
const router = express.Router();

const { getLessonEnrolment } = require("../controllers/enrolmentController");

router.get("/:lessonid", getLessonEnrolment);

module.exports = router;