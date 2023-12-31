const router = require("express").Router();
const {Admin } = require("../models/user");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const { Config } = require("../models/config");

router.get("/", (req, res) => {
  res.send("WELCOME TO NO-CODE APP API");
});
router.post("/log", async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  //console.log(req.body);
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const user = await Admin.findOne({ email: req.body.email });
    if (!user)
      return res.status(401).send("Invalid Email or Password" );
    const validPassword = bcrypt.compareSync(req.body.password, user.password);
    if (!validPassword)
      return res.status(401).send( "Invalid Email or Password" );
    res.status(200).send({ message: "logged in successfully",userId:user._id ,clientName:user.firstName});
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" + error.message });
  }
});

const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

const defaultConfig = {
  clientName: "",
  configJson: {
    loginScreen: {
      forgetPassword: false,
      defaultLogin: true,
      googleLogin: false,
      microsoftLogin: false
    },
    homeScreen: {
      kaptureLogo: true,
      dataBroImage: true,
      appointmentSchedule: true,
      todaysFeed: true,
      scheduledTicket: true,
      pendingTicket: true,
      allocatedTicket: true,
      enableTickets: true,
      enableStocks: true,
      enableCalendar: true,
      enableSyncNow: true,
      enableSettings: true,
      enableLogout: true
    }
  }
};

router.post("/register", async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  // console.log(req.body);
  try {
    let user = await Admin.findOne({ email: req.body.email });
    if (user)
      return res
        .status(409)
        .send({ message: "User with given email already Exist!" });
    // const hashPassword = await bcrypt.hash(req.body.password, salt);
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);
    console.log(hashedPassword);
    await new Admin({ ...req.body, password: hashedPassword })
      .save()
      .then((savedData) => {
        
        //res.status(200).send({data:savedData,message:"Registered successfully"});
        
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Internal server error");
      });
    await new Config({...defaultConfig,clientName:req.body.firstName})
    .save()
    .then((savedData)=>{
      res.status(200).send({data:savedData,message:"Registered successfully"});
    }).catch((error)=>{
      console.error(error);
        res.status(500).send("Internal server error");
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
