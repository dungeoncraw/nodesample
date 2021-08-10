import { admin } from "../config/firebaseConfig";
import { CustomClaims } from "../types/CustomClaims";

export const getUserByUid = async (uid: string): Promise<admin.auth.UserRecord> => await admin.auth().getUser(uid);

export const setCustomUserClaims = async (
    uid: string,
    customClaims: CustomClaims
): Promise<void> => await admin.auth().setCustomUserClaims(uid, customClaims);