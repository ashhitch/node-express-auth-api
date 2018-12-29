export interface IApiResponse {
  status: string;
  message: string | string[];
  auth?: boolean;
}