module.exports = {
  level: function(req, res, next){
    if(req.isAuthenticated() && req.user.level == 1){
      return next();
    }

    req.flash("error_msg", "Acesso Restrito")
    res.redirect("/")
  }
}
