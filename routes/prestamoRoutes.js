const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  crear,
  listar,
  devolver
} = require('../controllers/prestamoController');

const router = Router();

router.use(authMiddleware);

router.get('/', listar);
router.post('/', crear);
router.put('/:id/devolucion', devolver);

module.exports = router;
