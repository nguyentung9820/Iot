const homeRouter = require('./home');
const memberRouter = require('./member');

function route(app) {



    app.use('/member', memberRouter);
    app.use('/', homeRouter);


}

module.exports = route;