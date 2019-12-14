var express = require('express');
var app = express();
var mdAutenticacion = require('../middlewares/autenticacion');

var Medico = require('../models/medico');

//===================================
//Obtener todos los medicos
//===================================

app.get('/', (req, res, next) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);
  Medico.find({})
    //populate es una función de mongoose en el cual
    //le pasamos que campo y de que tabla queremos la información
    //Le podemos pasar de las tablas que tenemos definido tal como usuario, hospital
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .skip(desde)
    .limit(5)
    .exec((err, medicos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando medico',
          errors: err
        });
      }
      Medico.count({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          medicos: medicos,
          total: conteo
        });
      });
    });
});
//===================================
//Actualizar un medico
//===================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
  var id = req.params.id;
  var body = req.body;

  Medico.findById(id, (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el medico',
        errors: err
      });
    }

    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un medico con ese' + id,
        errors: { message: 'No existe un medico con ese ID' }
      });
    }

    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;

    medico.save((err, medicoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar medico',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        medico: medicoGuardado
      });
    });
  });
});
//===================================
//Crear un medico
//===================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital
  });
  medico.save((err, medicoGuardado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al crear medico',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      medico: medicoGuardado
    });
  });
});

//===================================
//Borrar un medico
//===================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar el medico con ese' + id,
        errors: err
      });
    }
    if (!medicoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El medico con ese' + id + ' no existe',
        errors: err
      });
    }
    res.status(200).json({
      ok: true,
      medico: medicoBorrado
    });
  });
});

module.exports = app;
