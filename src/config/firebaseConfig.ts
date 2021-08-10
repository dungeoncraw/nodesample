import * as admin from "firebase-admin";
import { ServiceAccount } from 'firebase-admin';
import * as serviceAccount from "./firebase-adminsdk.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  databaseURL: ""
});

export { admin };