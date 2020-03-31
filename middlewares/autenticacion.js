var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


//==============================================
//Verificación Token 
//==============================================
exports.verificaToken = function(req, res, next) {
  var token = req.query.token;

  jwt.verify(token, SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Token incorrecto',
        errors: err
      });
    }

    req.usuario = decoded.usuario;
    next();
  });
};

//==============================================
//Verificación Admin
//==============================================
exports.verificaAdmin_Role = function(req, res, next) {
  var usuario = req.usuario;

  if ( usuario.role === 'ADMIN_ROLE') {
    next();
    return;
  } else {
    return res.status(401).json({
      ok:false,
      mensaje: 'Token incorrecto - No es un administrador',
      errors: { message: 'No es un administrador, no puede hacer eso'}
    })
  }
};

//==============================================
//Verificación Admin o Mismo Usuario
//==============================================
exports.verificaAdmin_o_MismoUsuario = function(req, res, next) {
  var usuario = req.usuario;
  var id = req.params.id;

  if ( usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
    next();
    return;
  } else {
    return res.status(401).json({
      ok:false,
      mensaje: 'Token incorrecto - No es un administrador o el mismo usuario',
      errors: { message: 'No es un administrador, no puede hacer eso'}
    })
  }
};