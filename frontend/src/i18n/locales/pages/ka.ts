import kaAuth from './ka-auth'
import kaPublic from './ka-public'
import kaDashboard from './ka-dashboard'
import kaAdmin from './ka-admin'
import kaLegal from './ka-legal'
import kaPrivacy from './ka-privacy'
import enLegal from './en-legal'

/** Georgian pages — terms & privacy localized; referral/trust from English source */
export default {
  ...kaAuth,
  ...kaPublic,
  ...kaDashboard,
  ...kaAdmin,
  ...enLegal,
  ...kaLegal,
  ...kaPrivacy,
}
