export interface UserRole {
    userRoleId: number
    userRoleName: string
  }
  
  export interface UserType {
    userTypeId: number
    userTypeName: string
  }
  
  export interface AccountType {
    accountTypeId: number
    accountTypeName: string
  }
  
  export interface Account {
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
    accounttype: AccountType
  }
  
  export interface User {
    userId: number
    userFirstname: string
    userLastname: string
    userPhoneNumber: string
    userEmail: string
    userCountry: number
    userAccount: number | null
    userRoleID: number
    userTypeID: number
    userProfilePhoto: string | null
    userIdCardFront: string | null
    userIdCardBack: string | null
    userIsActive: boolean
    userIdCardType: string | null
    userGender: boolean
    createdAt: string
    updatedAt: string
    userrole: UserRole
    usertype: UserType
    account: Account | null
  }
  
  