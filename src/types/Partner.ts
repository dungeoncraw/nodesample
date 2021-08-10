import { ObjectId } from "mongodb"

export type Partner = {
    _id?: ObjectId,
    /**
     * firebase generated uid
     */
    fuid: string,
    femail: string,
    name: string,
    email: string,
    active: boolean,
    url: string,
    images?: PartnerImage[],
}

export type PartnerImage = {
    _id?: ObjectId,
    url: string,
    trackLink: string,
    isLogo: boolean,
}