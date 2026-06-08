import arAuth from './ar-auth'
import arPublic from './ar-public'
import arDashboard from './ar-dashboard'
import arAdmin from './ar-admin'
import arLegal from './ar-legal'
import arRemaining from './ar-remaining'

export default {
  ...arAuth,
  ...arPublic,
  ...arDashboard,
  ...arAdmin,
  ...arLegal,
  ...arRemaining,
}
