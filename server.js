const express = require("express")
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const passport = require("passport")
const flash = require("connect-flash");
const session = require("express-session")
const LocalStrategy = require("passport-local")
const User = require("./models/user")
const Question = require("./models/Question")
const Score = require("./models/scores")
const methodOverride = require('method-override')
mongoose.connect('mongodb://127.0.0.1:27017/QuizzHub')
    .then(() => {
        console.log("DATABASE Connected")
    })
    .catch(err => {
        console.log(err)
    })

const sessionConfig = {
    secret: "fsdgfsd",
    resave: false,
    saveUninitalized: true,
    cookire: {
        httpOnly: true,
    }
}
const questionsArray = [];
let QuizN = null;
let Qnumber = 1;
let ExtractedQuiz = []
let i = 0;
let score = 0;
let options = [];
let userScores = [];
let quizLength = null;
let CurrentfoundQuiz1 = null;
let CurrentfoundQuiz2 = null;
let ans = null
let hide = false;
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }));
app.use(express.static("publicS"))
app.use(session(sessionConfig))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})

passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())



app.set("views", path.join(__dirname, "views"));
app.set(express.static(path.join(__dirname, "publicS")))
app.set("view engine", "ejs")

//GET
app.get("/home", (req, res) => {
    res.render("QuizzHub/index")
    score = 0;
    i = 0;
})
app.get("/login", (req, res) => {
    res.render("LoginPageQuiz/login")
})
app.get("/signUp", (req, res) => {
    res.render("SignUpPage/signUp")
})

app.get("/attemptQuiz/:userID/:QuizName", async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }
    let { userID } = req.params;
    let { QuizName } = req.params;
    let foundQuiz = await Question.find({ "username": userID, "QuizName": QuizName })
    ExtractedQuiz = foundQuiz
    i = 0;
    score = 0;
    quizLength = ExtractedQuiz.length;
    options.push(ExtractedQuiz[i].option1)
    options.push(ExtractedQuiz[i].option2)
    options.push(ExtractedQuiz[i].option3)
    options.push(ExtractedQuiz[i].option4)
    let randomOptions = options.sort(() => 0.5 - Math.random());
    let ans = ExtractedQuiz[i].option4
    res.render("QuizzHubAttemptQuiz/index", { foundQuiz: ExtractedQuiz[i], i, quizLength, randomOptions, score })
})

app.get("/attemptQuiz/:userID/:QuizName/next", async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }
    options = [];
    let userAns = req.query.ans
    let { userID } = req.params;
    let { QuizName } = req.params;
    if (userAns === ans) {
        score += 10;
    }
    if (i < quizLength - 1) {
        i++;
        options.push(ExtractedQuiz[i].option1)
        options.push(ExtractedQuiz[i].option2)
        options.push(ExtractedQuiz[i].option3)
        options.push(ExtractedQuiz[i].option4)
        let randomOptions = options.sort(() => 0.5 - Math.random());
        ans = ExtractedQuiz[i].option4
        res.render("QuizzHubAttemptQuiz/index", { foundQuiz: ExtractedQuiz[i], randomOptions, score, userID, QuizName })
    } else {
        let foundQuiz = null;
        res.render("QuizzHubAttemptQuiz/index", { foundQuiz, score, userID, QuizName })
    }
})


app.get("/createQuiz", (req, res) => {
    i = 0;
    score = 0;
    hide = false;
    ExtractedQuiz = [];
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }
    Qnumber = 1;
    QuizN = null;
    const username = req.user;
    res.render("QuizzHubCreateQuiz/index", { QuizN, Qnumber, username, hide })
})
app.get("/serachFriend", async (req, res) => {
    i = 0;
    score = 0;
    hide = false;
    ExtractedQuiz = [];
    const username = req.user;
    let foundUser = null
    CurrentfoundQuiz1 = await Question.findOne({ "username": username.username })
    if (CurrentfoundQuiz1) {
        CurrentfoundQuiz2 = await Question.findOne({ "username": username.username, "QuizName": { $ne: CurrentfoundQuiz1.QuizName } })
    }
    res.render("QuizzHubQuiz/Quiz", { username, foundUser, CurrentfoundQuiz1, CurrentfoundQuiz2 })
})

app.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
    });
    res.redirect("/home");
})

app.get("/scoreCards", async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }
    i = 0;
    ExtractedQuiz = [];
    let { username } = req.user
    userScores = await Score.find({ "username": username });

    res.render("ScorePage/index", { userScores })
})

app.get("/createQuiz/submit", async (req, res) => {
    i = 0;
    ExtractedQuiz = [];
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }
    try {
        const username = req.user;
        const enteredQuestion = await Question.insertMany(questionsArray)
        Qnumber = 1;
        QuizN = null;
        hide = false;
        res.render("QuizzHubCreateQuiz", { QuizN, Qnumber, username, hide })
    } catch {
        res.redirect("/createQuiz")
    }
})

//POST
app.post("/updateScores/:userID/:QuizName/submit", async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }
    const { userID } = req.params;
    const username = req.user.username;
    const { QuizName } = req.params;
    const { score } = req.body;
    let savedScore = new Score({ "createdUser": userID, QuizName, "score": score, "username": username })
    savedScore.save();
    console.log(savedScore)
    res.redirect("/serachFriend")
})
app.post("/userSearchResults", async (req, res) => {
    i = 0;
    ExtractedQuiz = [];
    hide = false;
    const { usernameSearch } = req.body;
    let foundUser = await User.findOne({ "username": usernameSearch })
    if (!foundUser) {
        foundUser = "1";
    }
    const username = req.user;
    let foundQuiz1 = await Question.findOne({ "username": usernameSearch })
    if (!foundQuiz1) {
        foundQuiz1 = null;
        let foundQuiz2 = null;
        res.render("QuizzHubQuiz/Quiz", { username, foundUser, foundQuiz1, foundQuiz2, CurrentfoundQuiz1, CurrentfoundQuiz2 })

    } else {
        let foundQuiz2 = await Question.findOne({ "username": usernameSearch, "QuizName": { $ne: foundQuiz1.QuizName } })
        res.render("QuizzHubQuiz/Quiz", { username, foundUser, foundQuiz1, foundQuiz2, CurrentfoundQuiz1, CurrentfoundQuiz2 })
    }
    // res.render("QuizzHubQuiz/Quiz", { username })
})
app.post("/login", passport.authenticate("local"), (req, res) => {
    res.redirect("/createQuiz")
})
app.post("/signUp", async (req, res) => {
    // res.send(req.body);
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password)
        console.log(registeredUser)
        res.redirect("/createQuiz")
    } catch {
        res.redirect("/signUp")
    }
})

app.post("/createQuiz/question", async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }
    if (req.body.QuizName === "" || req.body.Question === "" || req.body.option1 === "" || req.body.option2 === "" || req.body.option3 === "" || req.body.option4 === "") {
        return res.redirect("/createQuiz");
    }
    const username = req.user;
    const enteredQuestion = new Question(req.body);
    questionsArray.push(req.body);
    console.log(questionsArray);
    QuizN = req.body.QuizName;
    Qnumber = Qnumber + 1;
    hide = true;
    res.render("QuizzHubCreateQuiz", { QuizN, Qnumber, username, hide })
})




//DELETE
app.delete("/serachFriend/deleteQuiz/:QuizName", async (req, res) => {
    i = 0;
    ExtractedQuiz = [];
    hide = false;
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }
    let { username } = req.user
    let { QuizName } = req.params;
    let que = await Question.deleteMany({ "username": username, "QuizName": QuizName })
    res.redirect("/serachFriend")
})

app.listen(3000, () => {
    console.log("Server Connected")
})