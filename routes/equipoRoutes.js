const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar
} = require('../controllers/equipoController');

const router = Router();

router.use(authMiddleware);

router.get('/', listar);
router.get('/:id', obtener);
router.post('/', crear);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

module.exports = router;
