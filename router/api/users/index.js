const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../../model/user");
const nodemailer = require("nodemailer");
const { authenticate, permit, verify } = require("../../../middleware");

router.get("/", (req, res) => {
  res.send("router working");
});

router.post("/signup", async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    req.body.password = hash;
    req.body.loginType = 2;
    const user = new User(req.body);
    await user.save();
    const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
    const transport = nodemailer.createTransport({
      service: process.env.PLATFORM,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    let info = await transport.sendMail({
      from: process.env.EMAIL,
      to: req.body.email,
      subject: "Verification E-Mail",
      html: ` <div> 
    <p style="color: black; font-family: cursive; font-size:20px; letter-spacing: 1px; text-shadow: 2px 0 3px rgba(0, 0, 0, 0.6);"> welcome  <b style='font-family: monospace;'>${req.body.name}</b> Thank you  for choosing our platform and keep Growing with us.</p>
      <div> 
      <button style="padding:10px; outline:none; border:none;   border-radius: 12px;">
      <a style="color: black; font-size:16px;  text-decoration: none;" href="http://localhost:3000/verify/${token}">Verify Email</a> </button>
      <p style="color: black; font-family:cursive; font-size:15px letter-spacing: 1px">Thanks For Regards </p>
      <p style="color: black; font-family: cursive; font-size:15px letter-spacing: 1px">Our Mini Team </p>
      </div>
     </div>`,
    });
    if (info) {
      res.json({
        msg: "Account has been created Successfully. Please verify your E-mail ",
      });
    }
  } catch (error) {
    res.json({
      msg: "This E-mail-Id has been created already in our website. So please change your E-mail-Id and try again",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ msg: "User not found" });
    }
    if (!user.verified) {
      return res.json({ msg: "Account not Verified" });
    }

    const match = await bcrypt.compare(req.body.password, user.password);
    if (match) {
      const token = await jwt.sign(
        {
          userId: user._id,
        },
        process.env.SECRET_KEY
      );
      return res.json({ token });
    } else {
      return res.json({ msg: "Wrong Password" });
    }
  } catch (error) {
    res.json(error);
  }
});

router.get("/data", authenticate, async (req, res) => {
  try {
    const user = await User.findById({ _id: req.userId }).select(
      "-createdAt -updatedAt -password -__v"
    );

    res.json({ success: true, user });
  } catch (error) {
    res.json({ msg: error });
  }
});

router.get("/verification", verify, async (req, res) => {
  try {
    const data = await User.findByIdAndUpdate(
      { _id: req.userId },
      { verified: true }
    );
    if (data) {
      return res.json({ success: true, msg: "Account has been verified" });
    }
  } catch (error) {
    res.json({ success: false, msg: error });
  }
});

router.get("/usersdata", [permit([1]), authenticate], async (req, res) => {
  try {
    const user = await User.find({}).select(
      "-createdAt -updatedAt -password -__v"
    );

    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, msg: error });
  }
});

module.exports = router;
