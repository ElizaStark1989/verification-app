const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');
const EmailCode = require('../models/EmailCode');
const jwt = require('jsonwebtoken');

const getAll = catchError(async(req, res) => {
    const results = await User.findAll();
    return res.json(results);
});

const create = catchError(async(req, res) => {
    const  { firstName, lastName, country, image, email, password, frontBaseUrl } = req.body;
    const encriptedPassword = await bcrypt.hash(password, 10)
    const result = await User.create({
        firstName,
        lastName,
        country,
        image,
        email,
        password: encriptedPassword,
    })

    const code = require('crypto').randomBytes(32).toString('hex');
    const link = `${frontBaseUrl}/${code}`;

    await EmailCode.create({
        code: code,
        userId: result.id,
    });

    await sendEmail({
        to: email,
        subject: 'verificate email for user app',
        html: `
            <h1> Hola ${firstName} ${lastName} </h1>
            <p> Gracias por crear una cuenta con nosotros </p>
            <p> Para verificar tu email, haz clic en el siguiente enlace:</p>
            <a href="${link}">${link}</a> 
        `
    })
    return res.status(201).json(result);
});

const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.findByPk(id);
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    await User.destroy({ where: {id} });
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;
    const  { firstName, lastName, country, image, email} = req.body;
    const result = await User.update(
        { firstName, lastName, country, image, email },
        { where: {id}, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

const verifyCode = catchError(async(req, res) => {
    const { code } = req.params;
    const emailCode = await EmailCode.findOne({ where: { code: code} });
    if(!emailCode) return res.status(401).json({ message: "invalid user"});

    //otra forma verificarla
    //const user = await User.update(
    //{ isVerified: true },
    //{ where: emailCode.userId, returning: true },
    //)
    //await user.save();    

    const user = await User.findByPk(emailCode.userId);
    user.isVerified = true;
    await user.save();
    
    return res.json(emailCode);
});

const login = catchError(async(req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: {email} });
    if (!user) return res.status(401).json({ message: 'invalid credentials'});
    if(!user.isVerified)  return res.status(401).json({ message: 'user is not verified'});
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'invalid credentials'});

    const token = jwt.sign(
        { user },
        process.env.TOKEN_SECRET,
        { expiresIn: '1d' },
    );

    return res.json({ user, token });
});

const getLoggedUser = catchError(async(req, res) => {
    return res.json(req.user)
})

module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    verifyCode,
    login,
    getLoggedUser
}