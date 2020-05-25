const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
//Importando o model
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Artigo")
const Artigo = mongoose.model("artigos")
const {level} = require("../helpers/level")


router.get('/', (req, res) =>{
  res.render('painel/index')
})

router.get('/posts', level, (req, res) =>{
  res.send("Página de Posts")
})

router.get('/categorias', level, (req, res) =>{
  Categoria.find().sort({date:'desc'}).then((categorias)=>{
    res.render('painel/categorias', {categorias: categorias.map(categoria => categoria.toJSON())})
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar as categorias")
    res.redirect("/painel")
  })

})
router.get('/categorias/add', level, (req, res) =>{
  res.render('painel/addcategorias')
})
router.post('/categorias/nova', (req, res) =>{

  var erros = []

  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({texto: "Nome inválido"})
  }
  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    erros.push({texto: "Link inválido"})
  }
  if(req.body.nome.length <2){
    erros.push({texto: "Nome da categoria precisa ter 3 ou mais caracteres"})
  }
  if(erros.length > 0){
    res.render("painel/addcategorias", {erros: erros})
  }
  else{

      const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
      }

      new Categoria(novaCategoria).save().then(() => {
        //console.log('Categoria Salva')
        req.flash("success_msg", "Categoria criada com sucesso!")
        res.redirect("/painel/categorias")
      }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente.")
        console.log('Ocorreu um erro: '+err)
        res.redirect("/painel/artigos")
      })
  }

})
router.get("/categorias/edit/:id", level, (req, res)=>{
  Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
    res.render("painel/editcategorias", {categoria: categoria})
  }).catch((err)=>{
    req.flash("error_msg", "Esta categoria não existe")
    res.redirect("/painel/categorias")
  }).catch((err)=>{
    req.flash("error_msg", "Houve um erro interno ao salvar a edição")
    res.redirect("/painel/categorias")
  })

})

router.post("/categorias/edit", level, (req, res)=>{
  Categoria.findOne({_id:req.body.id}).then((categoria)=>{
    categoria.nome = req.body.nome,
    categoria.slug = req.body.slug
    categoria.save().then(()=>{
      req.flash("success_msg", "Categoria editada com sucesso")
      res.redirect("/painel/categorias")
    })
  }).catch((err)=>{
    req.flash("error_msg", "Houve um erro ao editar a categoria")
    res.redirect('/admin/categorias')
  })
})

router.post("/categorias/deletar", level, (req,res)=>{
  Categoria.remove({_id: req.body.id}).then(()=>{
    req.flash("success_msg", "Categoria deletada")
    res.redirect("/painel/categorias")
  }).catch((err)=>{
    req.flash("error_msg", "Houve um erro ao deletar a categoria")
    res.redirect("/painel/categorias")
  })
})

router.get("/artigos", level, (req, res)=>{
  Artigo.find().lean().populate("categoria").sort({data:"desc"}).then((artigos)=>{
    res.render("painel/artigos", {artigos: artigos})
  }).catch((err)=>{
    req.flash('error_msg', "Houve um erro ao listar os artigos")
    res.render('/painel')
  })

})

router.get("/artigos/add", level, (req,res)=>{
  Categoria.find().lean().then((categoria)=>{
  res.render("painel/addartigos", {categoria: categoria})
}).catch((err)=>{
  req.flash("error_msg", "Houve um erro ao carregar o formulário")
  res.redirect("/painel")
})
})

router.post("/artigos/novo", level, (req, res)=>{

  var erros = []

  if(req.body.categoria == "0"){
    erros.push({text: "Categoria inválida, registre uma categoria"})
  }

  if(erros.length > 0){

  }else{

  const novoArtigo = {
    titulo: req.body.titulo,
    slug: req.body.slug,
    descricao: req.body.descricao,
    conteudo: req.body.conteudo,
    categoria: req.body.categoria
  }

  new Artigo(novoArtigo).save().then(() => {
    //console.log('Artigo Salvo')
    req.flash("success_msg", "Artigo criado com sucesso!")
    res.redirect("/painel/artigos")
  }).catch((err)=>{
    req.flash("error_msg", "Houve um erro ao salvar o artigo, tente novamente.")
    console.log('Ocorreu um erro: '+err)
    res.redirect("/painel/artigos")
  })
}
})

router.get("/artigos/edit/:id", level, (req, res)=>{
  Artigo.findOne({_id: req.params.id}).lean().then((artigos)=>{
    Categoria.find().lean().then((categoria)=>{
      res.render("painel/editartigos", {categoria: categoria, artigos:artigos})
    }).catch((err)=>{
      req.flash("error_msg", "Houve um erro ao listas as categorias")
      res.redirect("/painel/artigos")
    })
  }).catch((err)=>{
    req.flash("error_msg", "Houve um erro ao carregar o formulário")
    res.redirect("/painel/artigos/")
  })
})



router.post("/artigos/edit", level, (req, res)=>{
  Artigo.findOne({_id:req.body.id}).then((artigo)=>{
    artigo.titulo = req.body.titulo,
    artigo.slug = req.body.slug,
    artigo.descricao = req.body.descricao,
    artigo.conteudo = req.body.conteudo,
    artigo.categoria = req.body.categoria

    artigo.save().then(()=>{
      req.flash("success_msg", "Artigo alterado com sucesso!")
      res.redirect("/painel/artigos")
    }).catch((err)=>{
      req.flash("error_msg", "Houve um erro interno")
      res.redirect("/painel/artigos")
    })
  }).catch((err)=>{
    req.flash("error_msg", "Houve um erro ao salvar")
    res.redirect("/painel/artigos")
  })
})

router.post("/artigos/deletar", level, (req,res)=>{
  Artigo.remove({_id: req.body.id}).then(()=>{
    req.flash("success_msg", "Artigo Deletado")
    res.redirect("/painel/artigos")
  }).catch((err)=>{
    req.flash("error_msg", "Houve um erro ao deletar o Artigo")
    res.redirect("/painel/artigos")
  })
})

module.exports = router
