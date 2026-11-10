import { SafeUser } from "./index.js";

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

