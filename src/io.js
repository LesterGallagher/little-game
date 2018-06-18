import { sync, getPlayer } from './game.js';
const io = require('socket.io-client/dist/socket.io.slim.js');
const room = decodeQuery(window.location.href)['room'] || 'default';

let connected = false;

const socket = io(`https://ess-server.herokuapp.com/api/little-game/no-persist-open-chat`);
socket.on('connect', () => {
    socket.emit('init', { room: 'default', nickname: getPlayer().from }, () => {
        connected = true;
        emit(getPlayer());
    });
});

socket.on('msg', data => {
    sync(data);
});

socket.on('disconnect', () => {
    connected = false;
});

export const emit = (player) => {
    if (!connected) return;
    socket.emit('msg', player);   
}

function decodeQuery(url) {
    url = url.split('?').slice(-1)[0].split('#')[0];
    var ret = {}, qKVP, qParts = url.split('&');
    for (var i = 0; i < qParts.length; i++) {
        qKVP = qParts[i].split('=');
        ret[decodeURIComponent(qKVP[0])] = decodeURIComponent(qKVP[1]);
    }
    return ret;
}