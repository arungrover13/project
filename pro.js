const express = require('express');
const mysql = require('mysql2');
const app = express();
const fileupload = require('express-fileupload');

let nodemailer = require('nodemailer')
app.use(fileupload());
app.use(express.static('public'));
app.use(express.urlencoded("true"));

app.listen(2005, function() {
    console.log('Server started successfully on port 2005');
});

// let configobj = {
//     host: "127.0.0.1",
//     user: "root",
//     password: "Raman@12345678",
//     database: "project",
//     dateStrings: true
    
// };
let configobj = {
    host: "bmm98ergwz458z3r9yxi-mysql.services.clever-cloud.com",
    user: "uhkh7gtl72pnpflb",
    password: "a4e2Lfc3v498xJ9DCYDf",
    database: "bmm98ergwz458z3r9yxi",
    dateStrings: true,
    keepAliveInitialDelay:10000,
    enableKeepAlive:true
    
};

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

let sql = mysql.createConnection(configobj);

sql.connect(function(err) {
    if (err) {
        console.log("Error while connecting to DB:", err);
    } else {
        console.log("Connected to DB successfully");
    }
});

app.get("/inf",function(req,res){
    res.sendFile(__dirname+'/public/infl-dash.html');
})

app.get("/signupinfo", function(req, res) {
    let txtmail = req.query.txtmail;
    let txtpwd = req.query.txtpwd;
    let utype = req.query.utype;

    sql.query("insert into users (email, pwd, utype) VALUES (?, ?, ?)", [txtmail, txtpwd, utype], function(err, result) {
        if (err) {
            console.log("Error while inserting:", err);
            res.status(500).send("Error while inserting");
        } else {
            res.send("Signup successfully");
        }
    });
});

app.get("/login",function(req,res){

    let loginmail = req.query.loginmail;
    let loginpwd = req.query.loginpwd;

    sql.query("select * from users where email = ?",[loginmail],function(err,resular){
        if(err){
            console.log("error while searching");
        }
        if(resular.length==1){
            if(resular[0].pwd == loginpwd){
                if(resular[0].state ==1){
                   res.send(resular[0].utype);
                }
            }
            else{
                res.send("invalid password or email");
            }
        }
        else{
            res.send("Please signup first:")
        }
        // console.log(resular);

    })
})


app.get("/chkemail", function(req, res){
    sql.query("select * from users where email = ?", [req.query.txtmail], function(err, result){
        if (err) {
            res.send(err.message);
        } else {
            if (result.length === 0) {
                res.send("Valid Email");
            } else {
                res.send("Email is already entered");
            }
        }
    });
});

app.post("/jj",function(req,res){
    res.sendFile(__dirname+"/public/inf-profile.html");
})

app.post("/infsave",function(req,res){
    if (req.files!=null)
         {
        let profilePic = req.files.profile;
        let uploadPath = __dirname+"/public/upload/"+profilePic.name;
        profilePic.mv(uploadPath);

        let field = Array.isArray(req.body.txtfield) ? req.body.txtfield.join(",") : req.body.txtfield;
        
        sql.query("insert into infprofile (email,pwd,address,uname,num,gender,dob,field,instaid,facbookid,utubeid,oinfo,profilepic,city) value(?,?,?,?,?,?,?,?,?,?,?,?,?,?) ",[req.body.txtmail,req.body.txtpwd,req.body.txtaddress,req.body.txtuname,req.body.txtcontact,req.body.txtgender,req.body.txtdob,field,req.body.txtinstaid,req.body.txtfacebookid,req.body.txtutube,req.body.txtoinfo,req.files.profile.name,req.body.txtcity],function(err,resultar){
            if(err){
                console.log(err.message+"first");
            }
            else
                res.redirect("result.html");
        })
    }  
    else
    {
        sql.query("insert into (pwd,address,uname,num,gender,dob,field,instaid,facbook,utubeid,oinfo,city)infprofile value(?,?,?,?,?,?,?,?,?,?,?,?) where email = ?",[req.body.txtpwd,req.body.txtaddress,req.body.txtuname,req.body.txtcontact,req.body.txtgender,req.body.txtdob,req.body.txtfield,req.body.txtinstaid,req.body.txtfacebookid,req.body.txtutube,req.body.txtoinfo,req.body.txtcity,req.body.txtmail],function(err,resultar){
            if(err){
                console.log(err.message+"second");
            }
            else
                res.redirect("result.html");
        })

    } 

})


app.post("/infupdate", function(req, res) {
    
    let txtmail = req.body.txtmail ;
    let txtpwd = req.body.txtpwd;
    let txtaddress = req.body.txtaddress;
    let txtuname = req.body.txtuname;
    let txtcontact = req.body.txtcontact;
    let txtgender = req.body.txtgender;
    let txtdob = req.body.txtdob;
    let txtfield = Array.isArray(req.body.txtfield) ? req.body.txtfield.join(",") : req.body.txtfield;
    let txtinstaid = req.body.txtinstaid;
    let txtfacebookid = req.body.txtfacebookid;
    let txtutube = req.body.txtutube;
    let txtoinfo = req.body.txtoinfo;
    let txtcity = req.body.txtcity;
    // let hdnpic = req.body.hdn;
    let profilepic = req.body.profilepic;
   

    
    // Handle profile picture upload
    if (req.files && req.files.profile) {
        let profilePic = req.files.profile;
        let uploadPath = __dirname + "/public/upload/" + profilePic.name;

        profilePic.mv(uploadPath, function(err) {
            if (err) {
                console.log("Error while uploading profile picture:", err);
                res.status(500).send("Error while uploading profile picture");
                return;
            }
            profilepic = profilePic.name; // Update profile picture name in form data
            updateProfile();
        });
    } else {
        // profilepic = req.body.hdn;
        // console.log(req.body.hdn);
        updateProfile();
    }

    function updateProfile() {
        // Update the profile in the database
        sql.query(
            "UPDATE infprofile SET pwd = ?, address = ?, uname = ?, num = ?, gender = ?, dob = ?, field = ?, instaid = ?, facbookid = ?, utubeid = ?, oinfo = ?, profilepic = ?, city = ? WHERE email = ?",
            [txtpwd, txtaddress, txtuname, txtcontact, txtgender, txtdob, txtfield, txtinstaid, txtfacebookid, txtutube, txtoinfo, profilepic,txtcity,txtmail],
            function(err, result) {
                if (err) {
                    console.log("Error while updating profile:", err.message);
                    res.status(500).send("Error while updating profile");
                } else {
                    console.log("Updated successfully:", result);
                    res.send("Updated successfully");
                }
            }
        );
    }
});

app.get("/check-client",function(req,res){
   
    sql.query("select * from cprofile where email = ?",[req.query.txtemail],function(err,result){
        if(err){
            res.send(err.message);
        }
        else{
            res.send(result);
        }
    })
})
app.get("/client-modify",function(req,res){
    sql.query("update cprofile set cname = ?,city = ?,state = ?,contact = ?,indorg = ? where email = ?",[req.query.txtname,req.query.txtcity,req.query.txtstate,req.query.txtcontact,req.query.txtindorg,req.query.txtemail],function(err,result){
        if(err){
            res.send(err.message);
        }
        else
        {
            res.send("Modified Successfully");
        }
    })
})
// app.get("/chckobj",function(req,res){
//     sql.query("select * from infprofile where email = ?",[req.query.txtmail],function(err,result){
//         if(err){
//             res.send(err.message);
//         }
//         else {
//             res.send(result)
//         }
//     })
// })

// app.get("/fillall",function(req,res){

//     let txtmail = req.query.txtmail;

//     sql.query("select * from infprofile where email = ?",[txtmail],function(err,resular){
//         if(err){
//             console.log(err.message);
//         }
//         else{
//             res.send(resular);
//         }

//     })

// })

app.post("/getinfo",function(req,res){
    sql.query("select * from infprofile where email = ?",[req.body.txtmail],function(err,result){
        if(err){
            res.send(err.message);
        }
        else {
            res.send(result);
        }
    })
})
 
app.get("/book", (req, res) => {
    
    const { bookmail, booktitle, bookdate, booktime, bookcity, bookvenue } = req.query;
    
    const query = "insert into tevents (email, even, doe, tos, city, venue) value (?, ?, ?, ?, ?, ?)";
    const values = [bookmail, booktitle, bookdate, booktime, bookcity, bookvenue];

    sql.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting into tevents:', err.message);
         } else {
            console.log('Inserted into tevents successfully');
            res.send('Inserted successfully');
        }
    });
});

app.get("/setting", (req, res) => {
    const { settingmail, settingnewpwd, settingoldpwd, settingrepeatpwd } = req.query;

    if (settingnewpwd === settingrepeatpwd && settingnewpwd !== settingoldpwd) {
        const query = "update users set pwd = ? where email = ?";
        const values = [settingnewpwd, settingmail];

        // sql.query("update infprofile set pwd = ? where email = ?",[settingnewpwd,req.query.settingmail],function(err,result){
        //     if(err){
        //         res.send(err.message);
        //     }
        //     res.send("updated succesfully");
        // })


        sql.query(query, values, (err, result) => {
            if (err) {
                console.error('Error updating password:', err.message);
             } else {
                console.log('Password updated successfully');
                res.send('Updated successfully');
            }
        });
    } else {
        res.status(400).send('New password and repeat password do not match or are the same as the old password');
    }
});

app.get("/forget",function(req,res){

    
    var transporter = nodemailer.createTransport({
        service: 'gmail',
          auth: {
           user: 'arungrover488@gmail.com',
            pass: 'saiedtbxyjwzcmry'
          }
        }); 
 
        var mailOptions = {
          from: 'arungrover488@gmail.com',
          to: req.query.forgetmail,
          subject: "forget password",
          text: 'That was easy!'
        };

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            res.send("Email sent succesfully");
            console.log('Email sent: ' + info.response);
          }
        });
})

// ================================================================================ //
// Admin panel

app.get("/admin",function(req,res){
    let path = __dirname+"/public/admin-dash.html";
    res.sendFile(path);
})

app.get("/admin-user",function(req,res){

    let path = __dirname+"/public/admin-user.html";
    res.sendFile(path);

})

app.get("/fetch-all-data",function(req,res){

    sql.query("select * from users",[],function(err,resular){
        if(err){
            console.log(err.message);
        }
        else{
            res.send(resular);
        }
    })

})

// ======================================= //
//blocking wala

app.get("/block-one",function(req,res){
    let email = req.query.email;
    sql.query("update users set state = 0 where email = ?",[email],function(err,resul){
        if(err){
            res.send(err.message)
        }
        else
        {
            res.send("updated succesfully");
        }
    })
})


app.get("/unblock-one",function(req,res){
    let email = req.query.email;
    sql.query("update users set state = 1 where email = ?",[email],function(err,resul){
        if(err){
            res.send(err.message)
        }
        else
        {
            res.send("unblocked ");
        }
    })
})

app.get("/delete-one",function(req,res){
    let email = req.query.email;
    // let utype = req.query.utype;
    // if(utype=="influencer"){
    //     sql.query("delete from infprofile where email = ?",[email],function(err,result){
    //         if(err){
    //             res.send(err.message);
    //         }
    //         else{
    //             res.send("deleted from infprofile");
    //         }
    //     })
    // }
    sql.query("delete from users where email = ?",[email],function(err,resul){
        if(err){
            res.send(err.message)
        }
        else
        {
            res.send("deleted ");
        }
    })
})

// =====================================
// infprofile


app.get("/inf-console",function(req,res){
    let path = __dirname+"/public/admin-all-infu.html";
    res.sendFile(path);
})

app.get("/fetch-all-influencer",function(req,res){
  
    sql.query("select * from infprofile",[],function(err,resular){
        if(err){
            console.log(err.message);
        }
        else{
            res.send(resular);
        }
    })  
})

app.get("/filter-utype", function(req, res) {
    let utype = req.query.utype;
    sql.query("SELECT * FROM users WHERE utype = ?", [utype], function(err, results) {
        if (err) {
            console.log(err.message);
        } else {
            res.send(results);
        }
    });
});

app.get("/inf-find",function(req,res){
    let path = __dirname+"/public/inf-finder.html";
    res.sendFile(path);
})

app.get("/filter-City", function(req, res) {
    let field = "%" + req.query.field + "%";

    sql.query("select distinct city from infprofile where field LIKE ?", [field], function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).send(err.message);
        } else {
            res.json(result);
        }
    });
});


app.get("/find-sel", function(req, res) {
    let field = "%" + req.query.field + "%";
    let city = "%" + req.query.city + "%";
    sql.query("SELECT * FROM infprofile WHERE field LIKE ? AND city LIKE ?", [field, city], function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).send(err.message);
        } else {
            res.json(result);
        }
    });
});


app.get("/find-by-name", function(req, res) {
    let uname = "%"+req.query.uname+"%";
    sql.query("select * from infprofile where uname LIKE ? ", [uname], function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).send(err.message);
        } else {
            res.json(result);
        }
    });
});

app.get("/event-man",function(req,res){
    let path = __dirname+"/public/event-manager.html";
    res.sendFile(path);
})

app.get("/fetch-events",function(req,res){
    let email = req.query.email;
    sql.query("select * from tevents where email =? ",[email],function(err,result){
        if(err){
            res.send(err);
        }
        else
        {
            res.send(result);
        }
    })
})
app.get("/find-influencer",function(req,res){
    let path = __dirname+"/public/inf-finder.html";
    res.sendFile(path);
})

app.get("/client-profile",function(req,res){
    let path = __dirname+"/public/client-profile.html";
    res.sendFile(path);
})

app.get("/client-save",function(req,res){
    sql.query("insert into cprofile (email,cname,city,state,contact,indorg)value(?,?,?,?,?,?) ",[req.query.txtemail,req.query.txtname,req.query.txtcity,req.query.txtstate,req.query.txtcontact,req.query.txtindorg],function(err,result){
        if(err){
            res.send(err.message);
        }
        else
        {   
            res.send(result);    
        }
    })
})

app.get("/delone-event",function(req,res){
    sql.query("delete from tevents where doe = ? ",[req.query.doe],function(err,result){
        if(err){
            res.send(err.message);
        }
        else
        {
            res.send("delted succesfully");
        }
    })
})

app.get("/next",function(req,res){
    res.sendFile(__dirname+"/public/admin-dash.html");
})

app.get("/send-request",function(req,res){
    let email  = req.query.email;
    var transporter = nodemailer.createTransport({
        service: 'gmail',
          auth: {
           user: 'arungrover488@gmail.com',
            pass: 'saiedtbxyjwzcmry'
          }
        }); 
 
        var mailOptions = {
          from: 'arungrover488@gmail.com',
          to: email,
          subject: "i wanna meetup",
          text: 'Respond when u r fee'
        };

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            res.send("Email sent succesfully");
            console.log('Email sent: ' + info.response);
          }
        });  
})
app.get("/chksrch", (req, res) => {
    sql.query("select * from infprofile where email = ?", [req.query.txtmail], (err, result) => {
        if (err) {
            res.send(err.message);
        } else if (result.length == 1) {
            res.send(true);
        } else {
            res.send(false);  // If no record is found
        }
    });
});