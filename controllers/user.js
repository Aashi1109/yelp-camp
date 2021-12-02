const User = require("../models/users");

module.exports.register = (req, res) => {
  res.render("user/register");
};

module.exports.login = (req, res) => {
  res.render("user/login");
};

module.exports.logout = (req, res) => {
  req.logout();
  res.redirect("/camp");
};

module.exports.loginUser = (req, res) => {
  const redirectTo = req.session.returnTo || "/camp";
  delete req.session.returnTo;
  req.flash("success", `Welcome back, ${req.user.username}`);
  res.redirect(redirectTo);
};

module.exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ email, username });
    const registerUser = await User.register(user, password);
    req.login(registerUser, (err) => {
      if (err) return next(err);
      req.flash("success", "User registered successfully");
      // console.log(registerUser);
      res.redirect("/camp");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};
