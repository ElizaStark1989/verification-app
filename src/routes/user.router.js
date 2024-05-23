
const { getAll, create, getOne, remove, update, verifyCode, login, getLoggedUser } = require('../controllers/user.controllers');
const express = require('express');
const verifyJWT = require('../utils/verifyJWT');

const userRouter = express.Router();

//como distinguir cuando debo crear una nueva?

userRouter.route('/users')
    .get(verifyJWT, getAll) //ejemplo esta
    .post(create);

userRouter.route('/users/verify/:code')
    .get(verifyCode)

userRouter.route('/users/login')  //ejemplo esta
    .post(login);

userRouter.route('/users/me')
    .get(verifyJWT, getLoggedUser);

userRouter.route('/users/:id')
    .get(verifyJWT, getOne)
    .delete(verifyJWT, remove)
    .put(verifyJWT, update);

module.exports = userRouter;