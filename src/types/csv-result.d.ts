export interface CSVResult {
    data: StockData[]
    errors: Error[]
    meta: Meta
  }


  
  export interface StockData {
    Name: string
    Date: string
    notes: string
    Value: string
    Change: string
  }
  
  export interface Error {
    type: string
    code: string
    message: string
    row: number
  }
  
  export interface Meta {
    delimiter: string
    linebreak: string
    aborted: boolean
    truncated: boolean
    cursor: number
    fields: string[]
  }