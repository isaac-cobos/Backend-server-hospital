var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
  values: ['ADMIN_ROLE', 'USER_ROLE'],
  message: '{VALUE} no es un role permitido'
};

var usuarioSchema = new Schema({
  nombre: { type: String, required: [true, 'El nombre es necesario'] },
  email: {
    type: String,
    unique: true,
    required: [true, 'El correo es necesario']
  },
  password: { type: String, required: [true, 'La contraseña es necesaria'] },
  img: { type: String, required: false },
  role: {
    type: String,
    required: true,
    default: 'USER_ROLE',
    enum: rolesValidos
  }
});

//Así controlamos que los campos únicos de nuestro modelo pues que en la consola lo diga.
//{PATH} lee la propiedad del modelo que sea requerido y lo dice
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);
