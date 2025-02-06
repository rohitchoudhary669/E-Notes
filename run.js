const express = require("express");
const mysql = require('mysql');
const session = require("express-session");
const bodyParser = require('body-parser');
const multer = require('multer');

const path = require('path');


const app = express();

app.use(session({
    secret: "rohit",
    saveUninitialized: true,
    resave: true
}));
// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Images/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// Multer upload configuration with fileFilter
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'image/jpeg' ||
            file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/png' ||
            file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and PDF files are allowed!'), false);
        }
    }
});
  
var con = mysql.createConnection(
    {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'enotes',

    }
);
con.connect(function (err) {
    if (err) throw err;
    console.log("connected");

});
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("Public"));
app.use(express.static("images"));

// Routes

// Home page


// Serve index.html

// Serve about.html
app.get("/", (req, res) => {
    res.sendFile("./public/index.html", { root: __dirname });
});

app.get("/about.html", (req, res) => {
    res.sendFile("./public/about.html", { root: __dirname });
});


app.get("/profile.html", (req, res) => {
    res.sendFile("./public/profile.html", { root: __dirname });
});

app.get("/contact.html", function (req, res) {
    res.sendFile("./public/contact.html", { root: __dirname });
});
app.get("/updatestudent.html", function (req, res) {
    res.sendFile("./public/updatestudent.html", { root: __dirname });
});
app.get("/updateteacher.html", function (req, res) {
    res.sendFile("./public/updateteacher.html", { root: __dirname });
});

app.get("/Signup.html", function (req, res) {
    res.sendFile("./public/Signup.html", { root: __dirname });
});
app.get("/Signupteacher.html", function (req, res) {
    res.sendFile("./public/Signupteacher.html", { root: __dirname });
});

app.get("/loginteacher.html", function (req, res) {
    res.sendFile("./public/loginteacher.html", { root: __dirname });
});
app.get("/loginadmin.html", function (req, res) {
    res.sendFile("./public/loginadmin.html", { root: __dirname });
});
app.get("/loginstudent.html", function (req, res) {
    res.sendFile("./public/loginstudent.html", { root: __dirname });
});
app.get("/addbook.html", function (req, res) {
    res.sendFile("./public/addbook.html", { root: __dirname });
});
app.get("/Home.html", function (req, res) {
    res.sendFile("./public/Home.html", { root: __dirname });
});
app.post("/signupStudent", (req, res) => {
    const { name, email, phone, password1 } = req.body;
    const query = "INSERT INTO student (name, email, phone, password1) VALUES (?, ?, ?, ?)";
    con.query(query, [name, email, phone, password1], (err, result) => {
        if (err) {
            console.error('Error signing up student: ' + err.message);
            throw err;
        }
        res.sendFile(path.join(__dirname, "./public/loginstudent.html"));
    });
});

// Student login
app.post("/loginstudent", function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    
    console.log("email is " + email);
    console.log("password is " + password);
    
    var q = "SELECT * FROM student WHERE email = ?";
    con.query(q, [email], function (err, result) {
        if (err) throw err;
        var L = result.length;
        console.log(L);
        if (L > 0) {
            var pw = result[0].password1;
            if (pw === password) {
                req.session.na = result[0].name;
                req.session.em = result[0].email;
                res.redirect("/Home.html");
            } else {
                res.redirect("/loginstudent.html?error=IncorrectPassword");
            }
        } else {
            res.redirect("/loginstudent.html?error=IncorrectEmail");
        }
    });
});


// view student account details

app.get("/studentdetails", function (req, res) {
    
    if (req.session.em) {
        var q = "SELECT * FROM student WHERE email='" + req.session.em + "'";
        con.query(q, function (err, result) {
            if (err) throw err;
            res.render("studentdetails",{data:result}); 
        });
    } 
});
// View notes by student
app.get("/viewnotesbystudent", (req, res) => {
    const query = "SELECT * FROM addbook";
    con.query(query, (err, result) => {
        if (err) {
            throw err;
        }
        res.render("viewnotesbystudent", { data: result });
    });
});

// Update student password
app.post("/updatepasswordstudent", (req, res) => {
    const { email, password1: oldPassword, password2: newPassword } = req.body;
    const query = "UPDATE student SET password1 = ? WHERE email = ? AND password1 = ?";
    con.query(query, [newPassword, email, oldPassword], (err, result) => {
        if (err) {
            console.error('Error updating password: ' + err.message);
            throw err;
        }
        if (result.affectedRows > 0) {
            res.redirect("/loginstudent.html");
        } else {
            res.redirect("/updatestudent.html");
        }
    });
});

// Delete student account
app.get("/Deletestudentaccount", (req, res) => {
    const email = req.query.em;
    const query = "DELETE FROM student WHERE email = ?";
    con.query(query, [email], (err, result) => {
        if (err) {
            console.error('Error deleting student account: ' + err.message);
            throw err;
        }
        res.redirect("/signup.html");
    });
});

// Download file
app.get("/Download", (req, res) => {
    const fileName = req.query.file;
    const filePath = path.join(__dirname, "Images", fileName);

    console.log("Requested file name:", fileName);
    console.log("Constructed file path:", filePath);

    res.download(filePath, fileName, (err) => {
        if (err) {
            console.error("Error downloading file:", err.message);
            res.status(500).send("File not found or cannot be downloaded.");
        } else {
            console.log("File downloaded successfully.");
        }
    });
});



// Logout student
app.get("/logoutstudent", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session: ' + err.message);
            throw err;
        }
        console.log("Session has been destroyed.");
        res.redirect("/loginstudent.html");
    });
});

// Handle other routes similarly (signupTeacher, loginTeacher, etc.)
// teacher signup

app.post("/signupTeacher", function (req, res) {
    var name = req.body.name;
   
    var email = req.body.email;
    var phone=req.body.phone;
    var password1 = req.body.password1;
    
    console.log("Name is " + name);
   
    console.log("email is " +email);
    console.log("phone number is " + phone);
    console.log("password1 is " + password1);
    
    var q = "insert into teacher values('"+name+"','"+email+"','"+phone+"','"+password1+"')";
    con.query(q, function (err, result) {
        if (err)
            throw err;
        res.sendFile("./public/loginteacher.html",{root:__dirname});
    });

});

// teacher login  

app.post("/loginTeacher", function (req, res) {
   
    var email = req.body.email;
   
    var password = req.body.password;
    
    console.log("email is " + email);
    console.log("password is " + password);
    
    var q = "select * from teacher where email='"+email+"'";
    con.query(q, function (err, result) {
        if (err) throw err;
        var L=result.length;
        
        if(L>0)
        {
           var pw=result[0].password;
            if(pw==password){
                req.session.tna=result[0].name;
                req.session.tem=result[0].email;
                res.redirect("teacherHome.html");
                
            }
                   
        else
        res.redirect("loginteacher.html?error=IncorrectPassword");

        }
        else
        res.redirect("/loginteacher.html?error=IncorrectEmail");
    });

});

//teacher details 

app.get("/teacher", function (req, res) {
    
    if (req.session.tem) {
        var q = "SELECT * FROM teacher WHERE email='" + req.session.tem + "'";
        con.query(q, function (err, result) {
            if (err) throw err;
            res.render("teacher",{data:result}); 
        });
    } 
});

//student details in teacher portal

app.get("/studentaccount", function (req, res) {
   
    
        var q = "SELECT * FROM student" ;
        con.query(q, function (err, result) {
            if (err) throw err;
            res.render("studentaccount",{data:result}); // 
        });
    
});

//update teacher account password

app.post("/updatepasswordteacher", function (req, res) {
   
    var email = req.body.email;
    var oldPassword = req.body.password1;
    var newPassword = req.body.password2;
    
    console.log("email is = " + email);
    console.log("old Password is = " + oldPassword);
    console.log("new Password is = " + newPassword);
    var q = "UPDATE teacher SET password = ? WHERE email = ? AND password = ?";
    con.query(q, [newPassword, email, oldPassword], function(err, result) {
        if (err) {
            throw err;
        }
        var affectedRows = result.affectedRows;
        if (affectedRows > 0) {
            res.redirect("loginTeacher.html");
        } else {
            res.redirect("updateteacher.html"); 
        }
    });
});

// Delete teacher self account

app.get("/Deleteteacheraccount",function(req,res){
    
    var a=req.query.em;
    
    var q="DELETE FROM teacher Where email ='"+a+"'";
    con.query(q, function(err,result){
        if(err) 
        throw err;
        res.redirect("signupteacher.html")
    });
});


// teacher logout

app.get("/logoutteacher",function(req,res){
    const sessionID = req.session.id;
req.sessionStore.destroy(sessionID, (err) => {
  // callback function. If an error occurs, it will be accessible here.
  if(err){
    return console.error(err)
  }
  console.log("The session has been destroyed!");
  res.redirect("/Loginteacher.html");

});
});

// admin login 

app.post("/loginAdmin", function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    
    console.log("email is " + email);
    console.log("password is " + password);
    
   
    var q = "SELECT * FROM admin WHERE email = ?";
    con.query(q, [email], function (err, result) {
        if (err) throw err;
        var L = result.length;
        console.log(L);
        if (L > 0) {
            var pw = result[0].password;
            if (pw === password) {
                req.session.aem = result[0].email;
                req.session.ana = result[0].name;
                req.session.aimage = result[0].imagename;
                res.render('admin', { name: req.session.ana, imagename: req.session.aimage });
            } else {
                res.redirect("/loginadmin.html?error=IncorrectPassword");
            }
        } else {
            res.redirect("/loginadmin.html?error=IncorrectEmail");
        }
    });
});
app.get('/admin', function(req, res) {
    const name = req.session.ana;
    const imagename = req.session.aimage;
    res.render('admin', { name, imagename });
});

// logout Admin

app.get("/Logoutadmin",function(req,res){
    const sessionID = req.session.id;
req.sessionStore.destroy(sessionID, (err) => {
  
  if(err){
    return console.error(err)
  }
 
  res.redirect("/Loginadmin.html");

});
});

// student details in admin portal

app.get("/studentaccountAdmin", function (req, res) {
  
    var q="select * from student";
    con.query(q,function(err,result)
    {
        if(err)
        throw err;
     
        res.render('studentaccountAdmin',{data:result});

    });
  
 });

 // teacher details in admin portal

 app.get("/teacheraccount", function (req, res) {
  
    var q="select * from teacher";
    con.query(q,function(err,result)
    {
        if(err)
        throw err;
     
        res.render('teacheraccount',{data:result});

    });
  
 });

 // view admin detail itself

 app.get("/adminaccount", function (req, res) {
    
    if (req.session.aem) {
        var q = "SELECT * FROM teacher WHERE email='" + req.session.aem + "'";
        con.query(q, function (err, result) {
            if (err) throw err;
            res.render("adminaccount",{data:result}); 
        });
    } 
});



//add notes by teacher

// Add New Book endpoint
app.post('/AddNewBook', function (req, res, next) {
    console.log(req.body);
    console.log(req.files);
    next(); // Continue to multer middleware
}, upload.fields([ // Use `upload` instead of `upd`
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]), function (req, res) {
    const imageFile = req.files['image'] ? req.files['image'][0] : null;
    const pdfFile = req.files['pdf'] ? req.files['pdf'][0] : null;

    if (!imageFile || !pdfFile) {
        return res.status(400).send('Both image and PDF files are required.');
    }

    const subject = req.body.subjectname;
    const name = req.body.bookname;
    const type = req.body.type;
    const imageName = imageFile.originalname;
    const pdfName = pdfFile.originalname;

    console.log("BookName is " + name);
    console.log("Booktype is " + type);
    console.log("Subject is " + subject);

    var q = "insert into addbook (subjectname, bookname, type, image, pdf) values (?, ?, ?, ?, ?)";
    con.query(q, [subject, name, type, imageName, pdfName], function (err, result) {
        if (err) throw err;
        res.redirect("vbook");
    });
});


app.get("/vbook",function(req,res)
{
var q="select * from addbook";
con.query(q,function(err,result)
{
res.render("courses",{data:result});

});

});

//view notes by teacher

app.get("/courses", function (req, res) {
  
    var q="select * from addbook";
    con.query(q,function(err,result)
    {
        if(err)
        throw err;
     
        res.render('courses',{data:result});

    });
  
 });

 // delete notes by teacher

 app.get("/Deletenotes",function(req,res){
    
    var a=req.query.em;
    
    var q="DELETE FROM addbook Where sno ='"+a+"'";
    con.query(q, function(err,result){
        if(err) 
        throw err;
        res.redirect("courses")
    });
});

//view notes by Admin

app.get("/viewnotesbyadmin", function (req, res) {
  
    var q="select * from addbook";
    con.query(q,function(err,result)
    {
        if(err)
        throw err;
     
        res.render('viewnotesbyadmin',{data:result});

    });
  
 });


//contact us in student portal

app.post("/Contact", function (req, res) {
   
    var name = req.body.name; 
    var email = req.body.email;
    var subject = req.body.subject;
    var message = req.body.message;
    console.log("Name is " + name);
    console.log("email is " +email);
    console.log("subject is " + subject);
    console.log("Message is " + message);
    var q = "insert into contact values('"+name+"','"+email+"','"+subject+"','"+message+"')";
    con.query(q, function (err, result) {
        if (err)
            throw err;
        res.sendFile( "./public/inquiry.html",{root:__dirname});
    });

});

// view student inquiry in teacher portal
app.get("/inquiry", function (req, res) {
   
    var q="select * from contact";
    con.query(q,function(err,result)
    {
        if(err)
        throw err;
     
        res.render('inquiry',{data:result});

    });
  
 });

 // delete student inquiry from teacher portal
 app.get("/Deleteinquiry",function(req,res){
    
    var a=req.query.em;
    
    var q="DELETE FROM contact Where email ='"+a+"'";
    con.query(q, function(err,result){
        if(err) 
        throw err;
        res.redirect("inquiry")
    });
});


// view student inquiry in admin portal
app.get("/studentdoubt", function (req, res) {
   
    var q="select * from contact";
    con.query(q,function(err,result)
    {
        if(err)
        throw err;
     
        res.render('studentdoubt',{data:result});

    });
  
 });

  // delete student inquiry by admin
 
  app.get("/DeletestudentInquiry",function(req,res){
    
    var a=req.query.em;
    
    var q="DELETE FROM contact Where email ='"+a+"'";
    con.query(q, function(err,result){
        if(err) 
        throw err;
        res.redirect("studentdoubt")
    });
});


//contact us in teacher portal

app.post("/teacherinquiry", function (req, res) {
   
    var name = req.body.name; 
    var email = req.body.email;
    var subject = req.body.subject;
    var message = req.body.message;
    console.log("Name is " + name);
    console.log("email is " + email);
    console.log("subject is " + subject);
    console.log("Message is " + message);
    var q = "insert into teacherdoubt values('"+ name+"','"+ email+"','"+ subject+"','"+message+"')";
    con.query(q, function (err, result) {
        if (err)
            throw err;
        res.sendFile( "./public/teacherinquiry.html",{root:__dirname});
    });

});

// view teacher inquiry in admin portal
app.get("/teacherinquiry", function (req, res) {
   
    var q="select * from teacherdoubt";
    con.query(q,function(err,result)
    {
        if(err)
        throw err;
     
        res.render('teacherinquiry',{data:result});

    });
  
 });

// delete teacher inquiry from admin portal
app.get("/DeleteteacherInquiry",function(req,res){
    
    var a=req.query.em;
    
    var q="DELETE FROM teacherdoubt Where email ='"+a+"'";
    con.query(q, function(err,result){
        if(err) 
        throw err;
        res.redirect("teacherinquiry")
    });
});

//

app.post("/contacts", function (req, res) {
   
    var name = req.body.name; 
    var email = req.body.email;
    var subject = req.body.subject;
    var message = req.body.message;
    console.log("Name is " + name);
    console.log("email is " +email);
    console.log("subject is " + subject);
    console.log("Message is " + message);
    var q = "insert into contact values('"+name+"','"+email+"','"+subject+"','"+message+"')";
    con.query(q, function (err, result) {
        if (err)
            throw err;
        res.sendFile( "./public/contact.html",{root:__dirname});
    });

});

// Start server
app.listen(3000, function () {
    console.log("Server is listening on port 3000");
});

