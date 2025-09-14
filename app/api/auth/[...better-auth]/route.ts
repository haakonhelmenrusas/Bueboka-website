import {auth} from "@/lib/auth";
import {toNextJsHandler} from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export { handler as GET, handler as POST, handler as DELETE, handler as PUT, handler as PATCH };