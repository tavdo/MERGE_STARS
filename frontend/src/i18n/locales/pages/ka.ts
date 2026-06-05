import kaAuth from './ka-auth'
import kaPublic from './ka-public'
import kaDashboard from './ka-dashboard'
import kaAdmin from './ka-admin'
import kaLegal from './ka-legal'
import enLegal from './en-legal'

/** Georgian pages — terms localized; other legal pages still from English source */
export default {
  ...kaAuth,
  ...kaPublic,
  ...kaDashboard,
  ...kaAdmin,
  ...enLegal,
  ...kaLegal,
}
