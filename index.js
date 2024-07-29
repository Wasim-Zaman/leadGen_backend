const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
const port = 3001;

// Constants
const { FROM_EMAIL, PASS, TO_EMAIL } = process.env;

// Middleware setup
app.use(bodyParser.json());
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Create a transporter for nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: FROM_EMAIL,
    pass: PASS,
  },
});

// Helper function to send emails
const sendEmail = (mailOptions, res) => {
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      return res.status(500).json({
        status: "error",
        message: "Failed to send email",
        error,
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Email sent successfully",
    });
  });
};

// Endpoint for estimation requests
app.get("/", (req, res, next) => {
  res.send("hello");
});

app.post("/sendEmail", (req, res) => {
  const { name, phoneNumber, projectDescription, city, whatsappNumber } =
    req.body;

  const mailOptions = {
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: `New Estimation Request from ${name}`,
    text: `
      Name: ${name}
      Phone Number: ${phoneNumber}
      Project Description: ${projectDescription}
      City: ${city}
      WhatsApp Number: ${whatsappNumber}
    `,
  };

  sendEmail(mailOptions, res);
});

// Endpoint for career applications
app.post("/apply", upload.single("resume"), (req, res) => {
  const { name, mobile, previousLinks } = req.body;
  const { file: resume } = req;

  const mailOptions = {
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: `New Job Application from ${name}`,
    text: `
      Name: ${name}
      Mobile: ${mobile}
      Previous Work Links: ${previousLinks}
    `,
    attachments: [
      {
        filename: resume.filename,
        path: resume.path,
      },
    ],
  };

  sendEmail(mailOptions, res);
});

// Endpoint for consultation requests
app.post("/sendConsultation", (req, res) => {
  const { name, email, country, phone, company, project, marketing } = req.body;

  const mailOptions = {
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: `New Consultation Request from ${name}`,
    text: `
      Full Name: ${name}
      Email: ${email}
      Country: ${country}
      Phone Number: ${phone}
      Company Name: ${company}
      Project Brief: ${project}
      Marketing: ${marketing ? "Yes" : "No"}
    `,
  };

  sendEmail(mailOptions, res);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
