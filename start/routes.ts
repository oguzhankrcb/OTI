/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const SharesController = () => import('#controllers/shares_controller')

// Home route - redirects to the share page
router.on('/').redirect('/share')

// Share routes
router.get('/share', [SharesController, 'index'])
router.post('/share', [SharesController, 'store'])
router.get('/share/:id', [SharesController, 'show'])
router.post('/share/:id/decrypt', [SharesController, 'decrypt'])
