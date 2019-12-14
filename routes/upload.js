var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuarios = require('../models/usuario');
var Hospitales = require('../models/hospital');
var Medicos = require('../models/medico');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', function(req, res) {
  var tipo = req.params.tipo;
  var id = req.params.id;

  //Tipos de colección
  var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Tipo de colección no es válido',
      errors: { message: 'Tipo de colección no es válido' }
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: 'No selecciono nada',
      errors: {
        message: 'Debe de seleccionar una imagen'
      }
    });
  }
  //Obtener nombre del archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split('.');
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];

  //Solo estas extensiones aceptamos
  var extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];
  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Extension no válida',
      errors: {
        message:
          'Las extensiones válidas son' + ' ' + extensionesValidas.join(', ')
      }
    });
  }

  //Nombre de archivo personalizado
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  //Mover el archivo del temporal a un path

  var path = `./uploads/${tipo}/${nombreArchivo}`;
  archivo.mv(path, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al mover el archivo',
        errors: err
      });
    }
    subirPorTipo(tipo, id, nombreArchivo, res);
  });
});
function subirPorTipo(tipo, id, nombreArchivo, res) {
  if (tipo === 'usuarios') {
    Usuarios.findById(id, (err, usuario) => {
      if (!usuario) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Usuario no existe',
          errors: { message: 'Usuario no existe' }
        });
      }
      var pathViejo = './uploads/usuarios/' + usuario.img;
      //Si existe, elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      }
      usuario.img = nombreArchivo;
      usuario.save((err, usuarioActualizado) => {
        usuarioActualizado.password = ':)';
        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen de usuario actualizado',
          usuario: usuarioActualizado
        });
      });
    });
  }

  if (tipo === 'hospitales') {
    Hospitales.findById(id, (err, hospital) => {
      if (!hospital) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Hospital no existe',
          errors: { message: 'Hospital no existe' }
        });
      }
      var pathViejo = './uploads/hospitales' + hospital.img;
      //Si existe, elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      }
      hospital.img = nombreArchivo;
      hospital.save((err, hospitalActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen hospital actualizado',
          hospital: hospitalActualizado
        });
      });
    });
  }
  if (tipo === 'medicos') {
    Medicos.findById(id, (err, medico) => {
      if (!medico) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Medico no existe',
          errors: { message: 'Medico no existe' }
        });
      }
      var pathViejo = './uploads/medicos' + medico.img;
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      }
      medico.img = nombreArchivo;
      medico.save((err, medicoActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen medico actualizado',
          medico: medicoActualizado
        });
      });
    });
  }
}

module.exports = app;
