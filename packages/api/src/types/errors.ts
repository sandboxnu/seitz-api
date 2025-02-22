export default class HttpError extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message);
    this.status = status;
  }
}

export class VisibilityError extends HttpError {
  constructor(message: string) {
    super(403, message);
  }
}
