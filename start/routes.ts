/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { throttle } from '#start/limiter'
const SharesController = () => import('#controllers/shares_controller')

// Home route - redirects to the share page
router.on('/').redirect('/share')

router
  .group(() => {
    router.get('', [SharesController, 'index'])
    router.post('', [SharesController, 'store'])
    router.get('/:id', [SharesController, 'show'])
    router.post('/:id/decrypt', [SharesController, 'decrypt'])
  })
  .prefix('/share')
  .use(throttle)
