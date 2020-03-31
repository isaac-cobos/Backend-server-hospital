var express = require('express');
var Hospital = require('../models/hospital');
var Medicos = require('../models/medico');
var Usuarios = require('../models/usuario');

var app = express();


//=================================
//Búsqueda por colección específica
//=================================

app.get('/coleccion/:tabla/:busqueda',(req, res)=> {
  var busqueda = req.params.busqueda;
  var regex = new RegExp(busqueda, 'i');
  var tabla = req.params.tabla;

  var promesa;

  switch(tabla) {
    case 'usuarios':
      promesa = busquedaUsuarios(busqueda, regex);
      break;

    case 'medicos':
      promesa = busquedaMedicos(busqueda, regex);
      break;

    case 'hospitales':
     promesa = busquedaHospitales(busqueda, regex);
     break; 

     default:
       return res.status(400).json({
         ok:false,
         mensaje:'Los tipos de busqueda sólo son: usuarios, medicos, hospitales',
         error:{message: 'Tipo de tabla/colección no válido'}
       })      
  }

  promesa.then(data => {
    res.status(200).json({
      ok:true,
      [tabla]: data
    })
  })

}), 



//==============================
//Búsqueda por colección General
//==============================
app.get('/todo/:busqueda', (req, res, next) => {
  var busqueda = req.params.busqueda;
  //nos creamos una expresión regular para que sea insensible
  //a la búsqueda de lo que queramos da igual mayusculua o minuscula o que contenga la letra
  var regex = new RegExp(busqueda, 'i');

  Promise.all([
    busquedaHospitales(busqueda, regex),
    busquedaMedicos(busqueda, regex),
    busquedaUsuarios(busqueda, regex)
  ]).then(respuestas => {
    res.status(200).json({
      ok: true,
      hospitales: respuestas[0],
      medicos: respuestas[1], 
      usuarios: respuestas[2]
    });
  });
});

function busquedaHospitales(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regex })
    .populate('usuario', 'nombre email img')
    .exec((err, hospitales) => {
      if (err) {
        reject('Error al cargar hospitales', err);
      } else {
        resolve(hospitales);
      }
    });
  });
}
function busquedaMedicos(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Medicos.find({ nombre: regex })
    .populate('usuario', 'nombre email img')
    .populate('hospital')
    .exec((err, medicos) => {
      if (err) {
        reject('Error al cargar medicos', err);
      } else {
        resolve(medicos);
      }
    });
  });
}
function busquedaUsuarios(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Usuarios.find({},'nombre email role img')
    .or([{'nombre': regex}, {'email': regex}])
    .exec((err, usuarios) => {
      if (err) {
        reject('Error al cargar usuarios', err);
      } else {
        resolve(usuarios);
      }
    });
  });
}

module.exports = app;
