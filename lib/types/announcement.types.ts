export interface PropertyPhoto {
    propertyPhotoId: number
    propertyPhotoName: string
    propertyID: number
  }
  
  export interface PropertyType {
    propertyTypeId: number
    propertyTypeName: string
  }
  
  export interface Level {
    levelId: number
    levelName: string
  }
  
  export interface Ville {
    villeId: number
    villeName: string
  }
  
  export interface Property {
    propertyId: number
    ownerId: number
    propertyTypeID: number
    propertyLocation: number
    propertyPrice: number
    propertyArea: number
    piscine: boolean
    livingRoom: number
    bedroom: number
    garagePlace: number
    bathroom: number
    propertyLevel: number
    propertyApproved: boolean
    approvalComment: string | null
    approvalDate: string
    approverUser: number
    propertyDocTypeID: number | null
    propertyDoc: string
    createdAt: string
    updatedAt: string
    propertytype: PropertyType
    propertydoctype: any | null
    level: Level
    ville: Ville
    propertyphotos: PropertyPhoto[]
  }
  
  export interface AnnouncementType {
    announcementTypeId: number
    announcementTypeName: string
    createdAt: string
    updatedAt: string
  }
  
  export interface Announcement {
    announcementId: number
    announcementProperty: number
    announcementCode: string
    announcementTypeID: number
    propertyPrice: number
    propertyDescription: string
    announcementStatusID: number
    announcementView: number
    createdAt: string
    updatedAt: string
    property: Property
    announcementtype: AnnouncementType
    IsFavorite: boolean
    visitCount: number
  }
  
  export interface AnnouncementResponse {
    announcement: Announcement[]
  }
  
  