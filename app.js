//Carregando módulos
  const express = require('express')
  const handlebars = require('express-handlebars')
  const bodyParser = require('body-parser')
  const app = express()
  const admin = require("./routes/admin")
  const path = require("path")
  const mongoose = require('mongoose')
  const session = require('express-session')
  const flash = require('connect-flash')
  //Model de Artigos
  require("./models/Artigo")
  const Artigo = mongoose.model("artigos")
  //Model de Categorias
  require("./models/Categoria")
  const Categoria = mongoose.model("categorias")
  const usuarios = require('./routes/usuarios')
  //login/Sessão
  const passport = require("passport")
  require("./config/auth")(passport)



//Configurações
  //sessao
    app.use(session({
      secret: "curso",
      resave: true,
      saveUnitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())
  //middleware
    app.use((req, res, next)=>{
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null
        next()

    })
  //bodyParser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
  //handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars');
  //mongoose
    mongoose.connect("mongodb://localhost/blogapp").then(()=>{
      console.log('Conectado ao Mongo, Banco: blogapp')
    }).catch((err)=>{
      console.log('Erro ao se conectar '+err)
    })


//Public
  app.use(express.static(path.join(__dirname,"public" )))

//Rotas
  app.get('/', (req,res)=>{
    Artigo.find().lean().populate("categoria").sort({data:"desc"}).then((artigos)=>{
      res.render('index', {artigos:artigos})
    }).catch((err)=>{
      req.flash("error_msg", "Houve um erro interno")
      res.redirect("/404")
    })

  })

  app.get("/artigo/:slug", (req,res)=>{
    Artigo.findOne({slug: req.params.slug}).lean().populate("categoria").then((artigos)=>{
      if(artigos){
        res.render("artigo/index", {artigos:artigos})
      }else{
        req.flash("error_msg", "Artigo não encontrado")
        res.redirect("/")
      }
    }).catch((err)=>{
      req.flash("error_msg", "Houve um erro interno")
      res.redirect("/")
    })
  })

  app.get("/categorias", (req,res)=>{
    Categoria.find().lean().then((categorias)=>{
    res.render("categorias/index", {categorias:categorias})
    }).catch((err)=>{
      req.flash("error_msg", "Houve um erro interno")
      res.redirect("/")
    })
  })
app.get("/categoria/:slug/artigos", (req, res)=>{
Categoria.findOne({slug: req.params.slug}).lean().then((categorias)=>{
  if(categorias){
    Artigo.find({categoria:categorias._id}).lean().then((artigos)=>{
        res.render("categorias/artigos", {artigos:artigos, categorias:categorias})
        console.log(artigos)
    }).catch((err)=>{
      req.flash("error_msg", "Houve um erro ao exibir os Artigos")
      res.redirect("/categorias")
    })
  }else{
    req.flash("error_msg", "Categoria não encontrada")
    res.redirect("/")
  }
}).catch((err)=>{
  req.flash("error_msg", "houve um erro interno")
  res.redirect("/")
  })
})

  app.get("/404", (req,res)=>{
    res.send("Error 404 - Página não encontrada")
  })






//Rotas externas
  app.use('/painel', admin)
  app.use('/usuarios', usuarios)








//Outros
const PORT = 8080
app.listen(PORT, () =>{
  console.log('Servidor rodando')
})
