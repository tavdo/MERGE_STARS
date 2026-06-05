import kaAuth from './ka-auth'
import kaPublic from './ka-public'
import kaDashboard from './ka-dashboard'
import kaAdmin from './ka-admin'
import enLegal from './en-legal'

/** Georgian pages — legal sections use English source until fully localized */
export default {
  ...kaAuth,
  ...kaPublic,
  ...kaDashboard,
  ...kaAdmin,
  ...enLegal,
}
