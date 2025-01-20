export interface PropertyType {
    propertyTypeId: number
    propertyTypeName: string
  }
  
  export interface PropertyLevel {
    levelId: number
    levelName: string
  }
  
  export interface PropertyDocType {
    propertyDocTypeId: number
    propertyDocTypeName: string
  }
  
  export interface Property {
    propertyId: number
    ownerId: number
    propertyTypeID: number
    propertyLocation: number
    propertyPrice: number
    propertyArea: number
    piscine: boolean
    livingRoom: number | null
    bedroom: number | null
    garagePlace: number
    bathroom: number | null
    propertyLevel: number
    propertyApproved: boolean
    approvalComment: string | null
    approvalDate: string | null
    approverUser: number | null
    propertyDocTypeID: number | null
    propertyDoc: string | null
    createdAt: string
    updatedAt: string
    propertytype: PropertyType
    propertydoctype: PropertyDocType | null
    level: PropertyLevel
    user: null
    account: {
      accountId: number
      accounTitle: string
      accountNumber: string
      accountEmail: string
      accountLogo: string | null
      accountDoc: string | null
      accountIsActive: boolean
      accountDocTypeID: number
      accountTypeID: number
      accountIsApproved: boolean
      validationComment: string | null
      createdAt: string
      updatedAt: string
      accounttype: {
        accountTypeId: number
        accountTypeName: string
      }
    }
    ville: {
      villeId:number
      villeName:string
    }
  }
  
  export interface PropertyPhoto {
    propertyPhotoId: number
    propertyPhotoName: string
    propertyID: number
  }
  
  