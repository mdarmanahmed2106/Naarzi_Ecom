import { getAuth } from "firebase/auth";
import app from "@/lib/firebaseApp";

// Firebase sign-in. Only the sign-in window imports this, and that window is loaded on demand
// (components/SiteOverlays), so Google's sign-in scripts aren't downloaded on every page.
export const auth = getAuth(app);

export { app };
export default app;
