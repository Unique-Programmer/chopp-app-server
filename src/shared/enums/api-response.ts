import { HttpStatus } from "aws-sdk/clients/lambda";

export type ApiResponse = {
    status: HttpStatus;
    message: string;
  }