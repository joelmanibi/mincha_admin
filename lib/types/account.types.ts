export interface AccountType {
    accountTypeId: number
    accountTypeName: string
  }
  
  export interface Account {
    accountId: number
    accounTitle: string
    accountNumber: string
    accountEmail: string
    accountToken: string | null
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
  
  export interface AccountsResponse {
    account: Account[]
  }
  
  