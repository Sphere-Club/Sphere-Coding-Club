const express = require('express');
const router = express.Router();
const chargerController = require('../controllers/chargerController');
const reservationController = require('../controllers/reservationController');
const emergencyController = require('../controllers/emergencyController');

module.exports = (io) => {
    router.get('/chargers', chargerController.getChargers);

    // Inject IO for websocket handling in controllers
    router.post('/admin/toggle', (req, res) => chargerController.toggleCharger(req, res, io));
    router.post('/reserve', (req, res) => reservationController.createReservation(req, res, io));
    router.get('/reservation/:id', reservationController.getReservation);

    router.post('/qr/verify', reservationController.verifyQR);

    // NEW APIS
    router.post('/battery-emergency', (req, res) => emergencyController.batteryEmergency(req, res, io));
    router.post('/auto-reroute', (req, res) => emergencyController.autoReroute(req, res, io));

    return router;
};
