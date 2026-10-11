import arAuth from './ar-auth'
import arPublic from './ar-public'
import museumAr from './museum-ar'
import arDashboard from './ar-dashboard'
import arAdmin from './ar-admin'
import arLegal from './ar-legal'
import arRemaining from './ar-remaining'

export default {
  ...arAuth,
  ...arPublic,
  ...museumAr,
  ...arDashboard,
  ...arAdmin,
  ...arLegal,
  ...arRemaining,
}
