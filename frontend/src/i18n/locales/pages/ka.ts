import kaAuth from './ka-auth'
import kaPublic from './ka-public'
import kaDashboard from './ka-dashboard'
import kaAdmin from './ka-admin'
import kaLegal from './ka-legal'
import kaPrivacy from './ka-privacy'

/** Georgian pages — official terms (ka-legal) + privacy localized */
export default {
  ...kaAuth,
  ...kaPublic,
  ...kaDashboard,
  ...kaAdmin,
  ...kaLegal,
  ...kaPrivacy,
}
