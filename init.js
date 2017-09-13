if (typeof importScripts !== 'function') {
    tutao.env = new tutao.Environment(tutao.Env.PROD, true, 'app.tutanota.com', null, 'https://pay.tutanota.com', '2.14.6');
    tutao.tutanota.Bootstrap.init();
}
