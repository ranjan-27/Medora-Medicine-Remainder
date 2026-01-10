const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const medicineController = require("../controllers/medicineController");

router.post("/", authMiddleware, medicineController.addMedicine);
router.get("/", authMiddleware, medicineController.getMedicines);
router.put("/:id", authMiddleware, medicineController.updateMedicine);
router.delete("/:id", authMiddleware, medicineController.deleteMedicine);
router.post("/:id/taken", authMiddleware, medicineController.markTaken);
router.post("/:id/missed", authMiddleware, medicineController.markMissed);


module.exports = router;
