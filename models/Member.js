const mongoose = require('mongoose');
//const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const MemberSchema = new Schema({
    firstName: { type: String },
    surName: { type: String }, 
    idCard: { type: Number  },
    userName: { type: String},
    hash: { type: String},
    agency: { type: String},
    birthday: { type: String},
    tel: { type: String},
    email: { type: String},
    typeUser: { type: Number},
    createDate: { type: String},
   
});
//MemberSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Members', MemberSchema);